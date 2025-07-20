
import React, { useState, useEffect, useRef } from 'react';
import { Bell, UserCircle, Search, X, Loader2, ShieldAlert, UserCircle2, Settings, LogOut } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Notification } from '../types';

const Header: React.FC = () => {
  const { 
    performSearch, 
    clearSearch, 
    isLoadingSearch, 
    isFiltered,
    currentUser,
    notifications,
    markAllNotificationsAsRead,
    logout,
  } = useAppContext();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    performSearch(searchQuery);

    // Navigate to a relevant log page if not already there
    if (!location.pathname.includes('/prompt-firewall') && !location.pathname.includes('/data-detector')) {
        navigate('/prompt-firewall');
    }
  };

  const handleClearSearch = () => {
    clearSearch();
    setSearchQuery('');
  };

  const handleToggleNotifications = () => {
    setIsNotificationsOpen(prev => !prev);
    if (!isNotificationsOpen && unreadCount > 0) {
      // Use a timeout to allow the animation to feel smoother
      setTimeout(() => {
        markAllNotificationsAsRead();
      }, 1000);
    }
  };

  const handleSignOut = () => {
    logout();
    // Navigation is handled by the root App component now
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsAccountOpen(false);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch(type) {
      case 'critical':
        return <ShieldAlert className="w-5 h-5 text-red-400" />;
      default:
        return <Bell className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-8 flex-shrink-0">
       <div className="flex-1 max-w-xl">
         <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              {isLoadingSearch ? (
                  <Loader2 className="w-5 h-5 text-gray-500 dark:text-gray-400 animate-spin" />
              ) : (
                  <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              )}
            </div>
            <input 
              type="text" 
              placeholder="Search logs with natural language..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-700 border border-transparent rounded-md py-2 pl-10 pr-10 text-gray-800 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
            {(searchQuery || isFiltered) && (
              <button 
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
         </form>
       </div>
       <div className="flex items-center space-x-6">
        {/* Notifications Button */}
        <div ref={notificationsRef} className="relative">
          <button onClick={handleToggleNotifications} className="relative text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {unreadCount}
              </span>
            )}
          </button>
          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-md bg-white dark:bg-gray-700 shadow-lg ring-1 ring-black ring-opacity-5 z-20">
              <div className="p-2">
                <div className="flex justify-between items-center p-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Notifications</h4>
                  {unreadCount > 0 && <span className="text-xs text-blue-500 dark:text-blue-400">{unreadCount} new</span>}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <div key={notif.id} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 pt-1">
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div>
                            <p className={`text-sm ${notif.read ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-white'}`}>{notif.message}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{new Date(notif.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <p>No new notifications</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account Menu */}
        {currentUser && (
            <div ref={accountRef} className="relative">
            <button onClick={() => setIsAccountOpen(prev => !prev)} className="flex items-center">
                <img className="w-8 h-8 rounded-full" src={`https://i.pravatar.cc/40?u=${currentUser.id}`} alt={`${currentUser.name}'s avatar`} />
                <div className="ml-3 text-right hidden md:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{currentUser.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.role}</p>
                </div>
            </button>
            {/* Account Dropdown */}
            {isAccountOpen && (
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-700 shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                    <button onClick={() => handleNavigate('/profile')} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white" role="menuitem">
                        <UserCircle2 className="w-4 h-4 mr-3" /> My Profile
                    </button>
                    <button onClick={() => handleNavigate('/settings')} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white" role="menuitem">
                        <Settings className="w-4 h-4 mr-3" /> Settings
                    </button>
                    <button onClick={handleSignOut} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-red-400 dark:hover:text-red-300" role="menuitem">
                        <LogOut className="w-4 h-4 mr-3" /> Sign Out
                    </button>
                    </div>
                </div>
            )}
            </div>
        )}
       </div>
    </header>
  );
};

export default Header;