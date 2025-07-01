import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import AuthLayout from '../components/AuthLayout';

const Login: React.FC = () => {
  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white">Sign in</h2>
        <p className="text-gray-400 mt-2">Welcome back!</p>
      </div>
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;