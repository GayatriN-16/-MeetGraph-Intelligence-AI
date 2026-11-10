import { useState } from 'react';

import {
  Search,
  Bell,
  ChevronDown,
  FolderOpen,
  UserRound,
  Settings,
  UploadCloud,
} from 'lucide-react';

import type { Project } from '../../api/client';

interface TopHeaderProps {
  projects: Project[];
  selectedProjectId: number | null;
  onProjectChange: (projectId: number) => void;
  onNavigate: (page: 'settings') => void;
  onUploadMeeting: () => void;
}

export default function TopHeader({
  projects,
  selectedProjectId,
  onProjectChange,
  onNavigate,
  onUploadMeeting,
}: TopHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-[#EBC3D4] bg-white">
      <div className="flex min-h-[68px] flex-wrap items-center justify-between gap-3 px-5 py-3 md:px-7">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#89818B]">
            Workspace
          </p>
          <h2 className="mt-0.5 truncate text-lg font-semibold tracking-tight text-[#34303A]">
            MeetGraph AI
          </h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onUploadMeeting}
            className="inline-flex items-center gap-2 rounded-lg bg-[#C65383] px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#A83E6D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A83E6D] sm:px-4"
          >
            <UploadCloud size={16} />
            <span>Upload Meeting</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowNotifications((value) => !value);
                setShowProfile(false);
              }}
              aria-label="Notifications"
              aria-expanded={showNotifications}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#EBC3D4] bg-white text-[#55505A] transition-colors hover:bg-[#FFF5F8] hover:text-[#A83E6D]"
            >
              <Bell size={18} />
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-[#EBC3D4] bg-white p-4 shadow-xl animate-[mg-fade-in_160ms_ease-out]">
                <h3 className="text-sm font-semibold text-[#34303A]">Notifications</h3>
                <div className="py-7 text-center">
                  <Bell size={20} className="mx-auto text-[#A83E6D]" />
                  <p className="mt-3 text-sm font-medium text-[#55505A]">No notifications yet</p>
                  <p className="mt-1 text-xs text-[#89818B]">
                    Workspace notifications will appear here when available.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowProfile((value) => !value);
                setShowNotifications(false);
              }}
              aria-label="Profile menu"
              aria-expanded={showProfile}
              className="flex items-center gap-2 rounded-lg border border-[#EBC3D4] bg-white p-1.5 pr-3 transition-colors hover:bg-[#FFF5F8]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8E1EB] text-[#A83E6D]">
                <UserRound size={17} />
              </div>
              <ChevronDown size={15} className="text-[#89818B]" />
            </button>
            {showProfile && (
              <div className="absolute right-0 top-12 z-50 w-52 rounded-xl border border-[#EBC3D4] bg-white p-2 shadow-xl animate-[mg-fade-in_160ms_ease-out]">
                <div className="border-b border-[#EBC3D4] px-3 py-3">
                  <p className="text-sm font-semibold text-[#34303A]">Workspace profile</p>
                  <p className="mt-1 text-xs text-[#89818B]">Account information</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfile(false);
                    onNavigate('settings');
                  }}
                  className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-[#55505A] transition-colors hover:bg-[#FFF5F8] hover:text-[#A83E6D]"
                >
                  <Settings size={16} />
                  Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EBC3D4] bg-[#FFF5F8] px-5 py-2.5 md:px-7">
        <label className="flex min-w-[220px] items-center gap-3 rounded-lg border border-[#EBC3D4] bg-white px-3 py-2.5 transition-colors focus-within:border-[#C65383]">
          <FolderOpen size={16} className="shrink-0 text-[#A83E6D]" />
          <select
            aria-label="Select workspace"
            value={selectedProjectId ?? ''}
            onChange={(event) => onProjectChange(Number(event.target.value))}
            disabled={projects.length === 0}
            className="w-full min-w-0 cursor-pointer bg-transparent text-xs font-semibold text-[#34303A] outline-none disabled:cursor-not-allowed"
          >
            {projects.length === 0 ? (
              <option value="">No workspace available</option>
            ) : (
              projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))
            )}
          </select>
          <ChevronDown size={14} className="shrink-0 text-[#89818B]" />
        </label>

        <div className="flex w-full max-w-md items-center gap-2 rounded-lg border border-[#EBC3D4] bg-white px-3 py-2.5 opacity-65">
          <Search size={15} className="shrink-0 text-[#89818B]" />
          <input
            type="search"
            aria-label="Global search"
            placeholder="Global search coming soon"
            disabled
            className="w-full bg-transparent text-xs text-[#55505A] outline-none placeholder:text-[#89818B]"
          />
        </div>

        <span className="hidden items-center gap-2 text-[11px] font-medium text-[#55505A] lg:flex">
          <span className="h-2 w-2 rounded-full bg-[#78966A]" />
          Workspace active
        </span>
      </div>
    </header>
  );
}