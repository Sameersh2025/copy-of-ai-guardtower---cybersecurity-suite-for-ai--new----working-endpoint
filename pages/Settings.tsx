import React from 'react';
import Card from '../components/ui/Card';
import { useAppContext } from '../context/AppContext';
import { LogRetentionPeriod } from '../types';

const Settings: React.FC = () => {
  const { theme, toggleTheme, logRetentionDays, updateLogRetention } = useAppContext();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>

      {/* Appearance Settings */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400">Application Theme</p>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Light</span>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                aria-hidden="true"
                className={`inline-block w-5 h-5 rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200 ${
                  theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-sm text-gray-500">Dark</span>
          </div>
        </div>
      </Card>
      
      {/* Data Management Settings */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Data Management</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-800 dark:text-gray-300">Log Retention Policy</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">How long to keep security log data.</p>
            </div>
            <select
              value={logRetentionDays}
              onChange={(e) => updateLogRetention(Number(e.target.value) as LogRetentionPeriod)}
              className="w-48 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7">7 Days</option>
              <option value="30">30 Days</option>
              <option value="90">90 Days</option>
              <option value="0">Forever</option>
            </select>
          </div>
        </div>
      </Card>

    </div>
  );
};

export default Settings;