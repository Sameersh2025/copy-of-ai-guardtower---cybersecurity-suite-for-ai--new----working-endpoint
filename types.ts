
export interface Endpoint {
  id: string;
  name: string;
  url: string;
  apiKey: string;
  rateLimit: number;
  ipWhitelist: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

export type LogLevel = 'info' | 'warning' | 'critical';

export interface LogEntry {
  id: string;
  timestamp: string;
  endpoint: string;
  ip: string;
  level: LogLevel;
  message: string;
  payload?: string;
  latency?: number; // in milliseconds
}

export type UserRole = 'Admin' | 'Developer' | 'Viewer';

export interface User {
  id:string;
  name: string;
  email: string;
  role: UserRole;
  lastActive: string;
  password?: string; // Added for authentication
}

export interface AdversarialTestResult {
    summary: string;
    attackType: string;
    riskLevel: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
    analysis: string;
    recommendation: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'critical' | 'warning' | 'info';
  read: boolean;
  timestamp: string;
}

export interface SearchFilter {
    logType: 'prompt' | 'data' | 'all';
    levels: LogLevel[];
    endpointNames: string[];
    timeframe: 'last_hour' | 'last_24_hours' | 'last_7_days' | 'all_time';
    searchText: string;
}

export type Theme = 'light' | 'dark';
export type LogRetentionPeriod = 7 | 30 | 90 | 0; // 0 for 'Forever'

export interface AppSettings {
  id: number; // Use a fixed ID like 0 for the single settings object
  theme: Theme;
  logRetentionDays: LogRetentionPeriod;
}

export interface ReportData {
  endpointName: string;
  timeframeText: string;
  generatedAt: string;
  securityScore: number;
  uptime: string;
  avgLatency: string;
  totalRequests: number;
  threatsBlocked: number;
  criticalIncidents: LogEntry[];
  warningIncidents: LogEntry[];
  endpointStatus: 'active' | 'inactive';
  hasIpWhitelist: boolean;
}

export type TrustStatus = 'Trusted' | 'Untrusted' | 'Unverified';

export interface DataSource {
  id: string;
  name: string;
  type: 'Postgres DB' | 'S3 Bucket' | 'API Feed' | 'Internal Dataset';
  trustStatus: TrustStatus;
  timestamp: string;
  details: Record<string, string>;
}

export interface TrainingData {
    datasetId: string;
    datasetName: string;
    sources: DataSource[];
    processingScriptUrl: string;
    processingScriptHash: string;
    timestamp: string;
}

export interface ModelLineage {
    modelId: string; // Corresponds to an endpoint ID
    modelName: string;
    modelVersion: string;
    trainingData: TrainingData[];
    inferenceInputSource: DataSource;
}

export interface AppContextType {
  endpoints: Endpoint[];
  promptLogs: LogEntry[];
  dataLogs: LogEntry[];
  displayedPromptLogs: LogEntry[];
  displayedDataLogs: LogEntry[];
  users: User[];
  currentUser: User | null;
  notifications: Notification[];
  dataLineage: ModelLineage[];
  isLoadingSearch: boolean;
  isFiltered: boolean;
  isAuthenticated: boolean;
  isInitializing: boolean;
  theme: Theme;
  logRetentionDays: LogRetentionPeriod;
  getSecurityScoreForEndpoint: (endpointId: string, logSet?: { promptLogs: LogEntry[]; dataLogs: LogEntry[] }) => number;
  toggleTheme: () => void;
  updateLogRetention: (days: LogRetentionPeriod) => Promise<void>;
  login: (email: string, password_param: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password_param: string) => Promise<boolean>;
  addPromptLog: (log: Omit<LogEntry, 'id'>) => Promise<void>;
  addDataLog: (log: Omit<LogEntry, 'id'>) => Promise<void>;
  addEndpoint: (endpoint: Omit<Endpoint, 'id' | 'apiKey' | 'createdAt'>) => Promise<void>;
  updateEndpoint: (endpointId: string, endpointData: Omit<Endpoint, 'id' | 'apiKey' | 'createdAt'>) => Promise<void>;
  toggleEndpointStatus: (endpointId: string) => Promise<void>;
  deleteEndpoint: (endpointId: string, options: { keepLogs: boolean }) => Promise<void>;
  performSearch: (query: string) => Promise<void>;
  clearSearch: () => void;
  resetFilterState: () => void;
  addUser: (userData: Omit<User, 'id' | 'lastActive'>) => Promise<void>;
  updateUser: (userId: string, userData: Pick<User, 'name' | 'email' | 'role'>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
}
