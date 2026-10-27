import React from 'react';
import { Sparkles, CheckCircle2, Clock, Play, FileText, Check, ShieldAlert } from 'lucide-react';
import { Meeting } from '../types';

interface VisualMeetingBriefProps {
  meeting: Meeting;
  onSeekTimecode?: (timecode: string) => void;
}

export const VisualMeetingBrief: React.FC<VisualMeetingBriefProps> = ({ meeting, onSeekTimecode }) => {
  return (
    <div className="bg-[#faf8ff] border border-[#eaedff] rounded-xl p-5 space-y-4 shadow-sm font-sans">
      <div className="flex items-center justify-between border-b border-[#d2d9f4] pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Visual Meeting Brief (AI Synthesized)</h3>
        </div>
        <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
          Source Grounded
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Main Discussion Topic Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Main Topic</span>
          <h4 className="text-xs font-bold text-slate-900">{meeting.title}</h4>
          <p className="text-[11px] text-slate-500 line-clamp-2 leading-snug">{meeting.summary}</p>
        </div>

        {/* Key Decisions Captured Card */}
        <div className="bg-white border border-emerald-200 rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Key Decisions
            </span>
            <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">Verified</span>
          </div>
          <div className="space-y-1">
            {meeting.keyTakeaways.slice(0, 2).map((takeaway, idx) => (
              <div key={idx} className="text-[11px] text-slate-800 font-medium flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1"></span>
                <span>{takeaway}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Items Linked to Transcript Evidence */}
        <div className="bg-white border border-indigo-200 rounded-lg p-3.5 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1">
            <Clock className="w-3 h-3 text-indigo-600" /> Action Items & Evidence
          </span>
          <div className="space-y-1.5 text-[11px]">
            {meeting.transcript.filter(t => t.isKeyDecision).slice(0, 2).map((t) => (
              <div key={t.id} className="flex items-center justify-between bg-indigo-50/60 p-1.5 rounded border border-indigo-100">
                <span className="text-slate-800 truncate max-w-[140px]">{t.speakerName}: {t.text}</span>
                <button
                  onClick={() => onSeekTimecode && onSeekTimecode(t.timecode)}
                  className="font-mono text-[10px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-0.5 shrink-0"
                >
                  <Play className="w-2.5 h-2.5 fill-current" /> [{t.timecode}]
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
