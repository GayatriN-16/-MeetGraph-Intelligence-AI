import React, { useState } from 'react';
import { Search, Filter, Calendar, Clock, Share2, Play, Plus, Sparkles, FileAudio } from 'lucide-react';
import { Meeting } from '../types';

interface MeetingsLibraryProps {
  meetings: Meeting[];
  onSelectMeeting: (m: Meeting) => void;
  openUploadModal: () => void;
}

export const MeetingsLibrary: React.FC<MeetingsLibraryProps> = ({ meetings, onSelectMeeting, openUploadModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('All');

  const filtered = meetings.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = selectedProjectFilter === 'All' || m.project === selectedProjectFilter;
    return matchesSearch && matchesProject;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meetings Library</h1>
          <p className="text-xs text-slate-500 mt-1">
            48 total executive sessions indexed with speaker diarization and Neo4j graph nodes.
          </p>
        </div>

        <button
          onClick={openUploadModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs shadow-sm flex items-center gap-2 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Upload New Meeting</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter meetings by title, transcript quotes, or topics..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedProjectFilter}
            onChange={(e) => setSelectedProjectFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 outline-none focus:border-indigo-600"
          >
            <option value="All">All Projects</option>
            <option value="Product Launch v1">Product Launch v1</option>
            <option value="Core Engine">Core Engine</option>
            <option value="Client Review">Client Review</option>
          </select>
        </div>
      </div>

      {/* Meetings Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((mtg) => (
          <div
            key={mtg.id}
            className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-5 shadow-sm hover:shadow transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded">
                  {mtg.project}
                </span>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Indexed
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 line-clamp-1">{mtg.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {mtg.summary}
                </p>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {mtg.date.split(',')[0]}
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {mtg.duration}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center -space-x-1">
                {mtg.speakers.map((sp) => (
                  <span
                    key={sp.id}
                    title={sp.name}
                    className={`w-6 h-6 rounded-full ${sp.colorBg} font-bold text-[9px] flex items-center justify-center ring-2 ring-white`}
                  >
                    {sp.avatarInitials}
                  </span>
                ))}
              </div>

              <button
                onClick={() => onSelectMeeting(mtg)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>View Intelligence</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
