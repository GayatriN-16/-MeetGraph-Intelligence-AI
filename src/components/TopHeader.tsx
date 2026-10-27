import React, { useState } from 'react';
import { Search, Bell, Building2, ChevronDown, Sparkles, Plus, Key, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface TopHeaderProps {
  currentUser: User;
  onOpenAuthModal: () => void;
  onSearch: (query: string) => void;
  openUploadModal: () => void;
  selectedProject: string;
  setSelectedProject: (proj: string) => void;
  unreadCount?: number;
  onSelectTab: (tab: any) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentUser,
  onOpenAuthModal,
  onSearch,
  openUploadModal,
  selectedProject,
  setSelectedProject,
  unreadCount = 1,
  onSelectTab
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  const projects = [
    'Acme Engineering - Capstone v2.4',
    'Product Launch v1',
    'Core Engine',
    'Client Review Board'
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <header className="h-16 bg-[#ffffff] border-b border-[#e2e8f0] px-6 flex items-center justify-between sticky top-0 z-10 font-sans">
      {/* Global Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search transcripts, speaker quotes, entities, action items..."
            className="w-full pl-10 pr-12 py-2 text-sm bg-[#f1f5f9] border border-transparent rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
            âŒ˜K
          </span>
        </div>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-3">
        {/* Project Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProjectDropdown(!showProjectDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-[#f1f5f9] hover:bg-[#e2e8f0] border border-slate-200 rounded-lg transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span className="truncate max-w-[180px]">{selectedProject}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProjectDropdown && (
            <div className="absolute right-0 mt-1 w-64 bg-white border border-[#cbd5e1] rounded-lg shadow-lg py-1 z-30">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Active Project Scope
              </div>
              {projects.map((proj) => (
                <button
                  key={proj}
                  onClick={() => {
                    setSelectedProject(proj);
                    setShowProjectDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-[#f1f5f9] flex items-center justify-between ${
                    selectedProject === proj ? 'font-semibold text-indigo-600 bg-indigo-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>{proj}</span>
                  {selectedProject === proj && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Button */}
        <button
          onClick={() => onSelectTab('notifications')}
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-[#f1f5f9] rounded-lg relative transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          )}
        </button>

        {/* JWT Auth & Role Pill */}
        <button
          onClick={onOpenAuthModal}
          className="flex items-center gap-2 bg-[#eaedff] hover:bg-[#d2d9f4] border border-[#c7c4d8] px-2.5 py-1 rounded-lg transition-colors text-xs"
        >
          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
            {currentUser.avatarInitials}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-[11px] font-bold text-slate-900 leading-tight">{currentUser.name}</div>
            <div className="text-[9px] font-semibold text-indigo-700 uppercase flex items-center gap-0.5">
              <ShieldCheck className="w-2.5 h-2.5" />
              {currentUser.role}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
};
