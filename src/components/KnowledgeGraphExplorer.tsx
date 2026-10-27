import React, { useState } from 'react';
import { Share2, Filter, Search, Sparkles, Database, Play, CheckCircle2, User, Flag, Layers } from 'lucide-react';
import { GraphNode } from '../types';
import { KNOWLEDGE_GRAPH_NODES, INITIAL_MEETINGS } from '../data/mockData';

interface KnowledgeGraphExplorerProps {
  onSelectMeetingTitle: (title: string) => void;
}

export const KnowledgeGraphExplorer: React.FC<KnowledgeGraphExplorerProps> = ({ onSelectMeetingTitle }) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode>(KNOWLEDGE_GRAPH_NODES[0]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const nodeTypes = [
    { id: 'all', label: 'All Entities' },
    { id: 'meeting', label: 'Meetings' },
    { id: 'speaker', label: 'Speakers' },
    { id: 'milestone', label: 'Milestones' },
    { id: 'topic', label: 'Topics & Tech' }
  ];

  const filteredNodes = KNOWLEDGE_GRAPH_NODES.filter(n => {
    const matchesType = filterType === 'all' || n.type === filterType;
    const matchesSearch = n.label.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans text-slate-900">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Neo4j Knowledge Graph Explorer</h1>
          <p className="text-xs text-slate-500 mt-1">
            Synthesized multi-hop entity relationship graph across 48 executive meetings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" />
            384 Connected Nodes
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
            placeholder="Search graph entities (e.g., Vector Indexing, Priya, Sep 28 Launch)..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {nodeTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilterType(t.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-colors ${
                filterType === t.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas & Inspector 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Graph Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-[500px] relative overflow-hidden flex flex-col justify-between">

          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>â— Neo4j Cluster Engine Online</span>
            <span>Interactive Spatial Layout</span>
          </div>

          {/* Interactive Nodes Canvas Simulation */}
          <div className="relative my-auto py-12 flex flex-wrap items-center justify-center gap-6">
            {filteredNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`px-4 py-2.5 rounded-full border text-xs font-bold transition-all transform hover:scale-105 shadow-sm flex items-center gap-2 ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-700 ring-4 ring-indigo-100 scale-105'
                      : node.type === 'meeting'
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-900 hover:border-indigo-400'
                      : node.type === 'speaker'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:border-emerald-400'
                      : node.type === 'milestone'
                      ? 'bg-amber-50 border-amber-200 text-amber-900 hover:border-amber-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-400'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    isSelected ? 'bg-white' : 'bg-indigo-500'
                  }`}></span>
                  <span>{node.label}</span>
                </button>
              );
            })}
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-center justify-between">
            <span className="font-medium">Selected Entity: <strong className="text-slate-900">{selectedNode.label}</strong></span>
            <span className="font-mono text-indigo-600 font-bold">{selectedNode.connectedIds.length} Direct Connections</span>
          </div>
        </div>

        {/* Node Inspector Drawer (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Entity Inspector</span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedNode.label}</h3>
            <span className="inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 capitalize">
              Type: {selectedNode.type}
            </span>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Connected Knowledge Graph Nodes</h4>
            <div className="space-y-2">
              {selectedNode.connectedIds.map((cid: string) => {
                const target = KNOWLEDGE_GRAPH_NODES.find(n => n.id === cid) || selectedNode;
                return (
                  <div
                    key={cid}
                    onClick={() => setSelectedNode(target)}
                    className="p-3 bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                      {target.label}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">{target.type}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Source Evidence Transcript</h4>
            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg text-xs text-slate-700 space-y-2">
              <p className="italic">
                "The vector-hybrid pipeline tests on Neo4j showed a 4x reduction in multi-hop query latency."
              </p>
              <div className="flex items-center justify-between text-[11px] font-mono text-indigo-700 font-bold">
                <span>Priya Sharma</span>
                <span>[18:45]</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
