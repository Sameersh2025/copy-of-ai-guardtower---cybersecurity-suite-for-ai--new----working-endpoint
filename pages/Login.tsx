
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Terminal, LogIn, AlertCircle, CheckCircle } from 'lucide-react';
import { UserRole } from '../types';

const Login: React.FC = () => {
  const { login } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState(location.state?.email || 'alice@example.com');
  const [password, setPassword] = useState(location.state?.email ? '' : 'password1');
  const [role, setRole] = useState<UserRole>(location.state?.email ? 'Viewer' : 'Admin');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  useEffect(() => {
    // Clear the message after a few seconds
    if (successMessage) {
        const timer = setTimeout(() => {
            setSuccessMessage('');
        }, 5000);
        return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const success = await login(email, password, role);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid credentials for the selected role. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <div className="text-center p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-w-sm w-full">
        <div className="flex justify-center items-center mb-6">
          <Terminal className="w-12 h-12 text-blue-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI GuardTower</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Sign in to access your AI security dashboard.
        </p>

        {successMessage && !error && (
            <div className="flex items-center text-sm text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-500/10 p-3 rounded-md mb-4">
                <CheckCircle className="w-5 h-5 mr-2" />
                {successMessage}
            </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password"className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="Admin">Admin</option>
              <option value="Developer">Developer</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>

          {error && (
            <div className="flex items-center text-sm text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/10 p-3 rounded-md">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg"
          >
            <LogIn className="w-5 h-5 mr-2" />
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-blue-500 dark:text-blue-400 hover:text-blue-400 dark:hover:text-blue-300">
                Register here
            </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;