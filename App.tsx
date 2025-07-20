
import React from 'react';
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ApiGateway from './pages/ApiGateway';
import PromptFirewall from './pages/PromptFirewall';
import DataDetector from './pages/DataDetector';
import DataLineage from './pages/DataLineage';
import AdversarialTester from './pages/AdversarialTester';
import Reporting from './pages/Reporting';
import AccessControl from './pages/AccessControl';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import { AppProvider, useAppContext } from './context/AppContext';
import { UserRole } from './types';
import { Loader2 } from 'lucide-react';

const AppLayout: React.FC = () => {
  const { currentUser } = useAppContext();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const canAccess = (allowedRoles: UserRole[]) => {
    return allowedRoles.includes(currentUser.role);
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-300 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/prompt-firewall" element={<PromptFirewall />} />
            <Route path="/data-detector" element={<DataDetector />} />
            
            <Route 
              path="/data-lineage" 
              element={canAccess(['Admin', 'Developer']) ? <DataLineage /> : <Navigate to="/dashboard" replace />}
            />
            <Route 
              path="/api-gateway" 
              element={canAccess(['Admin', 'Developer']) ? <ApiGateway /> : <Navigate to="/dashboard" replace />}
            />
            <Route 
              path="/adversarial-tester" 
              element={canAccess(['Admin', 'Developer']) ? <AdversarialTester /> : <Navigate to="/dashboard" replace />}
            />
            <Route 
              path="/reporting" 
              element={canAccess(['Admin', 'Developer']) ? <Reporting /> : <Navigate to="/dashboard" replace />}
            />
            <Route 
              path="/access-control" 
              element={canAccess(['Admin']) ? <AccessControl /> : <Navigate to="/dashboard" replace />}
            />
            
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const AppRoutes: React.FC = () => {
    const { isAuthenticated } = useAppContext();

    return (
        <Routes>
            {isAuthenticated ? (
                <>
                    <Route path="/*" element={<AppLayout />} />
                    <Route path="/login" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/register" element={<Navigate to="/dashboard" replace />} />
                </>

            ) : (
                <>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </>
            )}
        </Routes>
    );
};

const AppContent: React.FC = () => {
  const { isInitializing } = useAppContext();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        <span className="ml-4 text-xl">Initializing GuardTower Database...</span>
      </div>
    );
  }

  return <AppRoutes />;
}

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AppProvider>
  );
};

export default App;
