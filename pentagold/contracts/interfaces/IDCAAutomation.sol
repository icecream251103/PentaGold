// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IDCAAutomation - Interface for DCA Automation Contract
 * @dev Interface for Dollar-Cost Averaging automation functionality
 */
interface IDCAAutomation {
    // DCA Plan structure
    struct DCAPlan {
        address user;
        uint256 amount; // Amount in USD (wei precision)
        uint256 frequency; // Frequency in seconds
        uint256 lastExecution;
        uint256 nextExecution;
        bool isActive;
        uint256 totalInvested;
        uint256 totalTokensReceived;
        uint256 executionsCount;
    }

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

    // Functions
    function createDCAPlan(uint256 amount, uint256 frequency) external;
    function updateDCAPlan(uint256 planId, uint256 amount, uint256 frequency) external;
    function pauseDCAPlan(uint256 planId) external;
    function resumeDCAPlan(uint256 planId) external;
    function cancelDCAPlan(uint256 planId) external;
    function executeDCA(address user, uint256 planId) external;
    function executeAllDCA(address user) external;
    function getUserPlans(address user) external view returns (DCAPlan[] memory);
    function getDCAPlan(address user, uint256 planId) external view returns (DCAPlan memory);
    function getEligiblePlans(address user) external view returns (uint256[] memory);
    
    // View functions
    function tgauxToken() external view returns (address);
    function executionFee() external view returns (uint256);
    function feeRecipient() external view returns (address);
    function userPlanCount(address user) external view returns (uint256);
    function MIN_AMOUNT() external view returns (uint256);
    function MAX_AMOUNT() external view returns (uint256);
    function MIN_FREQUENCY() external view returns (uint256);
    function MAX_FREQUENCY() external view returns (uint256);
} 