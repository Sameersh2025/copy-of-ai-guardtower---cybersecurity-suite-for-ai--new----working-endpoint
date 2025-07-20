
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Shield, Siren, AlertTriangle } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { dashboardChartData } from '../data/mockData';
import { LogEntry } from '../types';
import { useAppContext } from '../context/AppContext';

const Dashboard: React.FC = () => {
  const { promptLogs, dataLogs, endpoints, theme } = useAppContext();

  const allLogs = [...promptLogs, ...dataLogs];
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const logsLast24h = allLogs.filter(log => new Date(log.timestamp) > twentyFourHoursAgo);

  const totalRequests24h = logsLast24h.length;
  
  const totalLatency = logsLast24h.reduce((acc, log) => acc + (log.latency || 0), 0);
  const avgLatency = totalRequests24h > 0 ? Math.round(totalLatency / totalRequests24h) : 0;

  const recentSecurityLogs = allLogs
    .filter(log => log.level === 'critical' || log.level === 'warning')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);
  
  const threatsBlocked = allLogs.filter(log => log.level === 'critical' || log.level === 'warning').length;
  const activeEndpoints = endpoints.filter(ep => ep.status === 'active').length;
  const totalEndpoints = endpoints.length;

  const getLogLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <Siren className="w-5 h-5 text-yellow-500" />;
      default:
        return <Shield className="w-5 h-5 text-green-500" />;
    }
  };

  const getLogLevelBadge = (level: LogEntry['level']) => {
    switch (level) {
      case 'critical':
        return <Badge color="red">Critical</Badge>;
      case 'warning':
        return <Badge color="yellow">Warning</Badge>;
      default:
        return <Badge color="green">Info</Badge>;
    }
  };
  
  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
    border: `1px solid ${theme === 'dark' ? '#3c3c3c' : '#e5e7eb'}`
  };
  const axisStrokeColor = theme === 'dark' ? '#9e9e9e' : '#6b7280';


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Requests (24h)</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{totalRequests24h.toLocaleString()}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Threats Found/Blocked</h3>
          <p className="mt-2 text-3xl font-semibold text-red-500">{threatsBlocked.toLocaleString()}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Endpoints</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{activeEndpoints} / {totalEndpoints}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Latency (avg)</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{avgLatency}ms</p>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Request & Threat Overview</h3>
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <AreaChart data={dashboardChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                        <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#2d2d2d' : '#e5e7eb'} />
                    <XAxis dataKey="name" stroke={axisStrokeColor} />
                    <YAxis stroke={axisStrokeColor} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Area type="monotone" dataKey="requests" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRequests)" />
                    <Area type="monotone" dataKey="blocked" stroke="#ef4444" fillOpacity={1} fill="url(#colorBlocked)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Security Events</h3>
        <div className="flow-root">
          {recentSecurityLogs.length > 0 ? (
            <ul role="list" className="-mb-8">
              {recentSecurityLogs.map((log, logIdx) => (
                <li key={log.id}>
                  <div className="relative pb-8">
                    {logIdx !== recentSecurityLogs.length - 1 ? (
                      <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex items-start space-x-3">
                      <div className="relative">
                        <span className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                          {getLogLevelIcon(log.level)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                             <span className="font-medium text-gray-700 dark:text-gray-300">{log.endpoint}</span> - {log.ip}
                          </p>
                          <div className="flex items-center space-x-2">
                             {getLogLevelBadge(log.level)}
                             <time dateTime={log.timestamp} className="text-xs text-gray-500 dark:text-gray-500">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </time>
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{log.message}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No security events found in the last 48 hours.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;