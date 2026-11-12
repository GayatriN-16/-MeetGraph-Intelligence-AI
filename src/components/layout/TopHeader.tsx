import { useEffect, useRef, useState } from 'react';

import {
  Search,
  Bell,
  ChevronDown,
  FolderOpen,
  Settings,
  UploadCloud,
  Menu,
  LogOut,
  UserRound,
  Plus,
} from 'lucide-react';

import type { Project, AuthUser } from '../../api/client';

interface TopHeaderProps {
  projects: Project[];
  selectedProjectId: number | null;
  user: AuthUser;
  onProjectChange: (projectId: number) => void;
  onNavigate: (page: 'settings') => void;
  onUploadMeeting: () => void;
  onCreateWorkspace: () => void;
  onLogout: () => void;
  onMenuClick: () => void;
}

export default function TopHeader({
  projects,
  selectedProjectId,
  user,
  onProjectChange,
  onNavigate,
  onUploadMeeting,
  onCreateWorkspace,
  onLogout,
  onMenuClick,
}: TopHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const initial = user.name.trim().charAt(0).toUpperCase() || 'U';

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;

      if (!profileRef.current?.contains(target)) {
        setShowProfile(false);
      }

      if (!notificationRef.current?.contains(target)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full shrink-0 border-b border-[#E2DDF5] bg-[#FFFFFF]">

      <div className="flex min-h-[64px] items-center justify-between gap-2 px-3 py-2.5 sm:px-5 md:min-h-[68px] md:gap-3 md:px-7">

        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            aria-controls="meetgraph-sidebar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E2DDF5] bg-[#FFFFFF] text-[#625D7A] transition-colors hover:bg-[#F0E9FF] hover:text-[#6810D9] md:hidden"
          >
            <Menu size={21} />
          </button>

          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#89849F] sm:text-[10px]">
              Workspace
            </p>

            <h2 className="mt-0.5 truncate text-sm font-semibold tracking-tight text-[#17152B] sm:text-base md:text-lg">
              MeetGraph AI
            </h2>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">

          <button
            type="button"
            onClick={onUploadMeeting}
            disabled={selectedProjectId === null}
            title={
              selectedProjectId === null
                ? 'Create a workspace before uploading'
                : 'Upload a meeting'
            }
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#6810D9] to-[#5135E8] px-2.5 py-2 text-[11px] font-semibold text-white shadow-sm transition-all hover:shadow-md hover:shadow-[#6810D9]/20 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-3.5 sm:text-xs md:px-4"
          >
            <UploadCloud size={15} />
            <span className="sm:hidden">Upload</span>
            <span className="hidden sm:inline">Upload Meeting</span>
          </button>

          {/* Notifications */}

          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={() => {
                setShowNotifications((value) => !value);
                setShowProfile(false);
              }}
              aria-label="Notifications"
              aria-expanded={showNotifications}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E2DDF5] bg-[#FFFFFF] text-[#625D7A] transition-colors hover:bg-[#F0E9FF] hover:text-[#6810D9]"
            >
              <Bell size={17} />
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 z-50 w-[min(288px,calc(100vw-24px))] rounded-xl border border-[#E2DDF5] bg-[#FFFFFF] p-4 shadow-xl">
                <h3 className="text-sm font-semibold text-[#17152B]">
                  Notifications
                </h3>

                <div className="py-7 text-center">
                  <Bell size={20} className="mx-auto text-[#6810D9]" />

                  <p className="mt-3 text-sm font-medium text-[#625D7A]">
                    No notifications yet
                  </p>

                  <p className="mt-1 text-xs text-[#89849F]">
                    Workspace notifications will appear here when available.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* User profile */}

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setShowProfile((value) => !value);
                setShowNotifications(false);
              }}
              aria-label="User profile"
              aria-expanded={showProfile}
              className="flex h-10 items-center gap-1.5 rounded-lg border border-[#E2DDF5] bg-[#FFFFFF] p-1 pr-2 transition-colors hover:bg-[#F0E9FF] sm:gap-2 sm:pr-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#6810D9] to-[#5135E8] text-sm font-bold text-white">
                {initial}
              </div>

              <ChevronDown size={14} className="text-[#89849F]" />
            </button>

            {showProfile && (
              <div className="absolute right-0 top-12 z-50 w-[min(280px,calc(100vw-24px))] rounded-xl border border-[#E2DDF5] bg-[#FFFFFF] p-2 shadow-xl">

                <div className="border-b border-[#E2DDF5] px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6810D9] to-[#5135E8] text-lg font-bold text-white">
                      {initial}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#17152B]">
                        {user.name}
                      </p>

                      <p className="truncate text-xs text-[#89849F]">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-[#89849F]">
                      Account role
                    </span>

                    <span className="rounded-full bg-[#F0E9FF] px-2.5 py-1 text-[10px] font-semibold capitalize text-[#6810D9]">
                      {user.role}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfile(false);
                    onNavigate('settings');
                  }}
                  className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-[#625D7A] transition-colors hover:bg-[#F8F5FF] hover:text-[#6810D9]"
                >
                  <Settings size={16} />
                  Settings
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfile(false);
                    onLogout();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-[#DC2626] transition-colors hover:bg-[#FEF2F2]"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Workspace selector */}

      <div className="flex w-full flex-col gap-2 border-t border-[#E2DDF5] bg-[#F8F5FF] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 md:px-7">

        <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
          <label className="flex min-h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#E2DDF5] bg-[#FFFFFF] px-3 py-2 sm:max-w-[320px] sm:gap-3">
            <FolderOpen size={16} className="shrink-0 text-[#6810D9]" />

            <select
              aria-label="Select workspace"
              value={selectedProjectId ?? ''}
              onChange={(event) =>
                onProjectChange(Number(event.target.value))
              }
              disabled={projects.length === 0}
              className="w-full min-w-0 cursor-pointer truncate bg-transparent text-xs font-semibold text-[#17152B] outline-none disabled:cursor-not-allowed"
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

            <ChevronDown size={14} className="shrink-0 text-[#89849F]" />
          </label>

          <button
            type="button"
            onClick={onCreateWorkspace}
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-[#E2DDF5] bg-[#FFFFFF] px-3 text-xs font-semibold text-[#6810D9] transition hover:border-[#CDBBFA] hover:bg-[#F0E9FF]"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">New Workspace</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>

        <div className="hidden w-full max-w-md items-center gap-2 rounded-lg border border-[#E2DDF5] bg-[#FFFFFF] px-3 py-2.5 md:flex">
          <Search size={15} className="shrink-0 text-[#89849F]" />

          <input
            type="search"
            aria-label="Global search"
            placeholder="Global search coming soon"
            disabled
            className="w-full min-w-0 bg-transparent text-xs text-[#625D7A] outline-none placeholder:text-[#89849F]"
          />
        </div>

        <span className="hidden shrink-0 items-center gap-2 text-[11px] font-medium text-[#625D7A] lg:flex">
          <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
          Workspace active
        </span>
      </div>
    </header>
  );
}