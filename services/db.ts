
import Dexie, { type Table } from 'dexie';
import { User, Endpoint, LogEntry, Notification, AppSettings, ModelLineage } from '../types';

export const db = new Dexie('AIGuardTowerDB') as Dexie & {
  users: Table<User, string>;
  endpoints: Table<Endpoint, string>;
  promptLogs: Table<LogEntry, string>;
  dataLogs: Table<LogEntry, string>;
  notifications: Table<Notification, string>;
  settings: Table<AppSettings, number>;
  dataLineage: Table<ModelLineage, string>;
};

db.version(3).stores({
  // Primary keys are specified first.
  // Additional properties are indexed for faster queries.
  users: 'id, email, role',
  endpoints: 'id, name, status',
  promptLogs: 'id, timestamp, level, endpoint',
  dataLogs: 'id, timestamp, level, endpoint',
  notifications: 'id, timestamp, read',
  settings: 'id', // Existing table for app settings
  dataLineage: 'modelId' // New table for data lineage
});
