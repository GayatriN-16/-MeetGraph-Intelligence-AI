import React, { useState } from 'react';
import {
  Cpu,
  UploadCloud,
  Mic,
  FileText,
  BrainCircuit,
  Database,
  Share2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Layers,
  Activity,
  Lock,
  Terminal
} from 'lucide-react';

export const ArchitecturePipeline: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(2);

  const stages = [
    {
      id: 1,
      title: '1. Data Ingestion',
      subtitle: 'Audio & Live Streams',
      icon: UploadCloud,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      badgeColor: 'bg-indigo-600 text-white',
      items: [
        'Meeting Recordings (MP3 / M4A / WAV)',
        'Live Meeting Integration (Google Meet / Teams / Zoom)',
        'Manual Stream Upload & Browser Mic Capture'
      ],
      details: 'Supports high bitrate multi-channel audio stream ingestion up to 500 MB per meeting session.'
    },
    {
      id: 2,
      title: '2. Processing & AI Pipeline',
      subtitle: 'Whisper + LLM Extraction',
      icon: BrainCircuit,
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      badgeColor: 'bg-purple-600 text-white',
      items: [
        '2.1 Whisper/Faster-Whisper & Deepgram Speaker Diarization',
        '2.2 Speaker-labelled Transcript Output with Timecodes',
        '2.3 LLM Knowledge Extraction (Decisions, Action Items, Deadlines, Risks)',
        '2.4 ChromaDB Vector Embeddings Generation'
      ],
      details: 'Converts unstructured conversational audio into structured, timecode-anchored semantic payloads.'
    },
    {
      id: 3,
      title: '3. Knowledge Storage',
      subtitle: 'Neo4j + PostgreSQL + Vector',
      icon: Database,
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      badgeColor: 'bg-emerald-600 text-white',
      items: [
        'Neo4j Graph Database (People, Meetings, Projects, Decisions, Relationships)',
        'PostgreSQL Relational DB (Users, Audit Logs, Settings)',
        'Vector Store (ChromaDB / Hybrid Index)'
      ],
      details: 'Dual-tier storage engine combining relational security with graph multi-hop citation traversals.'
    },
    {
      id: 4,
      title: '4. Applications & Interfaces',
      subtitle: 'GraphRAG & UI Console',
      icon: Sparkles,
      color: 'bg-amber-50 border-amber-200 text-amber-700',
      badgeColor: 'bg-amber-600 text-white',
      items: [
        'Web Executive Intelligence Dashboard',
        'Interactive Knowledge Graph Explorer (React Flow)',
        'GraphRAG Natural Language Search & Timeline Conflict Detection'
      ],
      details: 'Provides executive-grade visibility, decision traceability, and automated timeline conflict warnings.'
    },
    {
      id: 5,
      title: '5. External Integrations',
      subtitle: 'Calendar & Task Sync',
      icon: Layers,
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      badgeColor: 'bg-blue-600 text-white',
      items: [
        'Google Meet, Microsoft Teams & Zoom Webhooks',
        'Google Calendar Event Sync',
        'Jira Software Task Dispatch & Slack Notifications'
      ],
      details: 'Automates task creation directly in Jira and sends real-time decision summaries to Slack channels.'
    },
    {
      id: 6,
      title: '6. Security & Infrastructure',
      subtitle: 'JWT, RBAC & SOC2',
      icon: ShieldCheck,
      color: 'bg-slate-50 border-slate-200 text-slate-800',
      badgeColor: 'bg-slate-800 text-white',
      items: [
        'JWT-based Authentication & Role-Based Access Control (RBAC)',
        'SOC2 Type II Audio Buffer Encryption at Rest & in Transit',
        'Rate Limiting, Audit Logging & Docker Cloud Containerization'
      ],
      details: 'Ensures enterprise zero-trust security with instant audio wipe upon transcription completion.'
    }
  ];

  const selectedStageObj = stages.find(s => s.id === activeStage) || stages[1];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans text-slate-900">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
            <span className="bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded">SLIDE 6 SPECIFICATION</span>
            <span>â— End-to-End System Architecture</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Core Technical Pipeline: Upload â†’ Transcribe â†’ Extract â†’ Graph â†’ Search
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-600" />
            FastAPI + Neo4j Pipeline Online
          </span>
        </div>
      </div>

      {/* Interactive 6-Stage Stepper Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {stages.map((stg) => {
          const Icon = stg.icon;
          const isActive = stg.id === activeStage;
          return (
            <button
              key={stg.id}
              onClick={() => setActiveStage(stg.id)}
              className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-700 ring-4 ring-indigo-100 shadow-md transform -translate-y-0.5'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isActive ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    #{stg.id}
                  </span>
                </div>
                <div className="text-xs font-bold line-clamp-1">{stg.title.split('. ')[1]}</div>
                <div className={`text-[10px] mt-0.5 ${isActive ? 'text-indigo-100' : 'text-slate-500'}`}>
                  {stg.subtitle}
                </div>
              </div>

              {isActive && (
                <div className="w-full h-1 bg-white rounded-full mt-3"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Deep Stage Inspector */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${selectedStageObj.badgeColor}`}>
              <selectedStageObj.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{selectedStageObj.title}</h3>
              <p className="text-xs text-slate-500">{selectedStageObj.details}</p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-lg">
            Stage {selectedStageObj.id} of 6
          </span>
        </div>

        {/* Stage Component Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Active System Sub-Modules & Tech Specs
            </h4>
            <div className="space-y-2">
              {selectedStageObj.items.map((item, idx) => (
                <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 flex items-start gap-2.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1.5"></span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Pipeline Execution Simulation */}
          <div className="bg-slate-900 text-slate-100 rounded-xl p-4 space-y-3 font-mono text-xs overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Terminal className="w-4 h-4" /> Pipeline Console Execution Stream
              </span>
              <span className="text-[10px] text-slate-500">FastAPI Log Trace</span>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-300 leading-relaxed overflow-x-auto">
              <div className="text-slate-500">[2026-10-26T10:25:01Z] INGEST: Audio payload received (86 MB).</div>
              <div className="text-indigo-400">[2026-10-26T10:25:03Z] WHISPER: Diarized 3 voices (Priya S, Arjun M, Alex V).</div>
              <div className="text-purple-400">[2026-10-26T10:25:06Z] LLM EXTRACT: Extracted 2 decision nodes (98.4% conf).</div>
              <div className="text-emerald-400">[2026-10-26T10:25:08Z] NEO4J GRAPH: Pushed 28 new Cypher entity edges.</div>
              <div className="text-amber-400">[2026-10-26T10:25:09Z] CHROMADB: Generated 1536-dim vector embeddings.</div>
              <div className="text-teal-400 font-bold">[2026-10-26T10:25:10Z] STATUS 200 OK: GraphRAG search ready.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
