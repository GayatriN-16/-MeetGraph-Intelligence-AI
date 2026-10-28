
import React from 'react';
import {
  LayoutDashboard,
  Library,
  UploadCloud,
  Network,
  CheckSquare,
  Sparkles,
  FolderKanban,
  Settings,
  LogOut,
  Cpu,
  Workflow,
  Layers,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { NavigationTab, User } from '../types';

interface SidebarProps {
  currentTab: NavigationTab;
  currentUser: User;
  onSelectTab: (tab: NavigationTab) => void;
  openUploadModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  currentUser,
  onSelectTab,
  openUploadModal,
}) => {
  const workspaceItems = [
    { id: 'dashboard' as NavigationTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'meetings' as NavigationTab, label: 'Meetings', icon: Library },
    { id: 'knowledge-graph' as NavigationTab, label: 'Knowledge Graph', icon: Network },
    { id: 'tasks-decisions' as NavigationTab, label: 'Tasks & Decisions', icon: CheckSquare },
  ];

  const intelligenceItems = [
    { id: 'ask-ai' as NavigationTab, label: 'Ask AI', icon: Sparkles },
    { id: 'projects' as NavigationTab, label: 'Projects', icon: FolderKanban },
  ];

  const systemItems = [
    { id: 'architecture' as NavigationTab, label: 'Architecture', icon: Workflow },
    { id: 'integrations' as NavigationTab, label: 'Integrations', icon: Layers },
    { id: 'admin-audit' as NavigationTab, label: 'Audit Logs', icon: ShieldCheck },
    { id: 'settings' as NavigationTab, label: 'Settings', icon: Settings },
  ];

  const renderItems = (
    items: { id: NavigationTab; label: string; icon: React.ElementType }[],
  ) =>
    items.map(({ id, label, icon: Icon }) => {
      const active = currentTab === id;

      return (
        <button
          key={id}
          type="button"
          onClick={() => onSelectTab(id)}
          aria-current={active ? 'page' : undefined}
          className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
            active
              ? 'bg-indigo-500/15 font-semibold text-white ring-1 ring-inset ring-indigo-400/20'
              : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-100'
          }`}
        >
          <Icon
            className={`h-[18px] w-[18px] shrink-0 ${
              active ? 'text-indigo-300' : 'text-slate-500 group-hover:text-slate-300'
            }`}
          />
          <span className="min-w-0 flex-1 truncate text-left">{label}</span>
          {active && <ChevronRight className="h-4 w-4 text-indigo-300" />}
        </button>
      );
    });

  return (
    <aside className="sticky top-0 z-30 flex h-screen w-[250px] shrink-0 flex-col border-r border-slate-800 bg-[#111827] text-white">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5">
        <button
          type="button"
          onClick={() => onSelectTab('dashboard')}
          className="mb-8 flex items-center gap-3 rounded-xl text-left"
          aria-label="MeetGraph AI home"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-950/30">
            <Cpu className="h-5 w-5 text-white" />
          </span>
          <span className="min-w-0">
            <span className="block text-base font-bold tracking-tight text-white">
              MeetGraph AI
            </span>
            <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
              Meeting intelligence
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={openUploadModal}
          className="mb-7 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-3 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 focus:ring-offset-[#111827]"
        >
          <UploadCloud className="h-4 w-4" />
          Upload a meeting
        </button>

        <nav className="space-y-7" aria-label="Main navigation">
          <section className="space-y-2">
            <h2 className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Workspace
            </h2>
            <div className="space-y-1">{renderItems(workspaceItems)}</div>
          </section>

          <section className="space-y-2">
            <h2 className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Intelligence
            </h2>
            <div className="space-y-1">{renderItems(intelligenceItems)}</div>
          </section>

          <section className="space-y-2">
            <h2 className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              System
            </h2>
            <div className="space-y-1">{renderItems(systemItems)}</div>
          </section>
        </nav>
      </div>

      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
            {currentUser.avatarInitials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-100">
              {currentUser.name}
            </p>
            <p className="mt-0.5 truncate text-xs text-slate-400">
              {currentUser.role}
            </p>
          </div>
          <LogOut className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
        </div>
        <p className="mt-3 text-center text-[10px] text-slate-600">
          MeetGraph AI · Development preview
        </p>
      </div>
    </aside>
  );
};
