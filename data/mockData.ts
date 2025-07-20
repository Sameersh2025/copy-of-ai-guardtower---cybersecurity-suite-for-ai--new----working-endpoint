
import { Endpoint, LogEntry, User, ModelLineage } from '../types';

// Helper to generate recent timestamps
const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();

export const mockEndpoints: Endpoint[] = [
  { id: 'ep-001', name: 'Production Chatbot API', url: 'https://api.example.com/v1/chatbot', apiKey: 'prod_sk_abc...xyz', rateLimit: 100, ipWhitelist: ['203.0.113.1', '198.51.100.5'], status: 'active', createdAt: '2023-10-26' },
  { id: 'ep-002', name: 'Image Generation Service', url: 'https://api.example.com/v1/imggen', apiKey: 'img_sk_123...789', rateLimit: 50, ipWhitelist: [], status: 'active', createdAt: '2023-10-25' },
  { id: 'ep-003', name: 'Staging Summarizer', url: 'https://staging.api.example.com/v1/summarize', apiKey: 'stg_sk_def...uvw', rateLimit: 1000, ipWhitelist: ['127.0.0.1'], status: 'inactive', createdAt: '2023-09-15' },
  { id: 'ep-004', name: 'Internal Analytics Engine', url: 'https://internal.api.example.com/v1/analytics', apiKey: 'int_sk_456...123', rateLimit: 500, ipWhitelist: ['10.0.0.0/8'], status: 'inactive', createdAt: '2023-11-01' },
  { id: 'ep-005', name: 'Content Moderation API', url: 'https://api.example.com/v1/moderate', apiKey: 'mod_sk_pqr...mno', rateLimit: 200, ipWhitelist: [], status: 'active', createdAt: '2023-11-15' },
  { id: 'ep-006', name: 'Beta Features API', url: 'https://beta.api.example.com/v1/features', apiKey: 'beta_sk_xyz...abc', rateLimit: 20, ipWhitelist: [], status: 'active', createdAt: '2023-11-20' },
  { id: 'ep-007', name: 'Financial Data Analysis API', url: 'https://api.example.com/v1/finance', apiKey: 'fin_sk_lmn...opq', rateLimit: 75, ipWhitelist: ['54.123.45.67'], status: 'active', createdAt: '2023-11-28' },
];

const generateRandomLogs = (count: number, type: 'prompt' | 'data'): LogEntry[] => {
    const logs: LogEntry[] = [];
    const endpoints = mockEndpoints.filter(e => e.status === 'active');
    if (endpoints.length === 0) return [];

    for (let i = 0; i < count; i++) {
        const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
        const levelOptions: LogEntry['level'][] = ['info', 'info', 'info', 'info', 'info', 'info', 'warning', 'critical'];
        const level = levelOptions[Math.floor(Math.random() * levelOptions.length)];
        const hour = Math.random() * 48; // up to 48 hours ago
        
        let message = "Request processed successfully.";
        let payload = "Benign request payload.";
        if(level === 'warning') {
            message = "Potential suspicious activity detected.";
            payload = "Slightly unusual payload text.";
        } else if (level === 'critical') {
            message = type === 'prompt' ? "Prompt injection attack blocked." : "PII (SSN) detected in payload.";
            payload = type === 'prompt' ? "IGNORE ALL PREVIOUS INSTRUCTIONS..." : "My SSN is 000-00-0000, please use it for my account.";
        }

        logs.push({
            id: `log-${type === 'prompt' ? 'p' : 'd'}-${Date.now()}-${i}`,
            timestamp: hoursAgo(hour),
            endpoint: endpoint.name,
            ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
            level,
            message,
            payload,
            latency: Math.round(50 + Math.random() * 450) // 50ms to 500ms
        });
    }
    return logs;
}

export const mockPromptLogs: LogEntry[] = generateRandomLogs(150, 'prompt');

export const mockDataLogs: LogEntry[] = generateRandomLogs(50, 'data');

export const mockUsers: User[] = [
    { id: 'usr-001', name: 'Alice Admin', email: 'alice@example.com', role: 'Admin', lastActive: '2 hours ago' },
    { id: 'usr-002', name: 'Bob Developer', email: 'bob@example.com', role: 'Developer', lastActive: '30 minutes ago' },
    { id: 'usr-003', name: 'Charlie Viewer', email: 'charlie@example.com', role: 'Viewer', lastActive: '5 days ago' },
    { id: 'usr-004', name: 'David Developer', email: 'david@example.com', role: 'Developer', lastActive: '1 day ago' },
];

export const dashboardChartData = [
    { name: '7d ago', requests: 4000, blocked: 24 },
    { name: '6d ago', requests: 3000, blocked: 13 },
    { name: '5d ago', requests: 2000, blocked: 98 },
    { name: '4d ago', requests: 2780, blocked: 39 },
    { name: '3d ago', requests: 1890, blocked: 48 },
    { name: '2d ago', requests: 2390, blocked: 38 },
    { name: 'Yesterday', requests: 3490, blocked: 43 },
    { name: 'Today', requests: 2500, blocked: 12 },
];

export const mockDataLineage: ModelLineage[] = [
  {
    modelId: 'ep-001',
    modelName: 'Chatbot v3.2',
    modelVersion: '3.2.1-prod',
    trainingData: [
      {
        datasetId: 'ds-conv-001',
        datasetName: 'Conversational Dataset Q3 2023',
        sources: [
          { 
            id: 'src-001',
            name: 'Customer Support Logs',
            type: 'Postgres DB',
            trustStatus: 'Trusted',
            timestamp: '2023-09-01T00:00:00Z',
            details: { connection: 'db.prod.internal', table: 'support_chats' }
          },
          { 
            id: 'src-002',
            name: 'Web Analytics User Flow',
            type: 'S3 Bucket',
            trustStatus: 'Trusted',
            timestamp: '2023-09-01T00:00:00Z',
            details: { bucket: 's3://prod-analytics/user-flows/', region: 'us-east-1' }
          },
        ],
        processingScriptUrl: 'github.com/org/repo/scripts/clean_chat_data.py',
        processingScriptHash: 'a1b2c3d4e5f6',
        timestamp: '2023-09-15T00:00:00Z',
      },
    ],
    inferenceInputSource: {
      id: 'src-003',
      name: 'Live User Input Stream',
      type: 'API Feed',
      trustStatus: 'Unverified',
      timestamp: '2023-10-27T12:00:00Z',
      details: { info: 'Input from all users via the API Gateway.' }
    },
  },
  {
    modelId: 'ep-002',
    modelName: 'Stable Diffusion XL Custom',
    modelVersion: '1.5.2-img',
    trainingData: [
      {
        datasetId: 'ds-img-laion-001',
        datasetName: 'LAION-5B Filtered Subset',
        sources: [
          { 
            id: 'src-004',
            name: 'LAION Public Dataset',
            type: 'S3 Bucket',
            trustStatus: 'Trusted',
            timestamp: '2023-08-01T00:00:00Z',
            details: { bucket: 's3://laion-public/5b-en/', region: 'us-west-2' }
          },
        ],
        processingScriptUrl: 'github.com/org/repo/scripts/filter_laion.py',
        processingScriptHash: 'b2c3d4e5f6a1',
        timestamp: '2023-08-10T00:00:00Z',
      },
      {
        datasetId: 'ds-img-internal-002',
        datasetName: 'Internal Curated Artworks',
        sources: [
           { 
            id: 'src-005',
            name: 'Curated Internal Artworks',
            type: 'Internal Dataset',
            trustStatus: 'Trusted',
            timestamp: '2023-08-01T00:00:00Z',
            details: { location: 'internal NAS', curated_by: 'Art Team' }
          },
          {
            id: 'src-006',
            name: 'Third-party Image Feed',
            type: 'API Feed',
            trustStatus: 'Untrusted',
            timestamp: '2023-08-01T00:00:00Z',
            details: { url: 'https://api.untrustedimages.com/v1/feed', warning: 'Source has no verifiable chain of custody.' }
          },
        ],
        processingScriptUrl: 'github.com/org/repo/scripts/process_artworks.py',
        processingScriptHash: 'c3d4e5f6a1b2',
        timestamp: '2023-08-12T00:00:00Z',
      }
    ],
    inferenceInputSource: {
      id: 'src-007',
      name: 'User Text Prompts',
      type: 'API Feed',
      trustStatus: 'Unverified',
      timestamp: '2023-10-27T12:05:00Z',
      details: { info: 'Text prompts sent to the image generation endpoint.' }
    },
  },
  {
    modelId: 'ep-003',
    modelName: 'Text Summarizer v1.1',
    modelVersion: '1.1.0-staging',
    trainingData: [
      {
        datasetId: 'ds-news-001',
        datasetName: 'News Articles 2023',
        sources: [
          { 
            id: 'src-008',
            name: 'Public News Feeds',
            type: 'API Feed',
            trustStatus: 'Unverified',
            timestamp: '2023-07-01T00:00:00Z',
            details: { source: 'Various public news APIs' }
          },
        ],
        processingScriptUrl: 'github.com/org/repo/scripts/summarizer_data_prep.py',
        processingScriptHash: 'd4e5f6a1b2c3',
        timestamp: '2023-07-15T00:00:00Z',
      },
    ],
    inferenceInputSource: {
      id: 'src-009',
      name: 'User Text Input',
      type: 'API Feed',
      trustStatus: 'Unverified',
      timestamp: '2023-10-27T14:00:00Z',
      details: { info: 'Raw text input from the staging summarizer endpoint.' }
    },
  },
  {
    modelId: 'ep-004',
    modelName: 'Internal Analytics Engine',
    modelVersion: '2.0.0-internal',
    trainingData: [
        {
            datasetId: 'ds-metrics-001',
            datasetName: 'Internal Performance Metrics',
            sources: [
                {
                    id: 'src-010',
                    name: 'Prometheus Metrics DB',
                    type: 'Postgres DB',
                    trustStatus: 'Trusted',
                    timestamp: '2023-10-01T00:00:00Z',
                    details: { connection: 'db.internal.metrics', table: 'api_performance' }
                }
            ],
            processingScriptUrl: 'github.com/org/repo/scripts/process_metrics.py',
            processingScriptHash: 'e5f6a1b2c3d4',
            timestamp: '2023-10-02T00:00:00Z',
        }
    ],
    inferenceInputSource: {
        id: 'src-011',
        name: 'Internal Cron Job Query',
        type: 'Internal Dataset',
        trustStatus: 'Trusted',
        timestamp: '2023-11-01T08:00:00Z',
        details: { info: 'Scheduled query for internal analytics report.' }
    },
  },
  {
    modelId: 'ep-005',
    modelName: 'Moderation Filter v2.1',
    modelVersion: '2.1.0-prod',
    trainingData: [
        {
            datasetId: 'ds-mod-001',
            datasetName: 'Policy Violations Dataset',
            sources: [
                {
                    id: 'src-012',
                    name: 'Internal Review Logs',
                    type: 'Postgres DB',
                    trustStatus: 'Trusted',
                    timestamp: '2023-10-10T00:00:00Z',
                    details: { connection: 'db.prod.internal', table: 'moderation_cases' }
                },
                {
                    id: 'src-013',
                    name: 'Public Content Flags API',
                    type: 'API Feed',
                    trustStatus: 'Untrusted',
                    timestamp: '2023-10-11T00:00:00Z',
                    details: { url: 'https://api.publicflags.com/v1/feed', warning: 'Data is user-submitted and may be inaccurate.' }
                }
            ],
            processingScriptUrl: 'github.com/org/repo/scripts/process_moderation_data.py',
            processingScriptHash: 'f6a1b2c3d4e5',
            timestamp: '2023-10-20T00:00:00Z',
        }
    ],
    inferenceInputSource: {
        id: 'src-014',
        name: 'Live Content Feed',
        type: 'API Feed',
        trustStatus: 'Unverified',
        timestamp: '2023-11-15T10:00:00Z',
        details: { info: 'Live text and image content submitted for moderation.' }
    },
  },
  {
    modelId: 'ep-006',
    modelName: 'Feature-Flags-As-A-Service-v0.1',
    modelVersion: '0.1.0-beta',
    trainingData: [
        {
            datasetId: 'ds-beta-001',
            datasetName: 'Experimental User Telemetry',
            sources: [
                {
                    id: 'src-015',
                    name: 'Canary User Group Feed',
                    type: 'API Feed',
                    trustStatus: 'Unverified',
                    timestamp: '2023-11-05T00:00:00Z',
                    details: { info: 'Telemetry from canary release users.' }
                }
            ],
            processingScriptUrl: 'github.com/org/repo/scripts/process_beta_telemetry.py',
            processingScriptHash: 'a9b8c7d6e5f4',
            timestamp: '2023-11-06T00:00:00Z',
        }
    ],
    inferenceInputSource: {
        id: 'src-016',
        name: 'Beta Tester API Calls',
        type: 'API Feed',
        trustStatus: 'Unverified',
        timestamp: '2023-11-20T10:00:00Z',
        details: { info: 'Live API calls from whitelisted beta testers.' }
    },
  },
  {
    modelId: 'ep-007',
    modelName: 'FinBERT Custom v1.2',
    modelVersion: '1.2.0-fin',
    trainingData: [
        {
            datasetId: 'ds-fin-001',
            datasetName: 'SEC Filings Q1-Q3 2023',
            sources: [
                {
                    id: 'src-017',
                    name: 'SEC EDGAR Database Feed',
                    type: 'API Feed',
                    trustStatus: 'Trusted',
                    timestamp: '2023-10-01T00:00:00Z',
                    details: { source: 'https://www.sec.gov/edgar/searchedgar/companysearch' }
                }
            ],
            processingScriptUrl: 'github.com/org/repo/scripts/process_sec_filings.py',
            processingScriptHash: 'c4d5e6f1a2b3',
            timestamp: '2023-10-05T00:00:00Z',
        }
    ],
    inferenceInputSource: {
        id: 'src-018',
        name: 'User Financial Queries',
        type: 'API Feed',
        trustStatus: 'Unverified',
        timestamp: '2023-11-28T10:00:00Z',
        details: { info: 'Live API calls from registered financial analysts.' }
    },
  },
];
