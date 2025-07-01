import React from 'react';
import { motion } from 'framer-motion';
import dragon from '../assets/dragon.png';
import logo from '../assets/logo.png';
import whiteDragon from '../assets/white-dragon.png';
import { Link } from 'react-router-dom';

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
      {/* Background Dragons */}
      <div className="absolute inset-0 grid grid-cols-2">
        <div className="bg-white dark:bg-gray-50 flex items-center justify-center">
          <motion.img
            src={dragon}
            alt="Gold Dragon"
            className="w-3/4 max-w-md transform scale-x-[-1]"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <div className="bg-amber-500 flex items-center justify-center">
          <motion.img
            src={whiteDragon}
            alt="White Dragon"
            className="w-1/2 max-w-sm"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>
      
      {/* Form Container */}
      <motion.div
        className="relative z-10 w-full max-w-sm p-8 bg-gray-900 rounded-2xl shadow-2xl text-white"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2, ease: 'backOut' }}
      >
        <div className="text-center mb-6">
          <Link to="/" className="flex items-center justify-center space-x-3 mb-4 hover:opacity-80 transition">
            <img src={logo} alt="PentaGold Logo" className="h-10 w-10" />
            <span className="text-2xl font-semibold text-white">PentaGold</span>
          </Link>
        </div>
        {children}
      </motion.div>
    </div>
  );
};

export default AuthLayout;