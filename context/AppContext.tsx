
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Endpoint, LogEntry, User, SearchFilter, UserRole, Notification, AppSettings, Theme, LogRetentionPeriod, ModelLineage, AppContextType } from '../types';
import { mockEndpoints, mockPromptLogs, mockDataLogs, mockUsers, mockDataLineage } from '../data/mockData';
import { parseNaturalLanguageSearch } from '../services/geminiService';
import { db } from '../services/db';

const initialUsersWithPassword: User[] = mockUsers.map((user, index) => ({
    ...user,
    password: `password${index + 1}`
}));

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [promptLogs, setPromptLogs] = useState<LogEntry[]>([]);
  const [dataLogs, setDataLogs] = useState<LogEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dataLineage, setDataLineage] = useState<ModelLineage[]>([]);
  
  const [displayedPromptLogs, setDisplayedPromptLogs] = useState<LogEntry[]>([]);
  const [displayedDataLogs, setDisplayedDataLogs] = useState<LogEntry[]>([]);
  
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Settings state
  const [theme, setTheme] = useState<Theme>('dark');
  const [logRetentionDays, setLogRetentionDays] = useState<LogRetentionPeriod>(0);

  useEffect(() => {
    const initializeDatabase = async () => {
      setIsInitializing(true);
      try {
        const userCount = await db.users.count();
        if (userCount === 0) {
          console.log("Database is empty, seeding with initial data...");
          await db.users.bulkAdd(initialUsersWithPassword);
          await db.endpoints.bulkAdd(mockEndpoints);
          await db.promptLogs.bulkAdd(mockPromptLogs);
          await db.dataLogs.bulkAdd(mockDataLogs);
          await db.dataLineage.bulkAdd(mockDataLineage);
          await db.settings.put({ id: 0, theme: 'dark', logRetentionDays: 0 });
          console.log("Database seeded successfully.");
        } else {
            const lineageCount = await db.dataLineage.count();
            if (lineageCount === 0) {
                console.log("Seeding data lineage information...");
                await db.dataLineage.bulkAdd(mockDataLineage);
            }
        }

        // 1. Load settings to determine retention policy
        const dbSettings = await db.settings.get(0);
        const currentRetentionDays = dbSettings ? dbSettings.logRetentionDays : 0;

        // 2. Apply retention policy by purging old logs from the database
        if (currentRetentionDays > 0) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - currentRetentionDays);
            const cutoffTimestamp = cutoffDate.toISOString();
            await db.promptLogs.where('timestamp').below(cutoffTimestamp).delete();
            await db.dataLogs.where('timestamp').below(cutoffTimestamp).delete();
        }

        // 3. Load all remaining data from DB into React state
        const [dbUsers, dbEndpoints, dbPromptLogs, dbDataLogs, dbNotifications, finalSettings, dbDataLineage] = await Promise.all([
          db.users.toArray(),
          db.endpoints.toArray(),
          db.promptLogs.orderBy('timestamp').reverse().toArray(),
          db.dataLogs.orderBy('timestamp').reverse().toArray(),
          db.notifications.orderBy('timestamp').reverse().toArray(),
          db.settings.get(0), // get settings again in case they were just seeded
          db.dataLineage.toArray(),
        ]);

        setUsers(dbUsers);
        setEndpoints(dbEndpoints);
        setPromptLogs(dbPromptLogs);
        setDisplayedPromptLogs(dbPromptLogs);
        setDataLogs(dbDataLogs);
        setDisplayedDataLogs(dbDataLogs);
        setNotifications(dbNotifications);
        setDataLineage(dbDataLineage);

        if (finalSettings) {
            setTheme(finalSettings.theme);
            setLogRetentionDays(finalSettings.logRetentionDays);
            if (finalSettings.theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
      } catch (error) {
        console.error("Failed to initialize database:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeDatabase();
  }, []);

  const getSecurityScoreForEndpoint = useCallback((endpointId: string, logSet?: { promptLogs: LogEntry[]; dataLogs: LogEntry[] }): number => {
    const endpoint = endpoints.find(e => e.id === endpointId);
    if (!endpoint) return 0;

    const relevantPromptLogs = (logSet ? logSet.promptLogs : promptLogs).filter(l => l.endpoint === endpoint.name);
    const relevantDataLogs = (logSet ? logSet.dataLogs : dataLogs).filter(l => l.endpoint === endpoint.name);
    
    let score = 100;

    const criticalLogsCount = relevantPromptLogs.filter(l => l.level === 'critical').length + relevantDataLogs.filter(l => l.level === 'critical').length;
    const warningLogsCount = relevantPromptLogs.filter(l => l.level === 'warning').length + relevantDataLogs.filter(l => l.level === 'warning').length;

    score -= criticalLogsCount * 10;
    score -= warningLogsCount * 5;

    if (endpoint.ipWhitelist.length === 0) {
      score -= 5;
    }
    
    if (endpoint.status === 'inactive') {
      score -= 20;
    }

    return Math.max(0, Math.round(score));
  }, [endpoints, promptLogs, dataLogs]);

  const toggleTheme = useCallback(async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    await db.settings.update(0, { theme: newTheme });
  }, [theme]);
  
  const updateLogRetention = useCallback(async (days: LogRetentionPeriod) => {
    setLogRetentionDays(days);
    await db.settings.update(0, { logRetentionDays: days });

    if (days > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const cutoffTimestamp = cutoffDate.toISOString();
      await db.promptLogs.where('timestamp').below(cutoffTimestamp).delete();
      await db.dataLogs.where('timestamp').below(cutoffTimestamp).delete();
    }

    const [refreshedPromptLogs, refreshedDataLogs] = await Promise.all([
      db.promptLogs.orderBy('timestamp').reverse().toArray(),
      db.dataLogs.orderBy('timestamp').reverse().toArray(),
    ]);

    setPromptLogs(refreshedPromptLogs);
    setDisplayedPromptLogs(refreshedPromptLogs);
    setDataLogs(refreshedDataLogs);
    setDisplayedDataLogs(refreshedDataLogs);
    
    if (isFiltered) {
      setIsFiltered(false);
    }
  }, [isFiltered]);
  
  const login = async (email: string, password_param: string, role: UserRole): Promise<boolean> => {
    const user = await db.users.where('email').equalsIgnoreCase(email).first();
    
    if (user && user.password === password_param && user.role === role) {
        setIsAuthenticated(true);
        setCurrentUser(user); 
        return true;
    }
    
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };
  
  const register = async (name: string, email: string, password_param: string): Promise<boolean> => {
    const existingUser = await db.users.where('email').equalsIgnoreCase(email).first();
    if (existingUser) return false;
    
    const newUser: User = {
        id: `usr-${Date.now()}`, name, email, password: password_param,
        role: 'Viewer', lastActive: 'Just now',
    };
    
    await db.users.add(newUser);
    setUsers(prev => [...prev, newUser]);
    return true;
  };

  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => {
    const newNotification: Notification = {
      id: `notif-${Date.now()}`, timestamp: new Date().toISOString(), read: false, ...notification,
    };
    await db.notifications.add(newNotification);
    setNotifications(prev => [newNotification, ...prev].slice(0, 20));
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    await db.notifications.where('read').equals(0).modify({ read: true });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const resetFilterState = useCallback(() => {
    setIsFiltered(false);
  }, []);

  const clearSearch = useCallback(() => {
    setDisplayedPromptLogs(promptLogs);
    setDisplayedDataLogs(dataLogs);
    resetFilterState();
  }, [promptLogs, dataLogs, resetFilterState]);

  const addPromptLog = useCallback(async (log: Omit<LogEntry, 'id'>) => {
    const newLog: LogEntry = { id: `log-p-${Date.now()}`, ...log };
    await db.promptLogs.add(newLog);
    
    setPromptLogs(prev => [newLog, ...prev]);
    if (!isFiltered) {
        setDisplayedPromptLogs(prev => [newLog, ...prev]);
    }
    
    if (log.level === 'critical') {
        await addNotification({ message: `Prompt Firewall: ${log.message}`, type: 'critical' });
    }
}, [isFiltered, addNotification]);
  
const addDataLog = useCallback(async (log: Omit<LogEntry, 'id'>) => {
    const newLog: LogEntry = { id: `log-d-${Date.now()}`, ...log };
    await db.dataLogs.add(newLog);
    
    setDataLogs(prev => [newLog, ...prev]);
    if (!isFiltered) {
        setDisplayedDataLogs(prev => [newLog, ...prev]);
    }

    if (log.level === 'critical') {
        await addNotification({ message: `Data Detector: ${log.message}`, type: 'critical' });
    }
}, [isFiltered, addNotification]);

  const addEndpoint = async (endpointData: Omit<Endpoint, 'id' | 'apiKey' | 'createdAt'>) => {
    const timestamp = Date.now();
    const isoTimestamp = new Date(timestamp).toISOString();
    
    const newEndpoint: Endpoint = {
      id: `ep-${timestamp}`,
      apiKey: `prod_sk_${Math.random().toString(36).substring(2, 12)}...`,
      createdAt: isoTimestamp.split('T')[0],
      ...endpointData,
    };

    const newModelLineage: ModelLineage = {
        modelId: newEndpoint.id,
        modelName: `${newEndpoint.name} Model`,
        modelVersion: '1.0.0',
        trainingData: [
            {
                datasetId: `ds-gen-${timestamp}`,
                datasetName: 'Generic Placeholder Dataset',
                sources: [
                    {
                        id: `src-gen-${timestamp}`,
                        name: 'Unspecified Data Source',
                        type: 'Internal Dataset',
                        trustStatus: 'Unverified',
                        timestamp: isoTimestamp,
                        details: { info: 'Auto-generated for new endpoint.' }
                    }
                ],
                processingScriptUrl: 'N/A',
                processingScriptHash: 'N/A',
                timestamp: isoTimestamp,
            }
        ],
        inferenceInputSource: {
            id: `src-inf-${timestamp}`,
            name: 'Live User Input Stream',
            type: 'API Feed',
            trustStatus: 'Unverified',
            timestamp: isoTimestamp,
            details: { info: `Input from the new '${newEndpoint.name}' endpoint.` }
        }
    };

    await db.endpoints.add(newEndpoint);
    await db.dataLineage.add(newModelLineage);

    setEndpoints(prev => [newEndpoint, ...prev]);
    setDataLineage(prev => [newModelLineage, ...prev]);
  };

  const updateEndpoint = async (endpointId: string, endpointData: Omit<Endpoint, 'id' | 'apiKey' | 'createdAt'>) => {
    await db.endpoints.update(endpointId, endpointData);
    setEndpoints(prev =>
        prev.map(ep =>
            ep.id === endpointId ? { ...ep, ...endpointData } : ep
        )
    );
  };

  const toggleEndpointStatus = async (endpointId: string) => {
    const endpoint = await db.endpoints.get(endpointId);
    if (endpoint) {
      const newStatus = endpoint.status === 'active' ? 'inactive' : 'active';
      await db.endpoints.update(endpointId, { status: newStatus });
      setEndpoints(prev => prev.map(ep => ep.id === endpointId ? { ...ep, status: newStatus } : ep));
    }
  };
  
  const deleteEndpoint = useCallback(async (endpointId: string, options: { keepLogs: boolean }) => {
    const endpointToDelete = await db.endpoints.get(endpointId);
    
    if (!endpointToDelete) {
      console.warn(`Endpoint with id ${endpointId} not found in DB. It might have been already deleted.`);
      setEndpoints(prev => prev.filter(ep => ep.id !== endpointId));
      setDataLineage(prev => prev.filter(l => l.modelId !== endpointId));
      return;
    }
  
    // DB operations
    await db.endpoints.delete(endpointId);
    await db.dataLineage.delete(endpointId);
    
    let notificationMessage = `Endpoint "${endpointToDelete.name}" has been deleted.`;

    if (!options.keepLogs) {
        const endpointName = endpointToDelete.name;
        await db.promptLogs.where('endpoint').equals(endpointName).delete();
        await db.dataLogs.where('endpoint').equals(endpointName).delete();
        notificationMessage = `Endpoint "${endpointToDelete.name}" and all its logs have been deleted.`;

        const [refreshedPromptLogs, refreshedDataLogs] = await Promise.all([
            db.promptLogs.orderBy('timestamp').reverse().toArray(),
            db.dataLogs.orderBy('timestamp').reverse().toArray(),
        ]);
        setPromptLogs(refreshedPromptLogs);
        setDataLogs(refreshedDataLogs);
        
        // This is effectively `clearSearch` but with the new data
        setDisplayedPromptLogs(refreshedPromptLogs);
        setDisplayedDataLogs(refreshedDataLogs);
        resetFilterState();
    }

    // State updates for endpoint and lineage
    setEndpoints(prev => prev.filter(ep => ep.id !== endpointId));
    setDataLineage(prev => prev.filter(l => l.modelId !== endpointId));
  
    await addNotification({
      message: notificationMessage,
      type: 'info'
    });
  }, [addNotification, resetFilterState]);

  const addUser = async (userData: Omit<User, 'id' | 'lastActive' | 'password'>) => {
    const newUser: User = {
        id: `usr-${Date.now()}`, lastActive: 'Just now', password: 'defaultpassword', ...userData,
    };
    await db.users.add(newUser);
    setUsers(prev => [newUser, ...prev]);
  };

  const updateUser = async (userId: string, userData: Pick<User, 'name' | 'email' | 'role'>) => {
    await db.users.update(userId, { ...userData, lastActive: 'Just now' });
    let updatedUser: User | undefined;
    setUsers(prev =>
      prev.map(user => {
        if (user.id === userId) {
          updatedUser = { ...user, ...userData, lastActive: 'Just now' };
          return updatedUser;
        }
        return user;
      })
    );
     if (updatedUser && currentUser && updatedUser.id === currentUser.id) {
        setCurrentUser(prev => prev ? { ...prev, name: updatedUser.name, email: updatedUser.email } : null);
    }
  };

  const deleteUser = async (userId: string) => {
    await db.users.delete(userId);
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const performSearch = async (query: string) => {
    if (!query.trim()) { clearSearch(); return; }
    setIsLoadingSearch(true);
    setIsFiltered(true);
    try {
      const filters = await parseNaturalLanguageSearch(query, endpoints.map(e => e.name));
      const applyFilters = (logs: LogEntry[]) => logs.filter(log => {
          const logDate = new Date(log.timestamp).getTime();
          const now = new Date().getTime();
          let timeframeValid = true;
          if (filters.timeframe === 'last_hour') timeframeValid = logDate > now - 36e5;
          else if (filters.timeframe === 'last_24_hours') timeframeValid = logDate > now - 864e5;
          else if (filters.timeframe === 'last_7_days') timeframeValid = logDate > now - 6048e5;
          if (!timeframeValid) return false;
          if (filters.levels?.length && !filters.levels.includes(log.level)) return false;
          if (filters.endpointNames?.length && !filters.endpointNames.includes(log.endpoint)) return false;
          if (filters.searchText) {
              const lowerSearch = filters.searchText.toLowerCase();
              if (!log.message.toLowerCase().includes(lowerSearch) && !log.payload?.toLowerCase().includes(lowerSearch)) return false;
          }
          return true;
      });
      setDisplayedPromptLogs(filters.logType === 'data' ? [] : applyFilters(promptLogs));
      setDisplayedDataLogs(filters.logType === 'prompt' ? [] : applyFilters(dataLogs));
    } catch (error) { console.error("Search failed:", error); }
    finally { setIsLoadingSearch(false); }
  };

  const value: AppContextType = {
    endpoints, promptLogs, dataLogs, displayedPromptLogs, displayedDataLogs, users, currentUser, notifications,
    isLoadingSearch, isFiltered, isAuthenticated, isInitializing, login, logout, register, addPromptLog, addDataLog, addEndpoint,
    updateEndpoint, toggleEndpointStatus, deleteEndpoint, performSearch, clearSearch, resetFilterState, addUser, updateUser, deleteUser, addNotification, markAllNotificationsAsRead,
    theme, logRetentionDays, toggleTheme, updateLogRetention, getSecurityScoreForEndpoint,
    dataLineage
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
