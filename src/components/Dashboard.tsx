import React from 'react';
import {
  Sparkles,
  Plus,
  Share2,
  CheckCircle2,
  Clock,
  Layers,
  ArrowUpRight,
  AlertTriangle,
  ExternalLink,
  Play,
  Check,
  FileAudio,
  ChevronRight,
  Database
} from 'lucide-react';
import { Meeting, Decision, ActionItem, TimelineConflict, ExtractionPipelineStep, NavigationTab } from '../types';

interface DashboardProps {
  meetings: Meeting[];
  decisions: Decision[];
  actionItems: ActionItem[];
  timelineConflict: TimelineConflict;
  extractionPipeline: ExtractionPipelineStep[];
  onSelectMeeting: (m: Meeting) => void;
  onOpenConflictModal: () => void;
  onToggleActionItem: (id: string) => void;
  onSelectTab: (tab: NavigationTab) => void;
  openUploadModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  meetings,
  decisions,
  actionItems,
  timelineConflict,
  extractionPipeline,
  onSelectMeeting,
  onOpenConflictModal,
  onToggleActionItem,
  onSelectTab,
  openUploadModal
}) => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans text-slate-900">

      {/* Top Banner Tagline & Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wider uppercase text-indigo-700">
          <span className="bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded">DEMO ENVIRONMENT</span>
          <span className="text-slate-300">â€¢</span>
          <span className="text-slate-600">FINAL YEAR PROJECT 2026-27</span>
          <span className="text-slate-300">â€¢</span>
          <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-0.5 rounded">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Graph Engine Online
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              Your meetings. One connected memory.
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              AI-grounded organizational memory across uploaded meetings.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('ask-ai')}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold rounded-lg text-xs shadow-sm flex items-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Ask Intelligence</span>
            </button>
            <button
              onClick={openUploadModal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs shadow-sm flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Upload Meeting</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL MEETINGS */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">TOTAL MEETINGS</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">48</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />+12%
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Uploaded & mapped this month</p>
        </div>

        {/* DECISIONS CAPTURED */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">DECISIONS CAPTURED</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">142</span>
            <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Multi-stakeholder consensus</p>
        </div>

        {/* OPEN ACTION ITEMS */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">OPEN ACTION ITEMS</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">19</span>
            <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              Pending
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">4 high-priority blockers</p>
        </div>

        {/* KNOWLEDGE ENTITIES */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">KNOWLEDGE ENTITIES</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">384</span>
            <span className="text-xs font-semibold font-mono text-indigo-600">
              Neo4j Graph
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Across 12 interconnected projects</p>
        </div>
      </div>

      {/* Main Grid: Left Central Console (7 cols) & Right Intelligence Drawer (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Central Column */}
        <div className="lg:col-span-7 space-y-6">

          {/* Recent Meetings Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Meetings</h3>
              </div>
              <button
                onClick={() => onSelectTab('meetings')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>View all 48 meetings</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3 pl-4">MEETING & PROJECT</th>
                    <th className="p-3">DATE & TIME</th>
                    <th className="p-3">DURATION</th>
                    <th className="p-3">SPEAKERS</th>
                    <th className="p-3">GRAPH STATUS</th>
                    <th className="p-3 pr-4 text-right">INTEL ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {meetings.slice(0, 3).map((mtg) => (
                    <tr key={mtg.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 pl-4">
                        <div className="font-bold text-slate-900">{mtg.title}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          {mtg.project}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{mtg.date.split(',')[0]}</div>
                        <div className="text-[11px] text-slate-400">{mtg.time}</div>
                      </td>
                      <td className="p-3 font-mono">{mtg.duration}</td>
                      <td className="p-3">
                        <div className="flex items-center -space-x-1.5">
                          {mtg.speakers.map((sp) => (
                            <span
                              key={sp.id}
                              title={`${sp.name} (${sp.role})`}
                              className={`w-6 h-6 rounded-full ${sp.colorBg} font-bold text-[10px] flex items-center justify-center ring-2 ring-white`}
                            >
                              {sp.avatarInitials}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {mtg.graphStatus}
                        </span>
                      </td>
                      <td className="p-3 pr-4 text-right">
                        <button
                          onClick={() => onSelectMeeting(mtg)}
                          className="px-2.5 py-1 bg-[#eaedff] hover:bg-[#d2d9f4] text-[#3525cd] font-semibold rounded text-[11px] transition-colors"
                        >
                          View Intelligence
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Decisions That Matter Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Decisions That Matter</h3>
              </div>
              <span className="text-[11px] font-mono font-medium text-slate-400">
                Confidence Verified â‰¥ 95%
              </span>
            </div>

            <div className="space-y-3">
              {decisions.slice(0, 2).map((dec) => (
                <div key={dec.id} className="p-3.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5"></span>
                      <p className="text-xs font-bold text-slate-900 leading-snug">
                        {dec.title}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
                      {dec.confidence}% conf.
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full ${dec.speaker.colorBg} font-bold text-[9px] flex items-center justify-center`}>
                        {dec.speaker.avatarInitials}
                      </span>
                      <span>{dec.speaker.name} ({dec.speaker.role})</span>
                      <span>â€¢</span>
                      <span>Source: <strong className="text-slate-700">{dec.sourceMeetingTitle}</strong></span>
                    </div>

                    <button
                      onClick={() => {
                        const sourceM = meetings.find(m => m.id === dec.sourceMeetingId) || meetings[0];
                        onSelectMeeting(sourceM);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-mono font-semibold flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-indigo-600" />
                      [{dec.timecode}]
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items Assigned Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Action Items Assigned</h3>
              </div>
              <span className="text-[11px] font-medium text-slate-500">
                19 total â€¢ 3 urgent
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-2.5 w-8"></th>
                    <th className="p-2.5">TASK DESCRIPTION</th>
                    <th className="p-2.5">ASSIGNEE</th>
                    <th className="p-2.5">DUE DATE</th>
                    <th className="p-2.5 text-right">PRIORITY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {actionItems.slice(0, 3).map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5">
                        <input
                          type="checkbox"
                          checked={act.completed}
                          onChange={() => onToggleActionItem(act.id)}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className={`p-2.5 font-medium ${act.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {act.taskDescription}
                      </td>
                      <td className="p-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-5 h-5 rounded-full ${act.assignee.colorBg} font-bold text-[9px] flex items-center justify-center`}>
                            {act.assignee.avatarInitials}
                          </span>
                          <span className="text-slate-700 font-medium">{act.assignee.name}</span>
                        </div>
                      </td>
                      <td className="p-2.5 font-mono text-slate-600">{act.dueDate}</td>
                      <td className="p-2.5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          act.priority === 'High' ? 'bg-rose-100 text-rose-800' :
                          act.priority === 'Medium' ? 'bg-amber-100 text-amber-800' :
                          'bg-indigo-100 text-indigo-800'
                        }`}>
                          {act.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Intelligence Panel Column */}
        <div className="lg:col-span-5 space-y-6">

          {/* Schedule Mismatch / Timeline Conflict Card */}
          <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-5 space-y-3 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-800 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-rose-200">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                Cross-Meeting Timeline Conflict
              </span>
              <span className="text-xs font-mono font-bold text-rose-900 bg-rose-200 px-2 py-0.5 rounded">
                Delta: {timelineConflict.deltaDays} Days
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-900">
              {timelineConflict.title}
            </h3>

            <p className="text-xs text-slate-700 leading-relaxed">
              In <em className="font-semibold text-slate-900">Q3 Planning</em> (Oct 24), launch date was shifted to <strong className="text-indigo-700">Oct 28</strong>. However, <em className="font-semibold text-slate-900">Client Review</em> (Oct 21) logged commit for <strong className="text-rose-700">Oct 14</strong>. Cross-meeting dependency is unaligned.
            </p>

            {/* Micro Nodes Box */}
            <div className="bg-white border border-rose-200 rounded-lg p-3 space-y-1.5 text-xs">
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">Node 1: Q3 Roadmap Planning</span>
                <span className="font-bold text-indigo-700">Target: Oct 28</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">Node 2: Client Review</span>
                <span className="font-bold text-rose-700">Target: Oct 14</span>
              </div>
            </div>

            <button
              onClick={onOpenConflictModal}
              className="w-full py-2 bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <span>Review Conflict Evidence</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Knowledge Graph Snapshot (Live) Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Knowledge Graph Snapshot</h3>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Cross-meeting entity relationships dynamically synthesized in Neo4j.
            </p>

            {/* Interactive SVG Node Diagram */}
            <div className="h-44 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl relative overflow-hidden flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full">
                {/* SVG Connecting Lines */}
                <line x1="80" y1="120" x2="160" y2="60" stroke="#818cf8" strokeWidth="2" strokeDasharray="4 2" />
                <line x1="160" y1="60" x2="260" y2="80" stroke="#0d9488" strokeWidth="2" />
                <line x1="160" y1="60" x2="220" y2="140" stroke="#6366f1" strokeWidth="2" />
              </svg>

              {/* Node 1: Roadmap */}
              <div className="absolute left-10 bottom-8 bg-white border border-slate-200 shadow-sm rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                Roadmap
              </div>

              {/* Node 2: Priya S. */}
              <div className="absolute left-32 top-8 bg-white border border-indigo-300 shadow-sm rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">PS</span>
                Priya S.
              </div>

              {/* Node 3: Arjun M. */}
              <div className="absolute right-10 top-12 bg-white border border-emerald-300 shadow-sm rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center">AM</span>
                Arjun M.
              </div>

              {/* Node 4: Sep 28 Launch */}
              <div className="absolute right-20 bottom-6 bg-white border border-slate-200 shadow-sm rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                Sep 28 Launch
              </div>
            </div>

            <button
              onClick={() => onSelectTab('knowledge-graph')}
              className="w-full py-2 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-slate-800 font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Open Full Graph Explorer</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          {/* Extraction Pipeline Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Extraction Pipeline</h3>
              <span className="text-[11px] font-mono text-slate-400">Real-time</span>
            </div>

            <div className="space-y-3 pt-1">
              {extractionPipeline.map((pipe) => (
                <div key={pipe.id} className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 ${
                    pipe.status === 'completed' ? 'bg-teal-600' : 'bg-indigo-600 animate-pulse'
                  }`}>
                    {pipe.status === 'completed' ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : (
                      <FileAudio className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{pipe.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">{pipe.timeAgo}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{pipe.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
