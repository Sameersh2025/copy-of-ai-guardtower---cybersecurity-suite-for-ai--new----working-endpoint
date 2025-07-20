
import React from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { LogEntry } from '../types';
import { FileKey, Mail, ShieldAlert, Phone, CreditCard } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const DataDetector: React.FC = () => {
  const { displayedDataLogs, dataLogs, isFiltered, clearSearch } = useAppContext();

  const getLogDetails = (log: LogEntry): { icon: React.ReactNode; badge: React.ReactNode } => {
    const badgeColor = log.level === 'critical' ? 'red' : 'yellow';
    let icon = <ShieldAlert className="w-5 h-5 text-yellow-500" />;
    
    const lowerCaseMessage = log.message.toLowerCase();

    if (lowerCaseMessage.includes('email')) {
      icon = <Mail className="w-5 h-5 text-red-500" />;
    } else if (lowerCaseMessage.includes('phone')) {
      icon = <Phone className="w-5 h-5 text-red-500" />;
    } else if (lowerCaseMessage.includes('ssn')) {
      icon = <CreditCard className="w-5 h-5 text-red-500" />;
    } else if (lowerCaseMessage.includes('api key')) {
      icon = <FileKey className="w-5 h-5 text-yellow-500" />;
    }

    return {
      icon,
      badge: <Badge color={badgeColor}>{log.level.charAt(0).toUpperCase() + log.level.slice(1)}</Badge>,
    };
  };

  const redactPayload = (payload: string | undefined): string => {
    if (!payload) return '';
    const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/ig;
    const phoneRegex = /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*(\d{3})\s*\)|(\d{3}))\s*(?:[.-]\s*)?)?(\d{3})\s*(?:[.-]\s*)?(\d{4})/g;
    const apiKeyRegex = /(?:sk|pk)_[a-zA-Z0-9]{20,}/g;
    const ssnRegex = /\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/g;


    return payload
      .replace(emailRegex, '[REDACTED_EMAIL]')
      .replace(phoneRegex, '[REDACTED_PHONE]')
      .replace(ssnRegex, '[REDACTED_SSN]')
      .replace(apiKeyRegex, '[REDACTED_KEY]');
  };


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sensitive Data Detector</h1>
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Exposure Incidents</h3>
        
        {isFiltered && (
          <div className="mb-4 flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-bold text-gray-900 dark:text-white">{displayedDataLogs.length}</span> of {dataLogs.length} logs based on your search.
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
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Severity</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Detection</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Payload (Redacted)</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Endpoint</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900/50">
              {displayedDataLogs.filter(log => log.level !== 'info').map((log) => {
                const { icon, badge } = getLogDetails(log);
                const redactedPayload = redactPayload(log.payload);

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
                    <td className="px-3 py-4 text-sm text-gray-600 dark:text-gray-400 font-mono">{redactedPayload}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{log.endpoint}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
           {displayedDataLogs.length === 0 && (
             <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No incidents match your criteria.</p>
             </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DataDetector;
