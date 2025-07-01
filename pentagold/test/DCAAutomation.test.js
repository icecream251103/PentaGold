const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("DCAAutomation", function () {
  let dcaAutomation;
  let tgauxToken;
  let owner;
  let user1;
  let user2;
  let feeRecipient;

  const MIN_AMOUNT = ethers.parseEther("0.01"); // $0.01
  const MAX_AMOUNT = ethers.parseEther("10000"); // $10,000
  const DAILY_FREQUENCY = 24 * 60 * 60; // 1 day in seconds
  const WEEKLY_FREQUENCY = 7 * 24 * 60 * 60; // 1 week in seconds
  const MONTHLY_FREQUENCY = 30 * 24 * 60 * 60; // 30 days in seconds

  beforeEach(async function () {
    [owner, user1, user2, feeRecipient] = await ethers.getSigners();

    // Deploy mock PGAUx token
    const PGAUx = await ethers.getContractFactory("PGAUx");
    tgauxToken = await upgrades.deployProxy(PGAUx, [
      "PentaGold Synthetic Token",
      "PGAUx",
      ethers.ZeroAddress, // Mock oracle aggregator
      ethers.ZeroAddress, // Mock circuit breaker
      feeRecipient.address
    ]);

    // Deploy DCA Automation
    const DCAAutomation = await ethers.getContractFactory("DCAAutomation");
    dcaAutomation = await upgrades.deployProxy(DCAAutomation, [
      await tgauxToken.getAddress(),
      feeRecipient.address
    ]);

    // Grant OPERATOR_ROLE to owner
    await dcaAutomation.grantRole(await dcaAutomation.OPERATOR_ROLE(), owner.address);
  });

  describe("Deployment", function () {
    it("Should set the correct initial values", async function () {
      expect(await dcaAutomation.tgauxToken()).to.equal(await tgauxToken.getAddress());
      expect(await dcaAutomation.feeRecipient()).to.equal(feeRecipient.address);
      expect(await dcaAutomation.executionFee()).to.equal(10); // 0.1%
      expect(await dcaAutomation.MIN_AMOUNT()).to.equal(MIN_AMOUNT);
      expect(await dcaAutomation.MAX_AMOUNT()).to.equal(MAX_AMOUNT);
      expect(await dcaAutomation.MIN_FREQUENCY()).to.equal(DAILY_FREQUENCY);
      expect(await dcaAutomation.MAX_FREQUENCY()).to.equal(MONTHLY_FREQUENCY);
    });

    it("Should grant correct roles to deployer", async function () {
      expect(await dcaAutomation.hasRole(await dcaAutomation.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;
      expect(await dcaAutomation.hasRole(await dcaAutomation.OPERATOR_ROLE(), owner.address)).to.be.true;
      expect(await dcaAutomation.hasRole(await dcaAutomation.UPGRADER_ROLE(), owner.address)).to.be.true;
    });
  });

  describe("DCA Plan Creation", function () {
    it("Should create a DCA plan successfully", async function () {
      const amount = ethers.parseEther("100"); // $100
      const frequency = WEEKLY_FREQUENCY;

      await expect(dcaAutomation.connect(user1).createDCAPlan(amount, frequency))
        .to.emit(dcaAutomation, "DCAPlanCreated")
        .withArgs(user1.address, 0, amount, frequency);

      const plan = await dcaAutomation.getDCAPlan(user1.address, 0);
      expect(plan.user).to.equal(user1.address);
      expect(plan.amount).to.equal(amount);
      expect(plan.frequency).to.equal(frequency);
      expect(plan.isActive).to.be.true;
      expect(plan.totalInvested).to.equal(0);
      expect(plan.totalTokensReceived).to.equal(0);
      expect(plan.executionsCount).to.equal(0);
    });

    it("Should reject plan creation with amount below minimum", async function () {
      const amount = ethers.parseEther("0.005"); // Below $0.01 minimum
      const frequency = DAILY_FREQUENCY;

      await expect(
        dcaAutomation.connect(user1).createDCAPlan(amount, frequency)
      ).to.be.revertedWithCustomError(dcaAutomation, "InvalidAmount");
    });

    it("Should reject plan creation with amount above maximum", async function () {
      const amount = ethers.parseEther("15000"); // Above $10,000 maximum
      const frequency = DAILY_FREQUENCY;

      await expect(
        dcaAutomation.connect(user1).createDCAPlan(amount, frequency)
      ).to.be.revertedWithCustomError(dcaAutomation, "InvalidAmount");
    });

    it("Should reject plan creation with invalid frequency", async function () {
      const amount = ethers.parseEther("100");
      const frequency = 12 * 60 * 60; // 12 hours (below minimum)

      await expect(
        dcaAutomation.connect(user1).createDCAPlan(amount, frequency)
      ).to.be.revertedWithCustomError(dcaAutomation, "InvalidFrequency");
    });

    it("Should allow multiple plans per user", async function () {
      const amount1 = ethers.parseEther("100");
      const amount2 = ethers.parseEther("200");
      const frequency = WEEKLY_FREQUENCY;

      await dcaAutomation.connect(user1).createDCAPlan(amount1, frequency);
      await dcaAutomation.connect(user1).createDCAPlan(amount2, frequency);

      expect(await dcaAutomation.userPlanCount(user1.address)).to.equal(2);

      const plan1 = await dcaAutomation.getDCAPlan(user1.address, 0);
      const plan2 = await dcaAutomation.getDCAPlan(user1.address, 1);

      expect(plan1.amount).to.equal(amount1);
      expect(plan2.amount).to.equal(amount2);
    });
  });

  describe("DCA Plan Management", function () {
    beforeEach(async function () {
      const amount = ethers.parseEther("100");
      const frequency = WEEKLY_FREQUENCY;
      await dcaAutomation.connect(user1).createDCAPlan(amount, frequency);
    });

    it("Should update DCA plan successfully", async function () {
      const newAmount = ethers.parseEther("150");
      const newFrequency = MONTHLY_FREQUENCY;

      await expect(dcaAutomation.connect(user1).updateDCAPlan(0, newAmount, newFrequency))
        .to.emit(dcaAutomation, "DCAPlanUpdated")
        .withArgs(user1.address, 0, newAmount, newFrequency);

      const plan = await dcaAutomation.getDCAPlan(user1.address, 0);
      expect(plan.amount).to.equal(newAmount);
      expect(plan.frequency).to.equal(newFrequency);
    });

    it("Should pause DCA plan", async function () {
      await expect(dcaAutomation.connect(user1).pauseDCAPlan(0))
        .to.emit(dcaAutomation, "DCAPlanPaused")
        .withArgs(user1.address, 0);

      const plan = await dcaAutomation.getDCAPlan(user1.address, 0);
      expect(plan.isActive).to.be.false;
    });

    it("Should resume paused DCA plan", async function () {
      await dcaAutomation.connect(user1).pauseDCAPlan(0);

      await expect(dcaAutomation.connect(user1).resumeDCAPlan(0))
        .to.emit(dcaAutomation, "DCAPlanResumed")
        .withArgs(user1.address, 0);

      const plan = await dcaAutomation.getDCAPlan(user1.address, 0);
      expect(plan.isActive).to.be.true;
    });

    it("Should cancel DCA plan", async function () {
      await expect(dcaAutomation.connect(user1).cancelDCAPlan(0))
        .to.emit(dcaAutomation, "DCAPlanCancelled")
        .withArgs(user1.address, 0);

      const plan = await dcaAutomation.getDCAPlan(user1.address, 0);
      expect(plan.isActive).to.be.false;
    });

    it("Should reject operations on non-existent plans", async function () {
      await expect(
        dcaAutomation.connect(user1).updateDCAPlan(1, ethers.parseEther("100"), WEEKLY_FREQUENCY)
      ).to.be.revertedWithCustomError(dcaAutomation, "PlanNotFound");

      await expect(
        dcaAutomation.connect(user1).pauseDCAPlan(1)
      ).to.be.revertedWithCustomError(dcaAutomation, "PlanNotFound");
    });

    it("Should reject operations by unauthorized users", async function () {
      await expect(
        dcaAutomation.connect(user2).updateDCAPlan(0, ethers.parseEther("100"), WEEKLY_FREQUENCY)
      ).to.be.revertedWithCustomError(dcaAutomation, "Unauthorized");

      await expect(
        dcaAutomation.connect(user2).pauseDCAPlan(0)
      ).to.be.revertedWithCustomError(dcaAutomation, "Unauthorized");
    });
  });

  describe("DCA Execution", function () {
    beforeEach(async function () {
      const amount = ethers.parseEther("100");
      const frequency = DAILY_FREQUENCY;
      await dcaAutomation.connect(user1).createDCAPlan(amount, frequency);
    });

    it("Should execute DCA plan successfully", async function () {
      // Fast forward time to make plan eligible
      await ethers.provider.send("evm_increaseTime", [DAILY_FREQUENCY + 1]);
      await ethers.provider.send("evm_mine");

      await expect(dcaAutomation.connect(owner).executeDCA(user1.address, 0))
        .to.emit(dcaAutomation, "DCAExecuted");

      const plan = await dcaAutomation.getDCAPlan(user1.address, 0);
      expect(plan.executionsCount).to.equal(1);
      expect(plan.totalInvested).to.equal(ethers.parseEther("100"));
      expect(plan.lastExecution).to.be.gt(0);
    });

    it("Should reject execution of inactive plan", async function () {
      await dcaAutomation.connect(user1).pauseDCAPlan(0);

      await expect(
        dcaAutomation.connect(owner).executeDCA(user1.address, 0)
      ).to.be.revertedWithCustomError(dcaAutomation, "PlanNotActive");
    });

    it("Should reject execution before due time", async function () {
      await expect(
        dcaAutomation.connect(owner).executeDCA(user1.address, 0)
      ).to.be.revertedWithCustomError(dcaAutomation, "ExecutionNotDue");
    });

    it("Should reject execution by non-operator", async function () {
      await ethers.provider.send("evm_increaseTime", [DAILY_FREQUENCY + 1]);
      await ethers.provider.send("evm_mine");

      await expect(
        dcaAutomation.connect(user1).executeDCA(user1.address, 0)
      ).to.be.reverted;
    });

    it("Should execute all eligible plans for a user", async function () {
      // Create second plan
      await dcaAutomation.connect(user1).createDCAPlan(ethers.parseEther("200"), WEEKLY_FREQUENCY);

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [DAILY_FREQUENCY + 1]);
      await ethers.provider.send("evm_mine");

      await expect(dcaAutomation.connect(owner).executeAllDCA(user1.address))
        .to.emit(dcaAutomation, "DCAExecuted");

      const plan1 = await dcaAutomation.getDCAPlan(user1.address, 0);
      const plan2 = await dcaAutomation.getDCAPlan(user1.address, 1);

      expect(plan1.executionsCount).to.equal(1);
      expect(plan2.executionsCount).to.equal(0); // Not due yet
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await dcaAutomation.connect(user1).createDCAPlan(ethers.parseEther("100"), WEEKLY_FREQUENCY);
      await dcaAutomation.connect(user1).createDCAPlan(ethers.parseEther("200"), MONTHLY_FREQUENCY);
    });

    it("Should return all user plans", async function () {
      const plans = await dcaAutomation.getUserPlans(user1.address);
      expect(plans.length).to.equal(2);
      expect(plans[0].amount).to.equal(ethers.parseEther("100"));
      expect(plans[1].amount).to.equal(ethers.parseEther("200"));
    });

    it("Should return eligible plans", async function () {
      // Fast forward time to make first plan eligible
      await ethers.provider.send("evm_increaseTime", [WEEKLY_FREQUENCY + 1]);
      await ethers.provider.send("evm_mine");

      const eligiblePlans = await dcaAutomation.getEligiblePlans(user1.address);
      expect(eligiblePlans.length).to.equal(1);
      expect(eligiblePlans[0]).to.equal(0);
    });

    it("Should return correct plan count", async function () {
      expect(await dcaAutomation.userPlanCount(user1.address)).to.equal(2);
      expect(await dcaAutomation.userPlanCount(user2.address)).to.equal(0);
    });
  });

  describe("Admin Functions", function () {
    it("Should update execution fee", async function () {
      const newFee = 20; // 0.2%
      await expect(dcaAutomation.connect(owner).updateExecutionFee(newFee))
        .to.emit(dcaAutomation, "ExecutionFeeUpdated")
        .withArgs(newFee);

      expect(await dcaAutomation.executionFee()).to.equal(newFee);
    });

    it("Should update fee recipient", async function () {
      await expect(dcaAutomation.connect(owner).updateFeeRecipient(user2.address))
        .to.emit(dcaAutomation, "FeeRecipientUpdated")
        .withArgs(user2.address);

      expect(await dcaAutomation.feeRecipient()).to.equal(user2.address);
    });

    it("Should pause and unpause contract", async function () {
      await dcaAutomation.connect(owner).pause();
      expect(await dcaAutomation.paused()).to.be.true;

      await dcaAutomation.connect(owner).unpause();
      expect(await dcaAutomation.paused()).to.be.false;
    });

    it("Should reject admin operations by non-admin", async function () {
      await expect(
        dcaAutomation.connect(user1).updateExecutionFee(20)
      ).to.be.reverted;

      await expect(
        dcaAutomation.connect(user1).updateFeeRecipient(user2.address)
      ).to.be.reverted;

      await expect(
        dcaAutomation.connect(user1).pause()
      ).to.be.reverted;
    });
  });

  describe("Edge Cases", function () {
    it("Should handle multiple executions correctly", async function () {
      const amount = ethers.parseEther("100");
      const frequency = DAILY_FREQUENCY;
      await dcaAutomation.connect(user1).createDCAPlan(amount, frequency);

      // Execute multiple times
      for (let i = 0; i < 3; i++) {
        await ethers.provider.send("evm_increaseTime", [DAILY_FREQUENCY + 1]);
        await ethers.provider.send("evm_mine");
        await dcaAutomation.connect(owner).executeDCA(user1.address, 0);
      }

      const plan = await dcaAutomation.getDCAPlan(user1.address, 0);
      expect(plan.executionsCount).to.equal(3);
      expect(plan.totalInvested).to.equal(ethers.parseEther("300"));
    });

    it("Should handle plan updates between executions", async function () {
      const amount = ethers.parseEther("100");
      const frequency = DAILY_FREQUENCY;
      await dcaAutomation.connect(user1).createDCAPlan(amount, frequency);

      // Fast forward and execute
      await ethers.provider.send("evm_increaseTime", [DAILY_FREQUENCY + 1]);
      await ethers.provider.send("evm_mine");
      await dcaAutomation.connect(owner).executeDCA(user1.address, 0);

      // Update plan
      await dcaAutomation.connect(user1).updateDCAPlan(0, ethers.parseEther("150"), WEEKLY_FREQUENCY);

      // Fast forward and execute again
      await ethers.provider.send("evm_increaseTime", [WEEKLY_FREQUENCY + 1]);
      await ethers.provider.send("evm_mine");
      await dcaAutomation.connect(owner).executeDCA(user1.address, 0);

      const plan = await dcaAutomation.getDCAPlan(user1.address, 0);
      expect(plan.executionsCount).to.equal(2);
      expect(plan.totalInvested).to.equal(ethers.parseEther("250")); // 100 + 150
    });
  });
}); 