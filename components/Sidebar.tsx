
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, Terminal, KeyRound, Siren, TestTube, Users, BarChart2, FileText, GitBranch } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';

const Sidebar: React.FC = () => {
  const { promptLogs, currentUser } = useAppContext();
  const threatsBlocked = promptLogs.filter(log => log.level === 'critical' || log.level === 'warning').length;

  const navItemsConfig: { to: string; icon: React.ElementType; label: string; allowedRoles: UserRole[] }[] = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', allowedRoles: ['Admin', 'Developer', 'Viewer'] },
    { to: '/api-gateway', icon: KeyRound, label: 'API Gateway', allowedRoles: ['Admin', 'Developer'] },
    { to: '/prompt-firewall', icon: Shield, label: 'Prompt Firewall', allowedRoles: ['Admin', 'Developer', 'Viewer'] },
    { to: '/data-detector', icon: Siren, label: 'Data Detector', allowedRoles: ['Admin', 'Developer', 'Viewer'] },
    { to: '/data-lineage', icon: GitBranch, label: 'Data Lineage', allowedRoles: ['Admin', 'Developer'] },
    { to: '/adversarial-tester', icon: TestTube, label: 'Adversarial Tester', allowedRoles: ['Admin', 'Developer'] },
    { to: '/reporting', icon: FileText, label: 'Reporting', allowedRoles: ['Admin', 'Developer'] },
    { to: '/access-control', icon: Users, label: 'Access Control', allowedRoles: ['Admin'] },
  ];

  const visibleNavItems = navItemsConfig.filter(item => 
      currentUser && item.allowedRoles.includes(currentUser.role)
  );

  const linkClasses = "flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors duration-200";
  const activeLinkClasses = "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white";

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 flex flex-col">
      <div className="h-16 flex items-center justify-center px-4 border-b border-gray-200 dark:border-gray-700">
        <Terminal className="w-8 h-8 text-blue-500 mr-2" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI GuardTower</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
           <BarChart2 className="w-8 h-8 text-green-500" />
           <div className="ml-3">
             <p className="text-sm font-semibold text-gray-900 dark:text-white">Threats Found/Blocked</p>
             <p className="text-xs text-gray-500 dark:text-gray-400">{threatsBlocked} incidents</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
