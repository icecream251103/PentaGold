import React, { useState } from 'react';
import { 
  Calendar, 
  DollarSign, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Plus, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { useDCA, DCAPlanForm, FREQUENCY_OPTIONS } from '../hooks/useDCA';
import { formatCurrency } from '../utils/calculations';
import metamaskLogo from '../assets/metamask.png';

interface DCAPlanFormProps {
  onSubmit: (data: DCAPlanForm) => void;
  onCancel: () => void;
  initialData?: DCAPlanForm;
  loading?: boolean;
}

const DCAPlanFormComponent: React.FC<DCAPlanFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  loading = false
}) => {
  const [formData, setFormData] = useState<DCAPlanForm>(
    initialData || { amount: '', frequency: 'weekly' }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount && parseFloat(formData.amount) > 0) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Investment Amount (USD)
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="number"
            step="0.01"
            min="0.01"
            max="10000"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Enter amount (e.g., 100)"
            required
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Min: $0.01 | Max: $10,000
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Frequency
        </label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(FREQUENCY_OPTIONS).map(([key, value]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFormData({ ...formData, frequency: key as any })}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                formData.frequency === key
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-amber-300'
              }`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          disabled={loading || !formData.amount || parseFloat(formData.amount) <= 0}
          className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          {loading ? (
            <Loader className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Plus className="h-5 w-5 mr-2" />
              {initialData ? 'Update Plan' : 'Create Plan'}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const DCAPlanCard: React.FC<{ plan: any; onPause: () => void; onResume: () => void; onEdit: () => void; onCancel: () => void }> = ({
  plan,
  onPause,
  onResume,
  onEdit,
  onCancel
}) => {
  const getStatusIcon = () => {
    if (plan.isOverdue) {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
    if (plan.isActive) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <Pause className="h-5 w-5 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (plan.isOverdue) {
      return 'Overdue';
    }
    if (plan.isActive) {
      return 'Active';
    }
    return 'Paused';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(parseFloat(plan.amountInUSD))} {plan.frequencyDisplay}
            </h3>
            <p className="text-sm text-gray-500">
              Status: <span className="font-medium">{getStatusText()}</span>
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {plan.isActive ? (
            <button
              onClick={onPause}
              className="p-2 text-gray-500 hover:text-yellow-600 transition-colors"
              title="Pause Plan"
            >
              <Pause className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={onResume}
              className="p-2 text-gray-500 hover:text-green-600 transition-colors"
              title="Resume Plan"
            >
              <Play className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onEdit}
            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
            title="Edit Plan"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={onCancel}
            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
            title="Cancel Plan"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Invested</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatCurrency(parseFloat(plan.totalInvestedInUSD))}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <DollarSign className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tokens Received</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {parseFloat(plan.totalTokensReceived).toFixed(6)} PGAUx
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Executions:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {plan.executionsCount}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Next Execution:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {plan.nextExecutionDate.toLocaleDateString()} {plan.nextExecutionDate.toLocaleTimeString()}
          </span>
        </div>
        {plan.lastExecution !== '0' && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Last Execution:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {new Date(Number(plan.lastExecution) * 1000).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const DCAPanel: React.FC = () => {
  const {
    plans,
    loading,
    error,
    createPlan,
    updatePlan,
    pausePlan,
    resumePlan,
    cancelPlan,
    userAddress
  } = useDCA();

  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);

  const handleCreatePlan = async (data: DCAPlanForm) => {
    setFormLoading(true);
    const result = await createPlan(data);
    setFormLoading(false);
    
    if (result?.success) {
      setShowForm(false);
    }
  };

  const handleUpdatePlan = async (data: DCAPlanForm) => {
    if (editingPlan === null) return;
    
    setFormLoading(true);
    const result = await updatePlan(editingPlan, data);
    setFormLoading(false);
    
    if (result?.success) {
      setEditingPlan(null);
    }
  };

  const handlePausePlan = async (planId: number) => {
    await pausePlan(planId);
  };

  const handleResumePlan = async (planId: number) => {
    await resumePlan(planId);
  };

  const handleCancelPlan = async (planId: number) => {
    if (window.confirm('Are you sure you want to cancel this DCA plan? This action cannot be undone.')) {
      await cancelPlan(planId);
    }
  };

  const handleEditPlan = (planId: number) => {
    const plan = plans[planId];
    setEditingPlan(planId);
    // The form will be populated with current plan data
  };

  const handleConnectWallet = async () => {
    setConnectLoading(true);
    try {
      if (typeof window.ethereum === 'undefined') {
        alert('MetaMask is not installed. Please install MetaMask and try again.');
        setConnectLoading(false);
        return;
      }
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      window.location.reload(); // reload to trigger useDCA hook to re-initialize
    } catch (err) {
      alert('Failed to connect wallet.');
    }
    setConnectLoading(false);
  };

  if (!userAddress) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Wallet Not Connected
          </h3>
          <p className="text-gray-500 mb-6">
            Please connect your wallet to manage DCA plans.
          </p>
          <button
            onClick={handleConnectWallet}
            disabled={connectLoading}
            className="inline-flex items-center px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow transition-colors disabled:opacity-60"
          >
            <img src={metamaskLogo} alt="MetaMask" className="h-6 w-6 mr-2" />
            {connectLoading ? 'Connecting...' : 'Connect MetaMask Wallet'}
          </button>
          <div className="mt-6 text-left max-w-md mx-auto text-gray-600 text-sm bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
            <strong>How to connect MetaMask:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Install the MetaMask extension in your browser.</li>
              <li>Log in to your MetaMask account.</li>
              <li>Click the <b>Connect MetaMask Wallet</b> button above.</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">DCA Automation</h2>
          <p className="text-gray-500 text-sm">
            Automate your PGAUx investments with Dollar-Cost Averaging
          </p>
        </div>
        {!showForm && !editingPlan && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Plan</span>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* DCA Plan Form */}
      {(showForm || editingPlan !== null) && (
        <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingPlan !== null ? 'Edit DCA Plan' : 'Create New DCA Plan'}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingPlan(null);
              }}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          
          <DCAPlanFormComponent
            onSubmit={editingPlan !== null ? handleUpdatePlan : handleCreatePlan}
            onCancel={() => {
              setShowForm(false);
              setEditingPlan(null);
            }}
            initialData={editingPlan !== null ? {
              amount: plans[editingPlan]?.amountInUSD || '',
              frequency: plans[editingPlan]?.frequencyDisplay?.toLowerCase() as any || 'weekly'
            } : undefined}
            loading={formLoading}
          />
        </div>
      )}

      {/* DCA Plans List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <Loader className="h-8 w-8 animate-spin text-amber-500 mx-auto mb-4" />
            <p className="text-gray-500">Loading DCA plans...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No DCA Plans Yet
            </h3>
            <p className="text-gray-500 mb-4">
              Create your first DCA plan to start automating your PGAUx investments.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Create First Plan
            </button>
          </div>
        ) : (
          plans.map((plan, index) => (
            <DCAPlanCard
              key={index}
              plan={plan}
              onPause={() => handlePausePlan(index)}
              onResume={() => handleResumePlan(index)}
              onEdit={() => handleEditPlan(index)}
              onCancel={() => handleCancelPlan(index)}
            />
          ))
        )}
      </div>

      {/* DCA Benefits Info */}
      <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
        <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
          Why Dollar-Cost Averaging?
        </h4>
        <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
          <li>• Reduces the impact of market volatility</li>
          <li>• Automates your investment strategy</li>
          <li>• Builds wealth consistently over time</li>
          <li>• No need to time the market</li>
        </ul>
      </div>
    </div>
  );
};

export default DCAPanel; 