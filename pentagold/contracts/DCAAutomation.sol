// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./TGAUx.sol";

/**
 * @title DCAAutomation - Dollar-Cost Averaging Automation
 * @dev Automated DCA system for PGAUx token purchases
 * @author PentaGold Team
 */
contract DCAAutomation is 
    Initializable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    // Role definitions
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // DCA Plan structure
    struct DCAPlan {
        address user;
        uint256 amount; // Amount in USD (wei precision)
        uint256 frequency; // Frequency in seconds (daily, weekly, monthly)
        uint256 lastExecution;
        uint256 nextExecution;
        bool isActive;
        uint256 totalInvested;
        uint256 totalTokensReceived;
        uint256 executionsCount;
    }

    // State variables
    PGAUx public tgauxToken;
    uint256 public constant MIN_AMOUNT = 1e16; // $0.01 minimum
    uint256 public constant MAX_AMOUNT = 10000e18; // $10,000 maximum
    uint256 public constant MIN_FREQUENCY = 1 days;
    uint256 public constant MAX_FREQUENCY = 30 days;
    
    uint256 public executionFee; // Fee for each DCA execution (in basis points)
    address public feeRecipient;
    
    // Mapping from user to their DCA plans
    mapping(address => DCAPlan[]) public userPlans;
    mapping(address => uint256) public userPlanCount;
    
    // Events
    event DCAPlanCreated(
        address indexed user, 
        uint256 planId, 
        uint256 amount, 
        uint256 frequency
    );
    event DCAPlanUpdated(
        address indexed user, 
        uint256 planId, 
        uint256 amount, 
        uint256 frequency
    );
    event DCAPlanPaused(address indexed user, uint256 planId);
    event DCAPlanResumed(address indexed user, uint256 planId);
    event DCAPlanCancelled(address indexed user, uint256 planId);
    event DCAExecuted(
        address indexed user, 
        uint256 planId, 
        uint256 usdAmount, 
        uint256 tokensReceived,
        uint256 fee
    );
    event ExecutionFeeUpdated(uint256 newFee);
    event FeeRecipientUpdated(address indexed newRecipient);

    // Errors
    error InvalidAmount();
    error InvalidFrequency();
    error PlanNotFound();
    error PlanNotActive();
    error ExecutionNotDue();
    error InsufficientBalance();
    error Unauthorized();

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initialize the contract
     * @param _tgauxToken PGAUx token contract address
     * @param _feeRecipient Address to receive execution fees
     */
    function initialize(
        address _tgauxToken,
        address _feeRecipient
    ) public initializer {
        __ReentrancyGuard_init();
        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        // Grant roles to deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);

        tgauxToken = PGAUx(_tgauxToken);
        feeRecipient = _feeRecipient;
        executionFee = 10; // 0.1% fee per execution
    }

    /**
     * @dev Create a new DCA plan
     * @param amount Amount in USD (wei precision)
     * @param frequency Frequency in seconds
     */
    function createDCAPlan(uint256 amount, uint256 frequency) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
            revert InvalidAmount();
        }
        if (frequency < MIN_FREQUENCY || frequency > MAX_FREQUENCY) {
            revert InvalidFrequency();
        }

        uint256 planId = userPlanCount[msg.sender];
        uint256 nextExecution = block.timestamp + frequency;

        DCAPlan memory newPlan = DCAPlan({
            user: msg.sender,
            amount: amount,
            frequency: frequency,
            lastExecution: 0,
            nextExecution: nextExecution,
            isActive: true,
            totalInvested: 0,
            totalTokensReceived: 0,
            executionsCount: 0
        });

        userPlans[msg.sender].push(newPlan);
        userPlanCount[msg.sender]++;

        emit DCAPlanCreated(msg.sender, planId, amount, frequency);
    }

    /**
     * @dev Update an existing DCA plan
     * @param planId ID of the plan to update
     * @param amount New amount in USD (wei precision)
     * @param frequency New frequency in seconds
     */
    function updateDCAPlan(uint256 planId, uint256 amount, uint256 frequency) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        if (planId >= userPlanCount[msg.sender]) revert PlanNotFound();
        if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) revert InvalidAmount();
        if (frequency < MIN_FREQUENCY || frequency > MAX_FREQUENCY) revert InvalidFrequency();

        DCAPlan storage plan = userPlans[msg.sender][planId];
        if (plan.user != msg.sender) revert Unauthorized();

        plan.amount = amount;
        plan.frequency = frequency;

        emit DCAPlanUpdated(msg.sender, planId, amount, frequency);
    }

    /**
     * @dev Pause a DCA plan
     * @param planId ID of the plan to pause
     */
    function pauseDCAPlan(uint256 planId) external whenNotPaused {
        if (planId >= userPlanCount[msg.sender]) revert PlanNotFound();

        DCAPlan storage plan = userPlans[msg.sender][planId];
        if (plan.user != msg.sender) revert Unauthorized();

        plan.isActive = false;
        emit DCAPlanPaused(msg.sender, planId);
    }

    /**
     * @dev Resume a paused DCA plan
     * @param planId ID of the plan to resume
     */
    function resumeDCAPlan(uint256 planId) external whenNotPaused {
        if (planId >= userPlanCount[msg.sender]) revert PlanNotFound();

        DCAPlan storage plan = userPlans[msg.sender][planId];
        if (plan.user != msg.sender) revert Unauthorized();

        plan.isActive = true;
        plan.nextExecution = block.timestamp + plan.frequency;
        
        emit DCAPlanResumed(msg.sender, planId);
    }

    /**
     * @dev Cancel a DCA plan
     * @param planId ID of the plan to cancel
     */
    function cancelDCAPlan(uint256 planId) external whenNotPaused {
        if (planId >= userPlanCount[msg.sender]) revert PlanNotFound();

        DCAPlan storage plan = userPlans[msg.sender][planId];
        if (plan.user != msg.sender) revert Unauthorized();

        plan.isActive = false;
        emit DCAPlanCancelled(msg.sender, planId);
    }

    /**
     * @dev Execute DCA for a specific plan
     * @param user Address of the user
     * @param planId ID of the plan to execute
     */
    function executeDCA(address user, uint256 planId) 
        external 
        nonReentrant 
        whenNotPaused 
        onlyRole(OPERATOR_ROLE) 
    {
        if (planId >= userPlanCount[user]) revert PlanNotFound();

        DCAPlan storage plan = userPlans[user][planId];
        if (!plan.isActive) revert PlanNotActive();
        if (block.timestamp < plan.nextExecution) revert ExecutionNotDue();

        // Execute the DCA purchase
        uint256 usdAmount = plan.amount;
        uint256 fee = (usdAmount * executionFee) / 10000;
        uint256 purchaseAmount = usdAmount - fee;

        // Calculate minimum tokens to receive (0.5% slippage)
        uint256 minTokensOut = (purchaseAmount * 995) / 1000;

        // Execute mint through PGAUx contract
        try tgauxToken.mint(purchaseAmount, minTokensOut) {
            // Update plan statistics
            plan.lastExecution = block.timestamp;
            plan.nextExecution = block.timestamp + plan.frequency;
            plan.totalInvested += usdAmount;
            plan.totalTokensReceived += minTokensOut;
            plan.executionsCount++;

            emit DCAExecuted(user, planId, usdAmount, minTokensOut, fee);
        } catch {
            // If mint fails, don't update the plan
            revert("DCA execution failed");
        }
    }

    /**
     * @dev Execute DCA for all eligible plans of a user
     * @param user Address of the user
     */
    function executeAllDCA(address user) 
        external 
        nonReentrant 
        whenNotPaused 
        onlyRole(OPERATOR_ROLE) 
    {
        uint256 planCount = userPlanCount[user];
        
        for (uint256 i = 0; i < planCount; i++) {
            DCAPlan storage plan = userPlans[user][i];
            
            if (plan.isActive && block.timestamp >= plan.nextExecution) {
                try this.executeDCA(user, i) {
                    // Execution successful
                } catch {
                    // Continue with next plan if one fails
                    continue;
                }
            }
        }
    }

    /**
     * @dev Get all DCA plans for a user
     * @param user Address of the user
     * @return Array of DCA plans
     */
    function getUserPlans(address user) external view returns (DCAPlan[] memory) {
        uint256 count = userPlanCount[user];
        DCAPlan[] memory plans = new DCAPlan[](count);
        
        for (uint256 i = 0; i < count; i++) {
            plans[i] = userPlans[user][i];
        }
        
        return plans;
    }

    /**
     * @dev Get a specific DCA plan
     * @param user Address of the user
     * @param planId ID of the plan
     * @return DCA plan details
     */
    function getDCAPlan(address user, uint256 planId) external view returns (DCAPlan memory) {
        if (planId >= userPlanCount[user]) revert PlanNotFound();
        return userPlans[user][planId];
    }

    /**
     * @dev Get eligible plans for execution
     * @param user Address of the user
     * @return Array of plan IDs that are eligible for execution
     */
    function getEligiblePlans(address user) external view returns (uint256[] memory) {
        uint256 count = userPlanCount[user];
        uint256[] memory eligible = new uint256[](count);
        uint256 eligibleCount = 0;
        
        for (uint256 i = 0; i < count; i++) {
            DCAPlan storage plan = userPlans[user][i];
            if (plan.isActive && block.timestamp >= plan.nextExecution) {
                eligible[eligibleCount] = i;
                eligibleCount++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](eligibleCount);
        for (uint256 i = 0; i < eligibleCount; i++) {
            result[i] = eligible[i];
        }
        
        return result;
    }

    /**
     * @dev Update execution fee (admin only)
     * @param newFee New fee in basis points
     */
    function updateExecutionFee(uint256 newFee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        executionFee = newFee;
        emit ExecutionFeeUpdated(newFee);
    }

    /**
     * @dev Update fee recipient (admin only)
     * @param newRecipient New fee recipient address
     */
    function updateFeeRecipient(address newRecipient) external onlyRole(DEFAULT_ADMIN_ROLE) {
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(newRecipient);
    }

    /**
     * @dev Pause all DCA operations (emergency)
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause DCA operations
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Required by the OZ UUPS module
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}
} 