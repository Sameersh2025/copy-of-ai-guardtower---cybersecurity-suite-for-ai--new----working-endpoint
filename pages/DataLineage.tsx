
import React, { useState, useMemo, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { DataSource, TrustStatus } from '../types';
import { GitBranch, Database, Cloud, Code, BrainCircuit, KeyRound, X, Info, CheckCircle, AlertTriangle } from 'lucide-react';

const getTrustStatusStyle = (status: TrustStatus) => {
    switch (status) {
        case 'Trusted': return { Icon: CheckCircle, badgeColor: 'green' as const, borderColor: 'border-green-500/50', textColor: 'text-green-400', glowClass: '' };
        case 'Unverified': return { Icon: Info, badgeColor: 'blue' as const, borderColor: 'border-blue-500/50', textColor: 'text-blue-400', glowClass: '' };
        case 'Untrusted': return { Icon: AlertTriangle, badgeColor: 'red' as const, borderColor: 'border-red-500/50', textColor: 'text-red-400', glowClass: 'untrusted-glow' };
    }
};

const getSourceTypeIcon = (type: DataSource['type']) => {
    const commonClasses = "w-5 h-5";
    switch (type) {
        case 'Postgres DB': return <Database className={commonClasses} />;
        case 'S3 Bucket': return <Cloud className={commonClasses} />;
        case 'API Feed': return <KeyRound className={commonClasses} />;
        case 'Internal Dataset': return <Database className={commonClasses} />;
        default: return <Info className={commonClasses} />;
    }
};

type DisplayNode = { id: string; name: string; type: string; details: Record<string, any>; trustStatus?: TrustStatus; };
type NodePosition = { x: number; y: number; width: number; height: number };
type Connection = { from: string, to: string };

const SVGConnections: React.FC<{ connections: Connection[], positions: Record<string, NodePosition>, containerRect: DOMRect | null }> = ({ connections, positions, containerRect }) => {
    if (!containerRect) return null;

    return (
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" aria-hidden="true">
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto" className="fill-current text-gray-300 dark:text-gray-600">
                    <polygon points="0 0, 10 3.5, 0 7" />
                </marker>
            </defs>
            {connections.map(({ from, to }) => {
                const fromPos = positions[from];
                const toPos = positions[to];

                if (!fromPos || !toPos) return null;

                const startX = fromPos.x - containerRect.x + fromPos.width;
                const startY = fromPos.y - containerRect.y + fromPos.height / 2;
                const endX = toPos.x - containerRect.x;
                const endY = toPos.y - containerRect.y + toPos.height / 2;

                const c1x = startX + Math.abs(endX - startX) * 0.5;
                const c2x = endX - Math.abs(endX - startX) * 0.5;

                const pathD = `M ${startX} ${startY} C ${c1x} ${startY}, ${c2x} ${endY}, ${endX - 10} ${endY}`;

                return (
                    <path key={`${from}-${to}`} d={pathD} stroke="currentColor" strokeWidth="2" fill="none" className="text-gray-300 dark:text-gray-600 animate-draw" markerEnd="url(#arrowhead)" />
                );
            })}
        </svg>
    );
};

const LineageNode: React.FC<{ node: DisplayNode; icon: React.ReactNode; isSelected: boolean; onClick: (node: DisplayNode) => void; forwardedRef: (el: HTMLDivElement | null) => void; animationDelay: string; }> = ({ node, icon, isSelected, onClick, forwardedRef, animationDelay }) => {
    const { borderColor, textColor, glowClass } = getTrustStatusStyle(node.trustStatus || 'Unverified');
    const selectedClasses = isSelected ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900 shadow-xl scale-105' : 'shadow-md';

    return (
        <div ref={forwardedRef} onClick={() => onClick(node)} style={{ animationDelay }} className={`animate-fade-in p-3 rounded-lg bg-white dark:bg-gray-800 border-2 ${borderColor} ${selectedClasses} ${glowClass} cursor-pointer hover:shadow-xl hover:scale-105 transition-all w-64 z-10`}>
            <div className="flex items-center space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 ${textColor}`}>{icon}</div>
                <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200 truncate" title={node.name}>{node.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{node.type}</p>
                </div>
            </div>
            {node.trustStatus && <div className="mt-2 text-right"><Badge color={getTrustStatusStyle(node.trustStatus).badgeColor}>{node.trustStatus}</Badge></div>}
        </div>
    );
};

const DetailsPanel: React.FC<{ node: DisplayNode | null; onClose: () => void }> = ({ node, onClose }) => {
    if (!node) return null;
    
    const { Icon, textColor, badgeColor } = getTrustStatusStyle(node.trustStatus || 'Unverified');
    let MainIcon = node.type.includes('Dataset') ? Code : node.type.includes('Model') ? BrainCircuit : Icon;

    return (
        <Card className="w-full h-full flex flex-col relative transition-all duration-300">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white z-10"><X className="w-6 h-6" /></button>
            <div className="flex items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700 mr-4 ${textColor}`}><MainIcon className="w-6 h-6" /></div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white" title={node.name}>{node.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{node.type}</p>
                </div>
            </div>
            <div className="space-y-4 flex-grow overflow-y-auto pr-2">
                {node.trustStatus && (<div><p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Trust Status</p><Badge color={badgeColor}>{node.trustStatus}</Badge></div>)}
                <div>
                    <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Details</h4>
                    <dl className="text-sm space-y-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                        {Object.entries(node.details).map(([key, value]) => (<div key={key} className="grid grid-cols-3 gap-2 items-start"><dt className="font-mono text-gray-500 dark:text-gray-500 capitalize col-span-1">{key.replace(/([A-Z])/g, ' $1').trim()}</dt><dd className="text-gray-800 dark:text-gray-200 font-mono break-words col-span-2">{String(value)}</dd></div>))}
                    </dl>
                </div>
            </div>
        </Card>
    );
};


const DataLineage: React.FC = () => {
    const { dataLineage, endpoints } = useAppContext();
    const [selectedModelId, setSelectedModelId] = useState<string>('');
    const [selectedNode, setSelectedNode] = useState<DisplayNode | null>(null);

    const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const [positions, setPositions] = useState<Record<string, NodePosition>>({});
    const [containerRect, setContainerRect] = useState<DOMRect | null>(null);

    const availableModels = useMemo(() => {
        const activeEndpointIds = new Set(endpoints.filter(e => e.status === 'active').map(e => e.id));
        return dataLineage.filter(l => activeEndpointIds.has(l.modelId));
    }, [endpoints, dataLineage]);

    useEffect(() => {
        // If there are available models and no model is selected OR the selected model is no longer available
        if (availableModels.length > 0 && (!selectedModelId || !availableModels.find(m => m.modelId === selectedModelId))) {
            setSelectedModelId(availableModels[0].modelId);
        } 
        // If there are no available models, clear the selection
        else if (availableModels.length === 0 && selectedModelId) {
            setSelectedModelId('');
        }
        setSelectedNode(null);
    }, [availableModels, selectedModelId]);
    
    const lineageToDisplay = useMemo(() => dataLineage.find(l => l.modelId === selectedModelId), [dataLineage, selectedModelId]);

    const calculatePositions = useCallback(() => {
        if (containerRef.current) setContainerRect(containerRef.current.getBoundingClientRect());
        const newPositions: Record<string, NodePosition> = {};
        Object.keys(nodeRefs.current).forEach(key => {
            const el = nodeRefs.current[key];
            if (el) newPositions[key] = el.getBoundingClientRect();
        });
        setPositions(newPositions);
    }, []);

    useLayoutEffect(() => {
        calculatePositions();
        const resizeObserver = new ResizeObserver(calculatePositions);
        if (containerRef.current) resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, [lineageToDisplay, calculatePositions]);

    const connections = useMemo((): Connection[] => {
        if (!lineageToDisplay) return [];
        const conns: Connection[] = [];
        lineageToDisplay.trainingData.forEach(td => {
            td.sources.forEach(source => conns.push({ from: source.id, to: td.datasetId }));
            conns.push({ from: td.datasetId, to: lineageToDisplay.modelId });
        });
        conns.push({ from: lineageToDisplay.inferenceInputSource.id, to: lineageToDisplay.modelId });
        return conns;
    }, [lineageToDisplay]);
    
    const overallTrustStatus = useMemo((): TrustStatus => {
        if (!lineageToDisplay) return 'Unverified';
        const allSources = [...lineageToDisplay.trainingData.flatMap(td => td.sources), lineageToDisplay.inferenceInputSource];
        if (allSources.some(s => s.trustStatus === 'Untrusted')) return 'Untrusted';
        if (allSources.some(s => s.trustStatus === 'Unverified')) return 'Unverified';
        return 'Trusted';
    }, [lineageToDisplay]);

    const OverallStatus = () => {
        if (!lineageToDisplay) return null;
        const { Icon, badgeColor, textColor } = getTrustStatusStyle(overallTrustStatus);
        return (<div className="text-right"><p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overall Chain of Custody</p><div className="flex items-center justify-end mt-1"><Badge color={badgeColor}>{overallTrustStatus}</Badge><span className="ml-2"><Icon className={`w-5 h-5 ${textColor}`} /></span></div></div>);
    };

    return (
        <div className="space-y-8 h-full flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center flex-shrink-0"><GitBranch className="w-8 h-8 mr-3 text-blue-500" />Data Lineage & Provenance</h1>
            <Card className="flex-shrink-0"><div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between"><div><label htmlFor="model-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Model/Endpoint</label><select id="model-select" value={selectedModelId} onChange={e => setSelectedModelId(e.target.value)} disabled={availableModels.length === 0} className="w-full sm:w-80 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500">
                {availableModels.map(l => {
                    const endpoint = endpoints.find(e => e.id === l.modelId);
                    return (
                        <option key={l.modelId} value={l.modelId}>
                            {endpoint ? endpoint.name : l.modelName}
                        </option>
                    );
                })}
                {availableModels.length === 0 && <option>No active models with lineage</option>}
            </select></div><OverallStatus /></div></Card>

            <div className="flex-grow flex gap-6 min-h-0">
                <div className="flex-grow rounded-lg bg-gray-50 dark:bg-gray-800/50 p-6 overflow-auto border border-gray-200 dark:border-gray-700" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, ${'#d1d5db'} 1px, transparent 0)`, backgroundSize: '2rem 2rem' }}>
                    {lineageToDisplay ? (
                        <div ref={containerRef} className="relative w-full h-full">
                            <SVGConnections connections={connections} positions={positions} containerRect={containerRect} />
                            <div className="flex justify-between items-start h-full">
                                <div className="flex flex-col gap-4 items-center px-4"><h3 className="font-semibold text-gray-500 dark:text-gray-400 uppercase text-sm tracking-wider mb-2">Sources</h3>{[...lineageToDisplay.trainingData.flatMap(td => td.sources), lineageToDisplay.inferenceInputSource].map((source, i) => (<LineageNode key={source.id} node={{ id: source.id, name: source.name, type: `${source === lineageToDisplay.inferenceInputSource ? 'Inference Input' : 'Data Source'} (${source.type})`, details: { ...source.details }, trustStatus: source.trustStatus }} icon={getSourceTypeIcon(source.type)} isSelected={selectedNode?.id === source.id} onClick={setSelectedNode} forwardedRef={el => nodeRefs.current[source.id] = el} animationDelay={`${i * 50}ms`} />))}</div>
                                <div className="flex flex-col gap-4 items-center px-4 pt-10"><h3 className="font-semibold text-gray-500 dark:text-gray-400 uppercase text-sm tracking-wider mb-2">Processing</h3>{lineageToDisplay.trainingData.map((td, i) => (<LineageNode key={td.datasetId} node={{ id: td.datasetId, name: td.datasetName, type: 'Training Dataset', details: { ...td } }} icon={<Code className="w-5 h-5" />} isSelected={selectedNode?.id === td.datasetId} onClick={setSelectedNode} forwardedRef={el => nodeRefs.current[td.datasetId] = el} animationDelay={`${(i + 5) * 50}ms`} />))}</div>
                                <div className="flex flex-col justify-center items-center h-full px-4 pt-10"><h3 className="font-semibold text-gray-500 dark:text-gray-400 uppercase text-sm tracking-wider mb-2">Model</h3><LineageNode node={{ id: lineageToDisplay.modelId, name: lineageToDisplay.modelName, type: 'AI Model', details: { ...lineageToDisplay } }} icon={<BrainCircuit className="w-5 h-5" />} isSelected={selectedNode?.id === lineageToDisplay.modelId} onClick={setSelectedNode} forwardedRef={el => nodeRefs.current[lineageToDisplay.modelId] = el} animationDelay="600ms" /></div>
                            </div>
                        </div>
                    ) : (<div className="flex items-center justify-center h-full">
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                <GitBranch className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600"/>
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">No Active Model Selected</p>
                                <p>Select an active model from the dropdown above to view its data lineage.</p>
                                <p className="text-sm mt-2">If the list is empty, please activate an endpoint in the API Gateway page.</p>
                            </div>
                        </div>)}
                </div>
                <div className={`transition-all duration-500 ease-in-out ${selectedNode ? 'w-full md:w-96' : 'w-0'} overflow-hidden flex-shrink-0`}><DetailsPanel node={selectedNode} onClose={() => setSelectedNode(null)} /></div>
            </div>
        </div>
    );
};

export default DataLineage;
