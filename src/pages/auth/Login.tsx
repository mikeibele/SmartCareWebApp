import React from 'react';
import LoginForm from '../../components/auth/LoginForm';
import { Activity } from 'lucide-react';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white p-8 shadow-md rounded-lg">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
              <Activity size={32} className="text-blue-600" />
            </div>
            <LoginForm />
          </div>
        </div>
        <div className="mt-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} SmartCare. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;