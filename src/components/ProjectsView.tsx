import React from 'react';
import { FolderKanban, Share2, CheckCircle2, Clock, AlertTriangle, ChevronRight, Layers } from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const projectsList = [
    {
      id: 'p-1',
      name: 'Acme Engineering - Capstone v2.4',
      status: 'Active Release Gate',
      meetingsCount: 18,
      decisionsCount: 52,
      actionCount: 8,
      entitiesCount: 142,
      health: 'High Risk (1 Timeline Conflict)',
      healthColor: 'bg-rose-100 text-rose-800 border-rose-200'
    },
    {
      id: 'p-2',
      name: 'Product Launch v1',
      status: 'In Progress',
      meetingsCount: 14,
      decisionsCount: 42,
      actionCount: 5,
      entitiesCount: 98,
      health: 'On Track',
      healthColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    {
      id: 'p-3',
      name: 'Core Engine',
      status: 'Optimization',
      meetingsCount: 10,
      decisionsCount: 32,
      actionCount: 4,
      entitiesCount: 86,
      health: 'On Track',
      healthColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    {
      id: 'p-4',
      name: 'Client Review Board',
      status: 'External Alignment',
      meetingsCount: 6,
      decisionsCount: 16,
      actionCount: 2,
      entitiesCount: 58,
      health: 'Pending Milestone Sync',
      healthColor: 'bg-amber-100 text-amber-800 border-amber-200'
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans text-slate-900">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Interconnected Projects</h1>
        <p className="text-xs text-slate-500 mt-1">
          12 projects mapped into Neo4j knowledge graphs with multi-meeting tracking.
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projectsList.map((p) => (
          <div
            key={p.id}
            className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-indigo-300 transition-all space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{p.name}</h3>
                  <span className="text-[11px] text-slate-500">{p.status}</span>
                </div>
              </div>

              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${p.healthColor}`}>
                {p.health}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2 text-center">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div className="text-base font-bold text-slate-900">{p.meetingsCount}</div>
                <div className="text-[10px] text-slate-400 font-medium uppercase">Meetings</div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div className="text-base font-bold text-slate-900">{p.decisionsCount}</div>
                <div className="text-[10px] text-slate-400 font-medium uppercase">Decisions</div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div className="text-base font-bold text-slate-900">{p.actionCount}</div>
                <div className="text-[10px] text-slate-400 font-medium uppercase">Actions</div>
              </div>

              <div className="bg-indigo-50 p-2.5 rounded-lg border border-indigo-100">
                <div className="text-base font-bold text-indigo-700">{p.entitiesCount}</div>
                <div className="text-[10px] text-indigo-500 font-medium uppercase font-mono">Entities</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
