import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Hexagon, Circle, Coins, Sun, Moon, HelpCircle, LogOut, User, TrendingUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import MetricsPanel from '../components/MetricsPanel';
import EnhancedChart from '../components/EnhancedChart';
import TradingPanel from '../components/TradingPanel';
import DCAPanel from '../components/DCAPanel';
import Chatbot from '../components/Chatbot';
import OnboardingFlow from '../components/OnboardingFlow';
import NotificationCenter from '../components/NotificationCenter';
import logo from '../assets/logo.png';
import UserProfileModal from '../components/UserProfileModal';
import AnimatedSection from '../components/AnimatedSection';

function TetraLogo() {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center">
      <Hexagon className="w-8 h-8 text-amber-600 absolute" strokeWidth={1.5} />
      <Circle className="w-5 h-5 text-amber-500 absolute" strokeWidth={2} />
      <Coins className="w-3 h-3 text-amber-700 absolute" strokeWidth={2} />
    </div>
  );
}

type TabType = 'overview' | 'trading' | 'dca';

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12
    }
  }
};

const Dashboard: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isSandboxMode, setIsSandboxMode] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    // Check if user is new or wants onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    const sandboxMode = localStorage.getItem('sandboxMode');
    
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
    
    if (sandboxMode === 'true') {
      setIsSandboxMode(true);
    }
  }, []);

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
  };

  const toggleSandboxMode = () => {
    const newMode = !isSandboxMode;
    setIsSandboxMode(newMode);
    localStorage.setItem('sandboxMode', newMode.toString());
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderTabContent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <AnimatedSection>
                    <MetricsPanel />
                  </AnimatedSection>
                  <AnimatedSection delay={0.2}>
                    <EnhancedChart />
                  </AnimatedSection>
                </div>
                
                <div className="lg:col-span-1">
                  <AnimatedSection delay={0.3}>
                    <TradingPanel />
                  </AnimatedSection>
                </div>
              </div>

              <AnimatedSection delay={0.4}>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Oracle Status
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Chainlink</span>
                        <span className="text-sm text-green-600">Active</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Band Protocol</span>
                        <span className="text-sm text-green-600">Active</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Last Update</span>
                        <span className="text-sm text-gray-900 dark:text-white">2 min ago</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Network Stats
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Gas Price</span>
                        <span className="text-sm text-gray-900 dark:text-white">25 gwei</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Block Time</span>
                        <span className="text-sm text-gray-900 dark:text-white">12.5s</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Network</span>
                        <span className="text-sm text-green-600">Ethereum</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Security
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Smart Contract</span>
                        <span className="text-sm text-green-600">Audited</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Timelock</span>
                        <span className="text-sm text-green-600">48h</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Circuit Breaker</span>
                        <span className="text-sm text-green-600">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </>
          )}

          {activeTab === 'trading' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <AnimatedSection className="lg:col-span-2">
                <EnhancedChart />
              </AnimatedSection>
              <AnimatedSection className="lg:col-span-1" delay={0.2}>
                <TradingPanel />
              </AnimatedSection>
            </div>
          )}

          {activeTab === 'dca' && (
            <AnimatedSection>
              <DCAPanel />
            </AnimatedSection>
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <img src={logo} alt="Logo" className="h-8 w-8 rounded-full" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">PentaGold</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSandboxMode}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isSandboxMode
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Sandbox Mode
              </button>

              <NotificationCenter />
              <button onClick={toggleTheme} className="p-2 text-gray-500 hover:text-amber-600 transition-colors">
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
              <Link to="/help" className="p-2 text-gray-500 hover:text-amber-600 transition-colors">
                <HelpCircle className="h-5 w-5" />
              </Link>

              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>

              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center space-x-2 text-gray-500 hover:text-amber-600 transition-colors"
              >
                <User className="h-5 w-5" />
                <span className="text-sm font-medium hidden md:block">{user?.email}</span>
              </button>
              <button onClick={handleSignOut} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Header with Tabs */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back, {user?.email}</p>
            </div>
            
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {(['overview', 'trading', 'dca'] as TabType[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {renderTabContent()}
      </main>

      <Chatbot />
      <AnimatePresence>
        {showOnboarding && <OnboardingFlow isOpen={showOnboarding} onClose={handleOnboardingClose} />}
      </AnimatePresence>
      <UserProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} userId={user?.id || ''} email={user?.email || ''} />
    </div>
  );
};

export default Dashboard;