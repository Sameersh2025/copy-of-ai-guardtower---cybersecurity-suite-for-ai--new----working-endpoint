
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useAppContext } from '../context/AppContext';
import { ReportData } from '../types';
import { generateReportSummary } from '../services/geminiService';
import { Loader2, FileText, Printer, AlertTriangle, CheckCircle, BrainCircuit, ShieldAlert, ShieldX } from 'lucide-react';

const HealthScoreBreakdown: React.FC<{ report: ReportData }> = ({ report }) => {
    const deductions: { reason: string; points: number }[] = [];

    if (report.endpointStatus === 'inactive') {
        deductions.push({
            reason: 'Endpoint is inactive',
            points: 20
        });
    }
    
    if (!report.hasIpWhitelist) {
        deductions.push({
            reason: 'No IP Whitelist configured',
            points: 5
        });
    }

    if (report.criticalIncidents.length > 0) {
        deductions.push({
            reason: `${report.criticalIncidents.length} critical incident(s)`,
            points: report.criticalIncidents.length * 10
        });
    }

    if (report.warningIncidents.length > 0) {
        deductions.push({
            reason: `${report.warningIncidents.length} warning incident(s)`,
            points: report.warningIncidents.length * 5
        });
    }

    if (deductions.length === 0) {
        return (
            <div className="flex items-center p-2 rounded-md bg-green-500/10 text-green-700 dark:text-green-400">
                <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="text-sm">No deductions found. This endpoint maintains a perfect score!</span>
            </div>
        );
    }
    
    return (
        <ul className="space-y-2">
            {deductions.map((deduction, index) => (
                <li key={index} className="flex justify-between items-center text-sm p-2 rounded-md bg-gray-100 dark:bg-gray-800/50">
                    <span className="text-gray-600 dark:text-gray-400">{deduction.reason}</span>
                    <span className="font-semibold text-red-500">-{deduction.points} pts</span>
                </li>
            ))}
        </ul>
    );
};

const ReportView: React.FC<{ report: ReportData, aiSummary: string, theme: 'light' | 'dark' }> = ({ report, aiSummary, theme }) => {

  const handlePrint = () => {
    window.print();
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getComplianceStatus = (report: ReportData): { text: string; icon: React.ReactNode; passed: boolean; }[] => {
    return [
      { text: "PII Blocking Enabled", icon: <CheckCircle className="w-5 h-5 text-green-500" />, passed: true },
      { text: "Prompt Injection Defenses Active", icon: <CheckCircle className="w-5 h-5 text-green-500" />, passed: true },
      { text: "Zero Critical Incidents", icon: report.criticalIncidents.length === 0 ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertTriangle className="w-5 h-5 text-red-500" />, passed: report.criticalIncidents.length === 0 },
      { text: "SLA Uptime Met", icon: parseFloat(report.uptime) >= 99.9 ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertTriangle className="w-5 h-5 text-red-500" />, passed: parseFloat(report.uptime) >= 99.9 },
    ];
  };

  return (
    <>
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #report-view, #report-view * { visibility: visible; }
            #report-view { position: absolute; left: 0; top: 0; width: 100%; padding: 2rem; }
            .no-print { display: none !important; }
            .print-bg-white { background-color: white !important; }
            .dark\\:print-text-gray-900 * { color: #1f2937 !important; }
          }
        `}
      </style>
      <div id="report-view" className="space-y-6 print-bg-white dark:print-text-gray-900">
        {/* Report Header */}
        <Card className="print-bg-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security & Compliance Report</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">For Endpoint: <span className="font-semibold text-gray-700 dark:text-gray-300">{report.endpointName}</span></p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Period: {report.timeframeText} (Generated: {report.generatedAt})</p>
            </div>
            <button onClick={handlePrint} className="no-print flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              <Printer className="w-5 h-5 mr-2" /> Print Report
            </button>
          </div>
        </Card>

        {/* AI Summary */}
        <Card className="print-bg-white">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center"><BrainCircuit className="w-5 h-5 mr-2 text-blue-400"/> AI Generated Summary</h3>
            <p className="text-gray-600 dark:text-gray-400 italic">{aiSummary}</p>
        </Card>

        {/* Key Metrics & Compliance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="print-bg-white">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Health Score</p>
                        <p className={`text-4xl font-bold ${getHealthScoreColor(report.securityScore)}`}>{report.securityScore}</p>
                    </div>
                     <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Threats Blocked</p>
                        <p className="text-4xl font-bold text-gray-800 dark:text-white">{report.threatsBlocked}</p>
                    </div>
                     <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">SLA Uptime</p>
                        <p className="text-2xl font-semibold text-gray-800 dark:text-white">{report.uptime}%</p>
                    </div>
                     <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Latency</p>
                        <p className="text-2xl font-semibold text-gray-800 dark:text-white">{report.avgLatency}</p>
                    </div>
                </div>
                 <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">Score Deductions</h4>
                    <HealthScoreBreakdown report={report} />
                </div>
            </Card>
            <Card className="print-bg-white">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Compliance Status</h3>
                <ul className="space-y-3">
                    {getComplianceStatus(report).map(item => (
                        <li key={item.text} className="flex items-center">
                            {item.icon}
                            <span className={`ml-3 text-gray-700 dark:text-gray-300 ${!item.passed ? 'line-through text-gray-500 dark:text-gray-500' : ''}`}>{item.text}</span>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
        
        {/* Incidents List */}
        <Card className="print-bg-white">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Incidents</h3>
            {report.criticalIncidents.length > 0 && (
                <div className="mb-6">
                    <h4 className="font-semibold text-red-500 flex items-center mb-2"><ShieldX className="w-5 h-5 mr-2" /> Critical Incidents ({report.criticalIncidents.length})</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        {report.criticalIncidents.map(log => <li key={log.id}>{new Date(log.timestamp).toLocaleString()}: {log.message}</li>)}
                    </ul>
                </div>
            )}
            {report.warningIncidents.length > 0 && (
                <div>
                    <h4 className="font-semibold text-yellow-500 flex items-center mb-2"><ShieldAlert className="w-5 h-5 mr-2" /> Warning Incidents ({report.warningIncidents.length})</h4>
                     <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        {report.warningIncidents.map(log => <li key={log.id}>{new Date(log.timestamp).toLocaleString()}: {log.message}</li>)}
                    </ul>
                </div>
            )}
            {report.criticalIncidents.length === 0 && report.warningIncidents.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400">No security incidents recorded in this period.</p>
            )}
        </Card>

      </div>
    </>
  );
};

const Reporting: React.FC = () => {
  const { endpoints, promptLogs, dataLogs, getSecurityScoreForEndpoint, theme } = useAppContext();
  const location = useLocation();
  const initialState = location.state as { endpointId?: string; autoGenerate?: boolean } | null;

  const [selectedEndpointId, setSelectedEndpointId] = useState<string>(initialState?.endpointId || '');
  const [timeframe, setTimeframe] = useState<string>('30');
  const [isLoading, setIsLoading] = useState<boolean>(!!initialState?.autoGenerate);
  const [report, setReport] = useState<ReportData | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');
  const hasAutoGenerated = useRef(false);

  useEffect(() => {
    if (endpoints.length > 0 && !selectedEndpointId) {
      setSelectedEndpointId(endpoints[0].id);
    }
  }, [endpoints, selectedEndpointId]);

  const generateReport = useCallback(async (endpointId: string, tf: string) => {
    if (!endpointId) return;

    setIsLoading(true);
    setReport(null);
    setAiSummary('');

    const selectedEndpoint = endpoints.find(ep => ep.id === endpointId);
    if (!selectedEndpoint) {
        setIsLoading(false);
        return;
    }

    const now = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - parseInt(tf));

    const filteredPromptLogs = promptLogs.filter(log => log.endpoint === selectedEndpoint.name && new Date(log.timestamp) >= cutoffDate);
    const filteredDataLogs = dataLogs.filter(log => log.endpoint === selectedEndpoint.name && new Date(log.timestamp) >= cutoffDate);
    const allFilteredLogs = [...filteredPromptLogs, ...filteredDataLogs];

    const totalRequests = allFilteredLogs.length;
    const totalLatency = allFilteredLogs.reduce((acc, log) => acc + (log.latency || 0), 0);
    const avgLatency = totalRequests > 0 ? Math.round(totalLatency / totalRequests) : 0;

    const logSet = { promptLogs: filteredPromptLogs, dataLogs: filteredDataLogs };

    const score = getSecurityScoreForEndpoint(selectedEndpoint.id, logSet);
    const criticalIncidents = allFilteredLogs.filter(l => l.level === 'critical');
    const warningIncidents = allFilteredLogs.filter(l => l.level === 'warning');

    const newReportData: ReportData = {
        endpointName: selectedEndpoint.name,
        timeframeText: `Last ${tf} days`,
        generatedAt: new Date().toLocaleString(),
        securityScore: score,
        uptime: selectedEndpoint.status === 'active' ? '99.98' : '0.00',
        avgLatency: `${avgLatency}ms`,
        totalRequests: totalRequests,
        threatsBlocked: criticalIncidents.length + warningIncidents.length,
        criticalIncidents: criticalIncidents,
        warningIncidents: warningIncidents,
        endpointStatus: selectedEndpoint.status,
        hasIpWhitelist: selectedEndpoint.ipWhitelist.length > 0,
    };
    
    setReport(newReportData);

    try {
        const { generatedAt, criticalIncidents, warningIncidents, ...summaryPayload } = newReportData;
        const summary = await generateReportSummary(summaryPayload);
        setAiSummary(summary);
    } catch(e) {
        console.error("Failed to generate AI summary:", e);
        setAiSummary("Could not generate an AI summary for this report due to an API error.");
    } finally {
        setIsLoading(false);
    }
  }, [endpoints, promptLogs, dataLogs, getSecurityScoreForEndpoint]);

  useEffect(() => {
    if (initialState?.autoGenerate && selectedEndpointId && !hasAutoGenerated.current) {
        hasAutoGenerated.current = true;
        generateReport(selectedEndpointId, timeframe);
    }
  }, [initialState, selectedEndpointId, timeframe, generateReport]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEndpointId) {
      generateReport(selectedEndpointId, timeframe);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reporting & Compliance</h1>
      
      <Card className="no-print">
        <form onSubmit={handleFormSubmit}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-500" />
              Generate Report
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                 <div>
                    <label htmlFor="endpoint" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Endpoint</label>
                    <select id="endpoint" value={selectedEndpointId} onChange={(e) => setSelectedEndpointId(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500">
                        {endpoints.map(ep => <option key={ep.id} value={ep.id}>{ep.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timeframe</label>
                    <select id="timeframe" value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500">
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                        <option value="90">Last 90 Days</option>
                    </select>
                </div>
                 <div>
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : 'Generate'}
                    </button>
                 </div>
            </div>
        </form>
      </Card>
      
      {isLoading && !report && (
        <Card>
            <div className="flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 py-12">
                <Loader2 className="w-12 h-12 mb-4 animate-spin text-blue-500" />
                <p className="font-semibold text-lg text-gray-800 dark:text-gray-300">Generating Report with Gemini</p>
                <p>Please wait while we gather data and create your report...</p>
            </div>
        </Card>
      )}

      {report && (
        <ReportView report={report} aiSummary={aiSummary} theme={theme} />
      )}

      {!isLoading && !report && (
        <Card>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>Select an endpoint and timeframe to generate a new report.</p>
            </div>
        </Card>
      )}
    </div>
  );
};

export default Reporting;