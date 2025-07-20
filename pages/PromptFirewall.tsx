
import React from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { LogEntry } from '../types';
import { ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const PromptFirewall: React.FC = () => {
  const { displayedPromptLogs, promptLogs, isFiltered, clearSearch } = useAppContext();

  const getLogLevelInfo = (level: LogEntry['level']): { icon: React.ReactNode; badge: React.ReactNode } => {
    switch (level) {
      case 'critical':
        return {
          icon: <ShieldX className="w-5 h-5 text-red-500" />,
          badge: <Badge color="red">Blocked</Badge>,
        };
      case 'warning':
        return {
          icon: <ShieldAlert className="w-5 h-5 text-yellow-500" />,
          badge: <Badge color="yellow">Suspicious</Badge>,
        };
      default:
        return {
          icon: <ShieldCheck className="w-5 h-5 text-green-500" />,
          badge: <Badge color="green">Safe</Badge>,
        };
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Prompt Injection Firewall</h1>
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Live Prompt Analysis Log</h3>
        
        {isFiltered && (
          <div className="mb-4 flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-bold text-gray-900 dark:text-white">{displayedPromptLogs.length}</span> of {promptLogs.length} logs based on your search.
            </p>
            <button onClick={clearSearch} className="font-semibold text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
              Clear Search
            </button>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 sm:pl-6">Timestamp</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Finding</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Endpoint</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Source IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900/50">
              {displayedPromptLogs.map((log) => {
                const { icon, badge } = getLogLevelInfo(log.level);
                return (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 dark:text-gray-400 sm:pl-6">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        {icon}
                        <span className="ml-2">{badge}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-900 dark:text-white">{log.message}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{log.endpoint}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{log.ip}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {displayedPromptLogs.length === 0 && (
             <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No logs match your criteria.</p>
             </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PromptFirewall;