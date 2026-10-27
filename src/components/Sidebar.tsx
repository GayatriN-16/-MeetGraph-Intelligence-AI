import React from 'react';
import {
  LayoutDashboard,
  Library,
  UploadCloud,
  Share2,
  CheckSquare,
  Sparkles,
  FolderKanban,
  Settings,
  LogOut,
  Cpu,
  Workflow,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { NavigationTab } from '../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  openUploadModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, openUploadModal }) => {
  const workspaceItems = [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'meetings' as NavigationTab, label: 'Meetings Library', icon: Library },
    { id: 'upload' as NavigationTab, label: 'Upload Meeting', icon: UploadCloud, action: openUploadModal },
    { id: 'knowledge-graph' as NavigationTab, label: 'Knowledge Graph', icon: Share2 },
    { id: 'tasks-decisions' as NavigationTab, label: 'Tasks & Decisions', icon: CheckSquare },
  ];

  const intelligenceItems = [
    { id: 'ask-ai' as NavigationTab, label: 'Ask AI (GraphRAG)', icon: Sparkles },
    { id: 'architecture' as NavigationTab, label: 'System Architecture', icon: Workflow },
    { id: 'integrations' as NavigationTab, label: 'Integrations', icon: Layers },
    { id: 'admin-audit' as NavigationTab, label: 'Admin & Audit Logs', icon: ShieldCheck },
    { id: 'projects' as NavigationTab, label: 'Projects', icon: FolderKanban },
    { id: 'settings' as NavigationTab, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#ffffff] border-r border-[#e2e8f0] flex flex-col justify-between h-screen sticky top-0 shrink-0 z-20 font-sans">
      <div className="p-4 space-y-5 overflow-y-auto">
        {/* Brand Logo Header */}
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1 font-bold text-slate-900 tracking-tight text-base">
                MeetGraph
              </div>
              <div className="text-[10px] font-semibold tracking-wider uppercase text-indigo-600">
                INTELLIGENCE AI
              </div>
            </div>
          </div>

          {/* Capstone Environment Pill */}
          <div className="mt-3 bg-[#f2f3ff] border border-[#e2e7ff] rounded-md px-2.5 py-1.5 flex items-center gap-2 text-xs font-medium text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Capstone v2.4 (Active)</span>
          </div>
        </div>

        {/* WORKSPACE Navigation */}
        <div className="space-y-1">
          <div className="px-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
            WORKSPACE
          </div>
          {workspaceItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    onSelectTab(item.id);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#4f46e5] text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:bg-[#f1f5f9] hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* INTELLIGENCE & ARCHITECTURE Navigation */}
        <div className="space-y-1">
          <div className="px-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
            INTELLIGENCE & SPECS
          </div>
          {intelligenceItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#4f46e5] text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:bg-[#f1f5f9] hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-[#e2e8f0] bg-[#f8fafc]">
        <div className="bg-[#eaedff] border border-[#d2d9f4] rounded-lg p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              AV
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900">Alex Vance</div>
              <div className="text-[11px] text-slate-500">Admin</div>
            </div>
          </div>
          <button
            title="Log Out / Switch Account"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white/60 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
