const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("PGAUx Token", function () {
    let pgaux, oracleAggregator, circuitBreaker, timelock;
    let owner, user1, user2, feeRecipient;
    let deployer;

    const INITIAL_PRICE = ethers.utils.parseEther("3350"); // $3350 per oz
    const MINT_FEE = 50; // 0.5%
    const REDEEM_FEE = 50; // 0.5%

    beforeEach(async function () {
        [owner, user1, user2, feeRecipient] = await ethers.getSigners();

        // Deploy Circuit Breaker
        const CircuitBreaker = await ethers.getContractFactory("CircuitBreaker");
        circuitBreaker = await CircuitBreaker.deploy(
            500, // 5% deviation threshold
            300, // 5 minute time window
            3600 // 1 hour cooldown
        );

        // Deploy Oracle Aggregator
        const OracleAggregator = await ethers.getContractFactory("OracleAggregator");
        oracleAggregator = await OracleAggregator.deploy();

        // Deploy Timelock
        const PentaGoldTimelock = await ethers.getContractFactory("PentaGoldTimelock");
        timelock = await PentaGoldTimelock.deploy(
            [owner.address], // proposers
            [owner.address], // executors
            owner.address    // admin
        );

        // Deploy PGAUx as upgradeable proxy
        const PGAUx = await ethers.getContractFactory("PGAUx");
        pgaux = await upgrades.deployProxy(PGAUx, [
            "PGAUx",
            "TGAUx",
            oracleAggregator.address,
            circuitBreaker.address,
            feeRecipient.address
        ], { initializer: 'initialize' });

        // Grant roles
        await circuitBreaker.grantRole(
            await circuitBreaker.CIRCUIT_MANAGER_ROLE(),
            pgaux.address
        );
    });

    describe("Deployment", function () {
        it("Should set the correct name and symbol", async function () {
            expect(await pgaux.name()).to.equal("PentaGold");
            expect(await pgaux.symbol()).to.equal("PGAUx");
        });

        it("Should set the correct initial parameters", async function () {
            expect(await pgaux.mintFee()).to.equal(MINT_FEE);
            expect(await pgaux.redeemFee()).to.equal(REDEEM_FEE);
            expect(await pgaux.feeRecipient()).to.equal(feeRecipient.address);
        });

        it("Should grant correct roles to deployer", async function () {
            const DEFAULT_ADMIN_ROLE = await pgaux.DEFAULT_ADMIN_ROLE();
            const MINTER_ROLE = await pgaux.MINTER_ROLE();
            const PAUSER_ROLE = await pgaux.PAUSER_ROLE();

            expect(await pgaux.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
            expect(await pgaux.hasRole(MINTER_ROLE, owner.address)).to.be.true;
            expect(await pgaux.hasRole(PAUSER_ROLE, owner.address)).to.be.true;
        });
    });

    describe("Minting", function () {
        beforeEach(async function () {
            // Mock oracle price
            await oracleAggregator.updateAggregatedPrice();
        });

        it("Should mint tokens correctly", async function () {
            const usdAmount = ethers.utils.parseEther("1000"); // $1000
            const expectedTokens = usdAmount.div(INITIAL_PRICE.div(ethers.utils.parseEther("1")));
            const fee = expectedTokens.mul(MINT_FEE).div(10000);
            const tokensAfterFee = expectedTokens.sub(fee);

            await expect(pgaux.connect(user1).mint(usdAmount, tokensAfterFee))
                .to.emit(pgaux, "Mint")
                .withArgs(user1.address, usdAmount, tokensAfterFee, fee);

            expect(await pgaux.balanceOf(user1.address)).to.equal(tokensAfterFee);
            expect(await pgaux.balanceOf(feeRecipient.address)).to.equal(fee);
        });

        it("Should reject minting below minimum amount", async function () {
            const tooSmallAmount = ethers.utils.parseEther("0.0001");
            
            await expect(pgaux.connect(user1).mint(tooSmallAmount, 0))
                .to.be.revertedWithCustomError(pgaux, "InvalidAmount");
        });

        it("Should reject minting above maximum amount", async function () {
            const tooLargeAmount = ethers.utils.parseEther("2000000"); // 2M USD
            
            await expect(pgaux.connect(user1).mint(tooLargeAmount, 0))
                .to.be.revertedWithCustomError(pgaux, "InvalidAmount");
        });

        it("Should respect slippage protection", async function () {
            const usdAmount = ethers.utils.parseEther("1000");
            const tooHighMinTokens = ethers.utils.parseEther("1000"); // Unrealistic expectation
            
            await expect(pgaux.connect(user1).mint(usdAmount, tooHighMinTokens))
                .to.be.revertedWithCustomError(pgaux, "InvalidAmount");
        });
    });

    describe("Redeeming", function () {
        beforeEach(async function () {
            // Setup: mint some tokens first
            await oracleAggregator.updateAggregatedPrice();
            const usdAmount = ethers.utils.parseEther("1000");
            const expectedTokens = usdAmount.div(INITIAL_PRICE.div(ethers.utils.parseEther("1")));
            const fee = expectedTokens.mul(MINT_FEE).div(10000);
            const tokensAfterFee = expectedTokens.sub(fee);
            
            await pgaux.connect(user1).mint(usdAmount, tokensAfterFee);
        });

        it("Should redeem tokens correctly", async function () {
            const tokenAmount = ethers.utils.parseEther("0.1");
            const expectedUsd = tokenAmount.mul(INITIAL_PRICE).div(ethers.utils.parseEther("1"));
            const fee = expectedUsd.mul(REDEEM_FEE).div(10000);
            const usdAfterFee = expectedUsd.sub(fee);

            const initialBalance = await pgaux.balanceOf(user1.address);

            await expect(pgaux.connect(user1).redeem(tokenAmount, usdAfterFee))
                .to.emit(pgaux, "Redeem")
                .withArgs(user1.address, tokenAmount, usdAfterFee, fee);

            expect(await pgaux.balanceOf(user1.address)).to.equal(initialBalance.sub(tokenAmount));
        });

        it("Should reject redeeming more than balance", async function () {
            const balance = await pgaux.balanceOf(user1.address);
            const tooMuchTokens = balance.add(ethers.utils.parseEther("1"));
            
            await expect(pgaux.connect(user1).redeem(tooMuchTokens, 0))
                .to.be.revertedWithCustomError(pgaux, "InsufficientBalance");
        });

        it("Should respect slippage protection on redeem", async function () {
            const tokenAmount = ethers.utils.parseEther("0.1");
            const tooHighMinUsd = ethers.utils.parseEther("1000"); // Unrealistic expectation
            
            await expect(pgaux.connect(user1).redeem(tokenAmount, tooHighMinUsd))
                .to.be.revertedWithCustomError(pgaux, "InvalidAmount");
        });
    });

    describe("Emergency Functions", function () {
        it("Should allow emergency pause", async function () {
            await expect(pgaux.emergencyPause("Test emergency"))
                .to.emit(pgaux, "EmergencyModeActivated")
                .withArgs(owner.address, "Test emergency");

            expect(await pgaux.emergencyMode()).to.be.true;
            expect(await pgaux.paused()).to.be.true;
        });

        it("Should prevent operations during emergency", async function () {
            await pgaux.emergencyPause("Test emergency");
            
            await expect(pgaux.connect(user1).mint(ethers.utils.parseEther("100"), 0))
                .to.be.revertedWithCustomError(pgaux, "EmergencyModeActive");
        });

        it("Should allow deactivating emergency mode", async function () {
            await pgaux.emergencyPause("Test emergency");
            
            await expect(pgaux.deactivateEmergency())
                .to.emit(pgaux, "EmergencyModeDeactivated")
                .withArgs(owner.address);

            expect(await pgaux.emergencyMode()).to.be.false;
            expect(await pgaux.paused()).to.be.false;
        });
    });

    describe("Access Control", function () {
        it("Should prevent unauthorized fee updates", async function () {
            await expect(pgaux.connect(user1).updateFees(100, 100))
                .to.be.revertedWith("AccessControl:");
        });

        it("Should allow authorized fee updates", async function () {
            await expect(pgaux.updateFees(100, 100))
                .to.emit(pgaux, "FeesUpdated")
                .withArgs(100, 100);

            expect(await pgaux.mintFee()).to.equal(100);
            expect(await pgaux.redeemFee()).to.equal(100);
        });

        it("Should prevent setting fees too high", async function () {
            await expect(pgaux.updateFees(1001, 100))
                .to.be.revertedWith("Fee too high");
        });
    });

    describe("Circuit Breaker Integration", function () {
        it("Should respect circuit breaker triggers", async function () {
            // Trigger circuit breaker by simulating extreme price movement
            await circuitBreaker.checkPrice(INITIAL_PRICE.mul(2)); // 100% increase
            
            await expect(pgaux.connect(user1).mint(ethers.utils.parseEther("100"), 0))
                .to.be.revertedWithCustomError(pgaux, "CircuitBreakerActive");
        });
    });

    describe("Upgradeability", function () {
        it("Should be upgradeable by authorized role", async function () {
            const PGAUxV2 = await ethers.getContractFactory("PGAUx");
            const upgraded = await upgrades.upgradeProxy(pgaux.address, PGAUxV2);
            
            expect(await upgraded.version()).to.equal("1.0.0");
        });

        it("Should prevent unauthorized upgrades", async function () {
            const UPGRADER_ROLE = await pgaux.UPGRADER_ROLE();
            await pgaux.revokeRole(UPGRADER_ROLE, owner.address);
            
            const PGAUxV2 = await ethers.getContractFactory("PGAUx");
            await expect(upgrades.upgradeProxy(pgaux.address, PGAUxV2))
                .to.be.revertedWith("AccessControl:");
        });
    });

    describe("Oracle Integration", function () {
        it("Should get current price from oracle", async function () {
            const [price, timestamp] = await pgaux.getCurrentPrice();
            expect(price).to.be.gt(0);
            expect(timestamp).to.be.gt(0);
        });

        it("Should update oracle aggregator", async function () {
            const newAggregator = await ethers.getContractFactory("OracleAggregator");
            const newAggregatorInstance = await newAggregator.deploy();

            await expect(pgaux.updateOracleAggregator(newAggregatorInstance.address))
                .to.emit(pgaux, "OracleAggregatorUpdated")
                .withArgs(newAggregatorInstance.address);

            expect(await pgaux.oracleAggregator()).to.equal(newAggregatorInstance.address);
        });
    });
});