import React from 'react';
import { X, AlertTriangle, Calendar, Play, CheckCircle2, ArrowRight, Quote } from 'lucide-react';
import { TimelineConflict } from '../types';

interface ConflictEvidenceModalProps {
  conflict: TimelineConflict;
  onClose: () => void;
  onResolve: () => void;
}

export const ConflictEvidenceModal: React.FC<ConflictEvidenceModalProps> = ({ conflict, onClose, onResolve }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-rose-50 border-b border-rose-100 p-5 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">Cross-Meeting Timeline Mismatch</h3>
                <span className="text-xs font-mono font-bold bg-rose-200 text-rose-800 px-2 py-0.5 rounded-full">
                  Delta: {conflict.deltaDays} Days
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {conflict.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-rose-100/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Comparison */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto font-sans">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Node 1 */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3 relative">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-900">{conflict.node1.title}</span>
                <span className="text-xs font-mono font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                  {conflict.node1.targetDate}
                </span>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{conflict.node1.meetingTitle}</span>
                </div>
                <div>Recorded: {conflict.node1.date}</div>
                <div>Speaker: <strong className="text-slate-800">{conflict.node1.speaker}</strong></div>
              </div>

              <div className="bg-white border border-slate-200 rounded p-3 text-xs text-slate-700 italic relative">
                <Quote className="w-4 h-4 text-slate-300 absolute -top-2 left-2 bg-white px-0.5" />
                <p className="pt-1">{conflict.node1.quote}</p>
                <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-indigo-600 font-semibold not-italic">
                  <span className="flex items-center gap-1">
                    <Play className="w-3 h-3" /> Timestamp [{conflict.node1.timecode}]
                  </span>
                  <span className="text-[10px] text-emerald-600 font-sans font-bold">96.1% Conf.</span>
                </div>
              </div>
            </div>

            {/* Node 2 */}
            <div className="bg-rose-50/50 border border-rose-200 rounded-lg p-4 space-y-3 relative">
              <div className="flex items-center justify-between border-b border-rose-200 pb-2">
                <span className="text-xs font-bold text-rose-950">{conflict.node2.title}</span>
                <span className="text-xs font-mono font-bold bg-rose-200 text-rose-900 px-2 py-0.5 rounded">
                  {conflict.node2.targetDate}
                </span>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{conflict.node2.meetingTitle}</span>
                </div>
                <div>Recorded: {conflict.node2.date}</div>
                <div>Speaker: <strong className="text-slate-800">{conflict.node2.speaker}</strong></div>
              </div>

              <div className="bg-white border border-rose-200 rounded p-3 text-xs text-slate-700 italic relative">
                <Quote className="w-4 h-4 text-rose-300 absolute -top-2 left-2 bg-white px-0.5" />
                <p className="pt-1">{conflict.node2.quote}</p>
                <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-rose-600 font-semibold not-italic">
                  <span className="flex items-center gap-1">
                    <Play className="w-3 h-3" /> Timestamp [{conflict.node2.timecode}]
                  </span>
                  <span className="text-[10px] text-amber-600 font-sans font-bold">Flagged Mismatch</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Synthesis Analysis */}
          <div className="bg-[#f2f3ff] border border-[#d2d9f4] rounded-lg p-4 text-xs space-y-2">
            <div className="font-bold text-indigo-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>Neo4j Graph Synthesis Insight</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Arjun Mehta committed to an early preview delivery on Oct 14 during the Client Review meeting. However, during the internal Q3 Product Roadmap Planning meeting 3 days later, the public beta target was extended to Oct 28 due to pending penetration test security reports from David Chen.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Dismiss
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onResolve}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <span>Align Timeline & Reassign Task</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
