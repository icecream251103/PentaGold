import React from 'react';
import SignUpForm from '../components/auth/SignUpForm';
import AuthLayout from '../components/AuthLayout';

const Signup: React.FC = () => {
  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white">Create an account</h2>
        <p className="text-gray-400 mt-2">Start your journey with PentaGold</p>
      </div>
      <SignUpForm />
    </AuthLayout>
  );
};

export default Signup;