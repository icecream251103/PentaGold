import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// DCA Plan interface
export interface DCAPlan {
  user: string;
  amount: string; // Amount in USD (wei precision)
  frequency: string; // Frequency in seconds
  lastExecution: string;
  nextExecution: string;
  isActive: boolean;
  totalInvested: string;
  totalTokensReceived: string;
  executionsCount: string;
}

// DCA Plan Form interface
export interface DCAPlanForm {
  amount: string; // USD amount
  frequency: 'daily' | 'weekly' | 'monthly';
}

// Frequency options
export const FREQUENCY_OPTIONS = {
  daily: 24 * 60 * 60, // 1 day in seconds
  weekly: 7 * 24 * 60 * 60, // 1 week in seconds
  monthly: 30 * 24 * 60 * 60, // 30 days in seconds
};

// Mock DCA contract ABI (simplified for demo)
const DCAAutomationABI = [
  'function createDCAPlan(uint256 amount, uint256 frequency) external',
  'function updateDCAPlan(uint256 planId, uint256 amount, uint256 frequency) external',
  'function pauseDCAPlan(uint256 planId) external',
  'function resumeDCAPlan(uint256 planId) external',
  'function cancelDCAPlan(uint256 planId) external',
  'function getUserPlans(address user) external view returns (tuple(address user, uint256 amount, uint256 frequency, uint256 lastExecution, uint256 nextExecution, bool isActive, uint256 totalInvested, uint256 totalTokensReceived, uint256 executionsCount)[])',
  'function getDCAPlan(address user, uint256 planId) external view returns (tuple(address user, uint256 amount, uint256 frequency, uint256 lastExecution, uint256 nextExecution, bool isActive, uint256 totalInvested, uint256 totalTokensReceived, uint256 executionsCount))',
  'function getEligiblePlans(address user) external view returns (uint256[])',
  'function userPlanCount(address user) external view returns (uint256)',
  'function MIN_AMOUNT() external view returns (uint256)',
  'function MAX_AMOUNT() external view returns (uint256)',
  'function executionFee() external view returns (uint256)',
  'event DCAPlanCreated(address indexed user, uint256 planId, uint256 amount, uint256 frequency)',
  'event DCAPlanUpdated(address indexed user, uint256 planId, uint256 amount, uint256 frequency)',
  'event DCAPlanPaused(address indexed user, uint256 planId)',
  'event DCAPlanResumed(address indexed user, uint256 planId)',
  'event DCAPlanCancelled(address indexed user, uint256 planId)',
  'event DCAExecuted(address indexed user, uint256 planId, uint256 usdAmount, uint256 tokensReceived, uint256 fee)',
];

export const useDCA = () => {
  const [plans, setPlans] = useState<DCAPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  // Initialize contract
  useEffect(() => {
    const initializeContract = async () => {
      try {
        if (typeof window.ethereum !== 'undefined') {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          
          // Mock contract address - replace with actual deployed address
          const contractAddress = '0x1234567890123456789012345678901234567890';
          const dcaContract = new ethers.Contract(
            contractAddress,
            DCAAutomationABI,
            signer
          );
          
          setContract(dcaContract);
          setUserAddress(address);
        }
      } catch (err) {
        console.error('Failed to initialize DCA contract:', err);
        setError('Failed to connect to wallet');
      }
    };

    initializeContract();
  }, []);

  // Load user's DCA plans
  const loadPlans = useCallback(async () => {
    if (!contract || !userAddress) return;

    try {
      setLoading(true);
      setError(null);
      
      const userPlans = await contract.getUserPlans(userAddress);
      setPlans(userPlans);
    } catch (err) {
      console.error('Failed to load DCA plans:', err);
      setError('Failed to load DCA plans');
    } finally {
      setLoading(false);
    }
  }, [contract, userAddress]);

  // Create new DCA plan
  const createPlan = useCallback(async (planData: DCAPlanForm) => {
    if (!contract) {
      setError('Contract not initialized');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Convert USD amount to wei (assuming 18 decimals)
      const amountInWei = ethers.parseUnits(planData.amount, 18);
      const frequencyInSeconds = FREQUENCY_OPTIONS[planData.frequency];

      const tx = await contract.createDCAPlan(amountInWei, frequencyInSeconds);
      await tx.wait();

      // Reload plans after creation
      await loadPlans();
      
      return { success: true, txHash: tx.hash };
    } catch (err) {
      console.error('Failed to create DCA plan:', err);
      setError('Failed to create DCA plan');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [contract, loadPlans]);

  // Update existing DCA plan
  const updatePlan = useCallback(async (planId: number, planData: DCAPlanForm) => {
    if (!contract) {
      setError('Contract not initialized');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const amountInWei = ethers.parseUnits(planData.amount, 18);
      const frequencyInSeconds = FREQUENCY_OPTIONS[planData.frequency];

      const tx = await contract.updateDCAPlan(planId, amountInWei, frequencyInSeconds);
      await tx.wait();

      await loadPlans();
      
      return { success: true, txHash: tx.hash };
    } catch (err) {
      console.error('Failed to update DCA plan:', err);
      setError('Failed to update DCA plan');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [contract, loadPlans]);

  // Pause DCA plan
  const pausePlan = useCallback(async (planId: number) => {
    if (!contract) {
      setError('Contract not initialized');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const tx = await contract.pauseDCAPlan(planId);
      await tx.wait();

      await loadPlans();
      
      return { success: true, txHash: tx.hash };
    } catch (err) {
      console.error('Failed to pause DCA plan:', err);
      setError('Failed to pause DCA plan');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [contract, loadPlans]);

  // Resume DCA plan
  const resumePlan = useCallback(async (planId: number) => {
    if (!contract) {
      setError('Contract not initialized');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const tx = await contract.resumeDCAPlan(planId);
      await tx.wait();

      await loadPlans();
      
      return { success: true, txHash: tx.hash };
    } catch (err) {
      console.error('Failed to resume DCA plan:', err);
      setError('Failed to resume DCA plan');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [contract, loadPlans]);

  // Cancel DCA plan
  const cancelPlan = useCallback(async (planId: number) => {
    if (!contract) {
      setError('Contract not initialized');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const tx = await contract.cancelDCAPlan(planId);
      await tx.wait();

      await loadPlans();
      
      return { success: true, txHash: tx.hash };
    } catch (err) {
      console.error('Failed to cancel DCA plan:', err);
      setError('Failed to cancel DCA plan');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [contract, loadPlans]);

  // Get eligible plans for execution
  const getEligiblePlans = useCallback(async () => {
    if (!contract || !userAddress) return [];

    try {
      const eligiblePlanIds = await contract.getEligiblePlans(userAddress);
      return eligiblePlanIds;
    } catch (err) {
      console.error('Failed to get eligible plans:', err);
      return [];
    }
  }, [contract, userAddress]);

  // Format plan data for display
  const formatPlan = useCallback((plan: DCAPlan) => {
    const amountInUSD = ethers.formatUnits(plan.amount, 18);
    const totalInvestedInUSD = ethers.formatUnits(plan.totalInvested, 18);
    const totalTokensReceived = ethers.formatUnits(plan.totalTokensReceived, 18);
    
    // Calculate frequency display
    const frequencyInDays = Number(plan.frequency) / (24 * 60 * 60);
    let frequencyDisplay = '';
    if (frequencyInDays === 1) {
      frequencyDisplay = 'Daily';
    } else if (frequencyInDays === 7) {
      frequencyDisplay = 'Weekly';
    } else if (frequencyInDays === 30) {
      frequencyDisplay = 'Monthly';
    } else {
      frequencyDisplay = `Every ${frequencyInDays} days`;
    }

    // Calculate next execution time
    const nextExecutionDate = new Date(Number(plan.nextExecution) * 1000);
    const isOverdue = nextExecutionDate < new Date();

    return {
      ...plan,
      amountInUSD,
      totalInvestedInUSD,
      totalTokensReceived,
      frequencyDisplay,
      nextExecutionDate,
      isOverdue,
    };
  }, []);

  // Load plans on mount and when dependencies change
  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  return {
    plans: plans.map(formatPlan),
    loading,
    error,
    createPlan,
    updatePlan,
    pausePlan,
    resumePlan,
    cancelPlan,
    getEligiblePlans,
    loadPlans,
    userAddress,
    contract,
  };
}; 