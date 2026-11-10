
import { useState } from 'react';

import {
  Search,
  Bell,
  ChevronDown,
  FolderOpen,
  UserRound,
  Settings,
  UploadCloud,
  Menu,
} from 'lucide-react';

import type { Project } from '../../api/client';

interface TopHeaderProps {
  projects: Project[];
  selectedProjectId: number | null;
  onProjectChange: (projectId: number) => void;
  onNavigate: (page: 'settings') => void;
  onUploadMeeting: () => void;
  onMenuClick: () => void;
}

export default function TopHeader({
  projects,
  selectedProjectId,
  onProjectChange,
  onNavigate,
  onUploadMeeting,
  onMenuClick,
}: TopHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full shrink-0 border-b border-[#EBC3D4] bg-white">
      {/* Main header row */}
      <div className="flex min-h-[64px] items-center justify-between gap-2 px-3 py-2.5 sm:px-5 md:min-h-[68px] md:gap-3 md:px-7">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            aria-controls="meetgraph-sidebar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#EBC3D4] bg-white text-[#55505A] transition-colors hover:bg-[#FFF5F8] hover:text-[#A83E6D] md:hidden"
          >
            <Menu size={21} />
          </button>

          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#89818B] sm:text-[10px]">
              Workspace
            </p>
            <h2 className="mt-0.5 truncate text-sm font-semibold tracking-tight text-[#34303A] sm:text-base md:text-lg">
              MeetGraph AI
            </h2>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
          <button
            type="button"
            onClick={onUploadMeeting}
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-[#C65383] px-2.5 py-2 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-[#A83E6D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A83E6D] sm:gap-2 sm:px-3.5 sm:text-xs md:px-4"
          >
            <UploadCloud size={15} />
            <span className="sm:hidden">Upload</span>
            <span className="hidden sm:inline">Upload Meeting</span>
          </button>

          {/* Notifications */}
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
              <Bell size={17} />
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 z-50 w-[min(288px,calc(100vw-24px))] rounded-xl border border-[#EBC3D4] bg-white p-4 shadow-xl animate-[mg-fade-in_160ms_ease-out]">
                <h3 className="text-sm font-semibold text-[#34303A]">
                  Notifications
                </h3>

                <div className="py-7 text-center">
                  <Bell size={20} className="mx-auto text-[#A83E6D]" />
                  <p className="mt-3 text-sm font-medium text-[#55505A]">
                    No notifications yet
                  </p>
                  <p className="mt-1 text-xs text-[#89818B]">
                    Workspace notifications will appear here when available.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowProfile((value) => !value);
                setShowNotifications(false);
              }}
              aria-label="Profile menu"
              aria-expanded={showProfile}
              className="flex h-10 items-center gap-1.5 rounded-lg border border-[#EBC3D4] bg-white p-1 pr-2 transition-colors hover:bg-[#FFF5F8] sm:gap-2 sm:pr-3"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F8E1EB] text-[#A83E6D] sm:h-8 sm:w-8">
                <UserRound size={16} />
              </div>
              <ChevronDown size={14} className="text-[#89818B]" />
            </button>

            {showProfile && (
              <div className="absolute right-0 top-12 z-50 w-52 rounded-xl border border-[#EBC3D4] bg-white p-2 shadow-xl animate-[mg-fade-in_160ms_ease-out]">
                <div className="border-b border-[#EBC3D4] px-3 py-3">
                  <p className="text-sm font-semibold text-[#34303A]">
                    Workspace profile
                  </p>
                  <p className="mt-1 text-xs text-[#89818B]">
                    Account information
                  </p>
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

      {/* Workspace selector and search */}
      <div className="flex w-full flex-col gap-2 border-t border-[#EBC3D4] bg-[#FFF5F8] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 md:px-7">
        <label className="flex min-h-10 w-full min-w-0 items-center gap-2 rounded-lg border border-[#EBC3D4] bg-white px-3 py-2 sm:max-w-[320px] sm:gap-3">
          <FolderOpen size={16} className="shrink-0 text-[#A83E6D]" />

          <select
            aria-label="Select workspace"
            value={selectedProjectId ?? ''}
            onChange={(event) => onProjectChange(Number(event.target.value))}
            disabled={projects.length === 0}
            className="w-full min-w-0 cursor-pointer truncate bg-transparent text-xs font-semibold text-[#34303A] outline-none disabled:cursor-not-allowed"
          >
            {projects.length === 0 ? (
              <option value="">No workspace available</option>
            ) : (
              projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))
            )}
          </select>

          <ChevronDown size={14} className="shrink-0 text-[#89818B]" />
        </label>

        <div className="hidden w-full max-w-md items-center gap-2 rounded-lg border border-[#EBC3D4] bg-white px-3 py-2.5 opacity-65 md:flex">
          <Search size={15} className="shrink-0 text-[#89818B]" />
          <input
            type="search"
            aria-label="Global search"
            placeholder="Global search coming soon"
            disabled
            className="w-full min-w-0 bg-transparent text-xs text-[#55505A] outline-none placeholder:text-[#89818B]"
          />
        </div>

        <span className="hidden shrink-0 items-center gap-2 text-[11px] font-medium text-[#55505A] lg:flex">
          <span className="h-2 w-2 rounded-full bg-[#78966A]" />
          Workspace active
        </span>
      </div>
    </header>
  );
}
