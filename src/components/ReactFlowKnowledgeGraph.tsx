import React, { useState, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Search, Database, Play, CheckCircle2, AlertTriangle, Layers, User, Calendar, ExternalLink, RefreshCw } from 'lucide-react';
import { ReactFlowNode, ReactFlowEdge } from '../types';

interface ReactFlowKnowledgeGraphProps {
  onSelectMeetingTitle?: (title: string) => void;
}

const initialReactFlowNodes: Node[] = [
  {
    id: 'n-mtg-1',
    type: 'default',
    data: {
      label: 'Q3 Product Roadmap Planning',
      entityType: 'Meeting',
      project: 'Product Launch v1',
      date: 'Oct 24, 2026',
      summary: 'Postponed public beta launch to Oct 28 pending security audit approvals.'
    },
    position: { x: 250, y: 150 },
    style: { background: '#eef2ff', borderColor: '#6366f1', borderWidth: 2, borderRadius: 12, padding: 10, fontSize: 12, fontWeight: 'bold', width: 220, color: '#1e1b4b' }
  },
  {
    id: 'n-mtg-2',
    type: 'default',
    data: {
      label: 'Engineering Sprint Review',
      entityType: 'Meeting',
      project: 'Core Engine',
      date: 'Oct 22, 2026',
      summary: 'Adopted vector-hybrid indexing for graph relationship extraction.'
    },
    position: { x: 600, y: 150 },
    style: { background: '#eef2ff', borderColor: '#6366f1', borderWidth: 2, borderRadius: 12, padding: 10, fontSize: 12, fontWeight: 'bold', width: 220, color: '#1e1b4b' }
  },
  {
    id: 'n-person-1',
    type: 'default',
    data: {
      label: 'Priya Sharma (Tech Lead)',
      entityType: 'Person',
      role: 'Tech Lead',
      quotes: ['The vector-hybrid pipeline tests on Neo4j showed a 4x reduction in multi-hop query latency.']
    },
    position: { x: 420, y: 20 },
    style: { background: '#f0fdf4', borderColor: '#10b981', borderWidth: 2, borderRadius: 9999, padding: '8px 16px', fontSize: 12, fontWeight: 'bold', color: '#064e3b' }
  },
  {
    id: 'n-person-2',
    type: 'default',
    data: {
      label: 'Arjun Mehta (Product Lead)',
      entityType: 'Person',
      role: 'Product Lead',
      quotes: ['Let us officially postpone public beta signup to Oct 28 pending final security audit approvals.']
    },
    position: { x: 100, y: 20 },
    style: { background: '#f0fdf4', borderColor: '#10b981', borderWidth: 2, borderRadius: 9999, padding: '8px 16px', fontSize: 12, fontWeight: 'bold', color: '#064e3b' }
  },
  {
    id: 'n-dec-1',
    type: 'default',
    data: {
      label: 'Decision: Vector-Hybrid Indexing',
      entityType: 'Decision',
      confidence: 98.4,
      source: 'Engineering Sprint Review @ 24:18'
    },
    position: { x: 650, y: 320 },
    style: { background: '#ecfdf5', borderColor: '#059669', borderWidth: 2, borderRadius: 10, padding: 10, fontSize: 11, fontWeight: '600', width: 200 }
  },
  {
    id: 'n-dec-2',
    type: 'default',
    data: {
      label: 'Decision: Beta Launch Moved to Oct 28',
      entityType: 'Decision',
      confidence: 96.1,
      source: 'Q3 Roadmap Planning @ 41:05'
    },
    position: { x: 200, y: 320 },
    style: { background: '#ecfdf5', borderColor: '#059669', borderWidth: 2, borderRadius: 10, padding: 10, fontSize: 11, fontWeight: '600', width: 200 }
  },
  {
    id: 'n-risk-1',
    type: 'default',
    data: {
      label: 'Risk: 14-Day Launch Date Mismatch',
      entityType: 'Risk',
      status: 'Possible conflict â€” review required',
      delta: '14 Days'
    },
    position: { x: 420, y: 440 },
    style: { background: '#fff1f2', borderColor: '#e11d48', borderWidth: 2, borderRadius: 10, padding: 10, fontSize: 11, fontWeight: 'bold', color: '#881337', width: 240 }
  }
];

const initialReactFlowEdges: Edge[] = [
  { id: 'e-1', source: 'n-person-1', target: 'n-mtg-2', label: 'Attended', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e-2', source: 'n-person-1', target: 'n-mtg-1', label: 'Attended', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e-3', source: 'n-person-2', target: 'n-mtg-1', label: 'Led Meeting', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e-4', source: 'n-mtg-2', target: 'n-dec-1', label: 'Produced Decision', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e-5', source: 'n-mtg-1', target: 'n-dec-2', label: 'Produced Decision', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e-6', source: 'n-dec-2', target: 'n-risk-1', label: 'Conflict Dependency', animated: true, style: { stroke: '#e11d48', strokeWidth: 2 } }
];

export const ReactFlowKnowledgeGraph: React.FC<ReactFlowKnowledgeGraphProps> = ({ onSelectMeetingTitle }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialReactFlowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialReactFlowEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(initialReactFlowNodes[0]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const filteredNodes = useMemo(() => {
    return nodes.filter(n => {
      const entityType = String(n.data.entityType || 'Topic').toLowerCase();
      const matchesType = filterType === 'all' || entityType === filterType.toLowerCase();
      const label = String(n.data.label || '').toLowerCase();
      const matchesSearch = label.includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [nodes, filterType, searchQuery]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans text-slate-900">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
            <span className="bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded">PRD REQUIREMENT 10</span>
            <span>â— Neo4j Knowledge Graph Visualizer</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Interactive React Flow Graph Engine</h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" />
            Neo4j Cluster Connected (384 Entities)
          </span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entities (e.g. Priya, Roadmap, Vector, Conflict)..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['all', 'Meeting', 'Person', 'Decision', 'Risk'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-colors ${
                filterType === t
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t === 'all' ? 'All Types' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Graph Grid (8 cols React Flow + 4 cols Contextual Inspector) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* React Flow Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm h-[520px] relative overflow-hidden">
          <ReactFlow
            nodes={filteredNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
          >
            <Controls />
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
          </ReactFlow>
        </div>

        {/* Contextual Details Panel (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contextual Node Inspector</span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                {selectedNode ? String(selectedNode.data.label) : 'Select a node'}
              </h3>
              {selectedNode && (
                <span className="inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                  Type: {String(selectedNode.data.entityType || 'Entity')}
                </span>
              )}
            </div>

            {selectedNode && (
              <div className="space-y-3 pt-3 text-xs text-slate-700">
                {Boolean(selectedNode.data.summary) && (
                  <div>
                    <strong className="block text-slate-900 mb-1">Summary:</strong>
                    <p className="bg-slate-50 border border-slate-200 rounded p-2 text-slate-600 leading-relaxed">
                      {String(selectedNode.data.summary)}
                    </p>
                  </div>
                )}

                {Boolean(selectedNode.data.confidence) && (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded p-2">
                    <span>Verification Confidence:</span>
                    <strong className="text-emerald-700 font-mono">{String(selectedNode.data.confidence)}%</strong>
                  </div>
                )}

                {Boolean(selectedNode.data.delta) && (
                  <div className="bg-rose-50 border border-rose-200 rounded p-2 space-y-1">
                    <span className="font-bold text-rose-900 block">Conflict Warning:</span>
                    <p className="text-[11px] text-rose-700">14-day delivery timeline mismatch detected between Q3 Roadmap and Client Review.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedNode?.data?.entityType === 'Meeting' && onSelectMeetingTitle && (
            <button
              onClick={() => onSelectMeetingTitle(String(selectedNode.data.label))}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Open Originating Meeting Details</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
