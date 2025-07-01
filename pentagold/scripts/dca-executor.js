const { ethers } = require("hardhat");

/**
 * DCA Execution Bot
 * 
 * This bot monitors and executes DCA plans automatically.
 * It should be run as a cron job or background service.
 * 
 * Usage:
 * - For testing: npx hardhat run scripts/dca-executor.js --network localhost
 * - For production: Set up as a cron job or use a service like AWS Lambda
 */

async function executeDCA() {
    console.log("🤖 Starting DCA Execution Bot...\n");

    const [deployer] = await ethers.getSigners();
    console.log("📝 Executing with account:", deployer.address);

    try {
        // Get contract instances
        const dcaAutomation = await ethers.getContract("DCAAutomation");
        const pgaux = await ethers.getContract("PGAUx");
        
        console.log("📊 DCA Automation Address:", await dcaAutomation.getAddress());
        console.log("📊 PGAUx Token Address:", await pgaux.getAddress());

        // Get all users with DCA plans
        console.log("\n🔍 Scanning for users with DCA plans...");
        
        // Note: In a real implementation, you would need to track users with plans
        // For this demo, we'll use a simple approach
        // In production, you might want to:
        // 1. Maintain a database of users with active plans
        // 2. Use events to track plan creation/cancellation
        // 3. Use a more sophisticated indexing system
        
        // For now, let's check if there are any plans by trying to get plans for the deployer
        const deployerPlanCount = await dcaAutomation.userPlanCount(deployer.address);
        console.log(`📊 Deployer has ${deployerPlanCount} DCA plans`);

        if (deployerPlanCount > 0) {
            // Get eligible plans for deployer
            const eligiblePlans = await dcaAutomation.getEligiblePlans(deployer.address);
            console.log(`📊 Found ${eligiblePlans.length} eligible plans for deployer`);

            // Execute each eligible plan
            for (const planId of eligiblePlans) {
                try {
                    console.log(`\n🔄 Executing DCA plan ${planId} for deployer...`);
                    
                    const plan = await dcaAutomation.getDCAPlan(deployer.address, planId);
                    console.log(`📊 Plan Details:`);
                    console.log(`   - Amount: ${ethers.formatEther(plan.amount)} USD`);
                    console.log(`   - Frequency: ${plan.frequency} seconds`);
                    console.log(`   - Total Invested: ${ethers.formatEther(plan.totalInvested)} USD`);
                    console.log(`   - Executions: ${plan.executionsCount}`);

                    // Execute the DCA
                    const tx = await dcaAutomation.executeDCA(deployer.address, planId);
                    console.log(`⏳ Transaction sent: ${tx.hash}`);
                    
                    // Wait for confirmation
                    const receipt = await tx.wait();
                    console.log(`✅ DCA execution confirmed in block ${receipt.blockNumber}`);
                    
                    // Get updated plan info
                    const updatedPlan = await dcaAutomation.getDCAPlan(deployer.address, planId);
                    console.log(`📊 Updated Plan:`);
                    console.log(`   - Total Invested: ${ethers.formatEther(updatedPlan.totalInvested)} USD`);
                    console.log(`   - Total Tokens: ${ethers.formatEther(updatedPlan.totalTokensReceived)} PGAUx`);
                    console.log(`   - Executions: ${updatedPlan.executionsCount}`);
                    console.log(`   - Next Execution: ${new Date(Number(updatedPlan.nextExecution) * 1000).toISOString()}`);

                } catch (error) {
                    console.error(`❌ Failed to execute DCA plan ${planId}:`, error.message);
                }
            }
        }

        // In a real implementation, you would:
        // 1. Query a database or index for all users with active plans
        // 2. Check each user's eligible plans
        // 3. Execute DCA for each eligible plan
        // 4. Log results and handle errors gracefully
        
        console.log("\n🎉 DCA execution cycle completed!");

    } catch (error) {
        console.error("❌ DCA execution failed:", error);
        throw error;
    }
}

/**
 * Monitor DCA Statistics
 */
async function monitorDCAStats() {
    console.log("📊 DCA Statistics Monitor...\n");

    try {
        const dcaAutomation = await ethers.getContract("DCAAutomation");
        
        // Get contract statistics
        const executionFee = await dcaAutomation.executionFee();
        const feeRecipient = await dcaAutomation.feeRecipient();
        
        console.log("📊 DCA Contract Statistics:");
        console.log(`   - Execution Fee: ${executionFee} basis points (${executionFee / 100}%)`);
        console.log(`   - Fee Recipient: ${feeRecipient}`);
        console.log(`   - Min Amount: ${ethers.formatEther(await dcaAutomation.MIN_AMOUNT())} USD`);
        console.log(`   - Max Amount: ${ethers.formatEther(await dcaAutomation.MAX_AMOUNT())} USD`);
        console.log(`   - Min Frequency: ${await dcaAutomation.MIN_FREQUENCY()} seconds`);
        console.log(`   - Max Frequency: ${await dcaAutomation.MAX_FREQUENCY()} seconds`);

    } catch (error) {
        console.error("❌ Failed to get DCA statistics:", error);
    }
}

/**
 * Create a sample DCA plan for testing
 */
async function createSamplePlan() {
    console.log("🧪 Creating sample DCA plan for testing...\n");

    try {
        const dcaAutomation = await ethers.getContract("DCAAutomation");
        const [deployer] = await ethers.getSigners();

        // Create a weekly DCA plan for $100
        const amount = ethers.parseEther("100"); // $100
        const frequency = 7 * 24 * 60 * 60; // 1 week

        console.log(`📝 Creating DCA plan:`);
        console.log(`   - Amount: ${ethers.formatEther(amount)} USD`);
        console.log(`   - Frequency: ${frequency} seconds (1 week)`);
        console.log(`   - User: ${deployer.address}`);

        const tx = await dcaAutomation.createDCAPlan(amount, frequency);
        console.log(`⏳ Transaction sent: ${tx.hash}`);
        
        const receipt = await tx.wait();
        console.log(`✅ DCA plan created in block ${receipt.blockNumber}`);

        // Get the created plan
        const planCount = await dcaAutomation.userPlanCount(deployer.address);
        const plan = await dcaAutomation.getDCAPlan(deployer.address, planCount - 1);
        
        console.log(`📊 Created Plan Details:`);
        console.log(`   - Plan ID: ${planCount - 1}`);
        console.log(`   - Amount: ${ethers.formatEther(plan.amount)} USD`);
        console.log(`   - Frequency: ${plan.frequency} seconds`);
        console.log(`   - Active: ${plan.isActive}`);
        console.log(`   - Next Execution: ${new Date(Number(plan.nextExecution) * 1000).toISOString()}`);

    } catch (error) {
        console.error("❌ Failed to create sample DCA plan:", error);
    }
}

/**
 * Main execution function
 */
async function main() {
    const command = process.argv[2];

    switch (command) {
        case "execute":
            await executeDCA();
            break;
        case "stats":
            await monitorDCAStats();
            break;
        case "create-sample":
            await createSamplePlan();
            break;
        default:
            console.log("🤖 DCA Bot Commands:");
            console.log("   execute       - Execute eligible DCA plans");
            console.log("   stats         - Show DCA contract statistics");
            console.log("   create-sample - Create a sample DCA plan for testing");
            console.log("\nUsage: npx hardhat run scripts/dca-executor.js --network <network> <command>");
            break;
    }
}

// Handle execution
main()
    .then(() => {
        console.log("\n✅ DCA bot operation completed!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ DCA bot operation failed:");
        console.error(error);
        process.exit(1);
    }); 