
import React, { useState } from 'react';
import {
  Search,
  Bell,
  Building2,
  ChevronDown,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { NavigationTab, User } from '../types';

interface TopHeaderProps {
  currentUser: User;
  onOpenAuthModal: () => void;
  onSearch: (query: string) => void;
  openUploadModal: () => void;
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  unreadCount?: number;
  onSelectTab: (tab: NavigationTab) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentUser,
  onOpenAuthModal,
  onSearch,
  selectedProject,
  setSelectedProject,
  unreadCount = 0,
  onSelectTab,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  const projects = [
    'Acme Engineering - Capstone v2.4',
    'Product Launch v1',
    'Core Engine',
    'Client Review Board',
  ];

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchValue(query);
    onSearch(query);
  };

  return (
    <header className="sticky top-0 z-20 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
      <div className="min-w-[200px] flex-1">
        <label className="relative block w-full max-w-xl">
          <span className="sr-only">Search meetings</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search meetings, decisions and tasks..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
          />
        </label>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProjectDropdown((open) => !open)}
            aria-expanded={showProjectDropdown}
            className="flex max-w-[220px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <Building2 className="h-4 w-4 shrink-0 text-indigo-500" />
            <span className="truncate">{selectedProject}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
          </button>

          {showProjectDropdown && (
            <>
              <button
                type="button"
                aria-label="Close project menu"
                className="fixed inset-0 z-20 cursor-default"
                onClick={() => setShowProjectDropdown(false)}
              />
              <div className="absolute right-0 z-30 mt-2 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
                <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Project scope
                </p>
                {projects.map((project) => {
                  const active = selectedProject === project;

                  return (
                    <button
                      type="button"
                      key={project}
                      onClick={() => {
                        setSelectedProject(project);
                        setShowProjectDropdown(false);
                      }}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                        active
                          ? 'bg-indigo-50 font-medium text-indigo-700'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{project}</span>
                      {active && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => onSelectTab('notifications')}
          title="Notifications"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-transparent text-slate-500 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          )}
        </button>

        <button
          type="button"
          onClick={onOpenAuthModal}
          aria-label={`Account: ${currentUser.name}`}
          className="flex shrink-0 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-left transition hover:border-slate-300 hover:bg-slate-50"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
            {currentUser.avatarInitials}
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="block max-w-28 truncate text-xs font-semibold text-slate-800">
              {currentUser.name}
            </span>
            <span className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">
              <ShieldCheck className="h-3 w-3 text-indigo-500" />
              {currentUser.role}
            </span>
          </span>
        </button>
      </div>
    </header>
  );
};
