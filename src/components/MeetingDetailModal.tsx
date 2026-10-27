import React, { useState } from 'react';
import { X, Play, Pause, Volume2, Clock, Calendar, CheckCircle2, Search, Share2, Sparkles, FileAudio } from 'lucide-react';
import { Meeting } from '../types';

interface MeetingDetailModalProps {
  meeting: Meeting;
  onClose: () => void;
  onAskAIAboutMeeting: (meetingTitle: string) => void;
}

export const MeetingDetailModal: React.FC<MeetingDetailModalProps> = ({ meeting, onClose, onAskAIAboutMeeting }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeTab, setActiveTab] = useState<'transcript' | 'decisions' | 'takeaways'>('transcript');
  const [filterQuery, setFilterQuery] = useState('');

  const filteredTranscript = meeting.transcript.filter(t =>
    t.text.toLowerCase().includes(filterQuery.toLowerCase()) ||
    t.speakerName.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-[#f8fafc] flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                {meeting.project}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {meeting.graphStatus}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{meeting.title}</h2>
            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {meeting.date} at {meeting.time}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {meeting.duration}
              </span>
              <span className="flex items-center gap-1 text-slate-700">
                <FileAudio className="w-3.5 h-3.5 text-indigo-600" />
                {meeting.audioFileName || 'audio_stream.m4a'} ({meeting.audioSizeMb || 64} MB)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAskAIAboutMeeting(meeting.title)}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Ask AI About Meeting
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Audio Player Bar */}
        <div className="bg-slate-900 text-white p-3 px-6 flex items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-transform active:scale-95 shadow"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>
            <div>
              <div className="text-xs font-semibold text-slate-200">Audio Stream Simulation</div>
              <div className="text-[10px] font-mono text-indigo-300">
                {isPlaying ? 'Playing â€¢ Dual-channel Whisper' : 'Paused â€¢ Seek to quote'}
              </div>
            </div>
          </div>

          {/* Audio Waveform Track */}
          <div className="flex-1 max-w-md flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400">04:12</span>
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden relative cursor-pointer">
              <div className="h-full bg-indigo-500 w-1/3 rounded-full"></div>
            </div>
            <span className="text-[10px] font-mono text-slate-400">{meeting.duration}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <Volume2 className="w-4 h-4" />
            <span className="text-xs font-mono text-slate-300">100%</span>
          </div>
        </div>

        {/* Navigation Tabs inside modal */}
        <div className="border-b border-slate-200 bg-slate-50 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 py-2">
            <button
              onClick={() => setActiveTab('transcript')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'transcript'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Transcript ({meeting.transcript.length})
            </button>
            <button
              onClick={() => setActiveTab('takeaways')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'takeaways'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Key Takeaways ({meeting.keyTakeaways.length})
            </button>
          </div>

          {activeTab === 'transcript' && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Search dialogue..."
                className="pl-8 pr-3 py-1 text-xs bg-white border border-slate-200 rounded-md outline-none focus:border-indigo-600 w-48"
              />
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'transcript' && (
            <div className="space-y-4">
              {filteredTranscript.map((t) => (
                <div
                  key={t.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    t.isKeyDecision
                      ? 'bg-indigo-50/70 border-indigo-200 ring-1 ring-indigo-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                        {t.speakerName.split(' ').map(n => n[0]).join('')}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{t.speakerName}</span>
                      {t.isKeyDecision && (
                        <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Captured Decision
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="text-xs font-mono font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 flex items-center gap-1"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" /> [{t.timecode}]
                    </button>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed">{t.text}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'takeaways' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Synthesized Executive Takeaways</h4>
              <div className="space-y-2">
                {meeting.keyTakeaways.map((takeaway, idx) => (
                  <div key={idx} className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs font-medium text-slate-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{takeaway}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {meeting.speakers.map((sp) => (
              <span key={sp.id} className="text-[11px] font-medium text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded">
                {sp.name} ({sp.role})
              </span>
            ))}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
