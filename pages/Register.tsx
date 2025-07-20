
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Terminal, UserPlus, AlertCircle } from 'lucide-react';

const Register: React.FC = () => {
  const { register } = useAppContext();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
    }
    setError('');
    setIsLoading(true);
    try {
      const success = await register(name, email, password);
      if (success) {
        navigate('/login', { 
          state: { 
            message: 'Registration successful! Please sign in.',
            email: email 
          } 
        });
      } else {
        setError('An account with this email already exists.');
      }
    } catch (err) {
      setError('An unexpected error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <div className="text-center p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-w-sm w-full">
        <div className="flex justify-center items-center mb-6">
          <Terminal className="w-12 h-12 text-blue-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Join AI GuardTower to secure your applications.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="Jane Doe"
              required
            />
          </div>
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
              placeholder="Minimum 8 characters"
              required
            />
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
            <UserPlus className="w-5 h-5 mr-2" />
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-500 dark:text-blue-400 hover:text-blue-400 dark:hover:text-blue-300">
                Sign in
            </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;