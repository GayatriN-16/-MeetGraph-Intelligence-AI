
import {
  LayoutDashboard,
  CalendarDays,
  BrainCircuit,
  ListChecks,
  Network,
  AudioLines,
  Sparkles,
} from 'lucide-react';

import type { Page } from '../../types/index';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const navigation = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'meetings', label: 'Meetings', icon: CalendarDays },
  { id: 'assistant', label: 'Ask MeetGraph AI', icon: BrainCircuit },
  { id: 'tasks', label: 'Tasks & Decisions', icon: ListChecks },
  { id: 'knowledge', label: 'Knowledge Graph', icon: Network },
] as const;

export default function Sidebar({
  activePage,
  onNavigate,
}: SidebarProps) {
  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-[#D8D5ED] bg-white text-[#172554]">

      {/* Brand */}
      <div className="flex h-[76px] items-center gap-3 border-b border-[#EAE8F5] px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-700 to-indigo-600 text-white shadow-md shadow-violet-200">
          <AudioLines size={21} />
        </div>

        <div>
          <h1 className="text-base font-extrabold tracking-tight text-slate-900">
            MeetGraph AI
          </h1>

          <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-violet-700">
            Meeting Intelligence
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-3 pt-7">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Workspace
        </p>

        <nav className="space-y-1.5">
          {navigation.map(({ id, label, icon: Icon }) => {
            const active = activePage === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                aria-current={active ? 'page' : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-violet-700 to-indigo-600 text-white shadow-md shadow-violet-200'
                    : 'text-slate-600 hover:bg-[#F0EDFF] hover:text-violet-800'
                }`}
              >
                <Icon size={19} strokeWidth={active ? 2.3 : 2} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom information */}
      <div className="mt-auto px-3 pb-3">
        <div className="rounded-2xl border border-[#DDD6FE] bg-gradient-to-br from-[#F0EDFF] to-[#E6E6FA] p-4">
          <div className="flex items-center gap-2 text-violet-800">
            <Sparkles size={16} />

            <p className="text-xs font-bold">
              MeetGraph Intelligence
            </p>
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-600">
            Your meetings, tasks and decisions in one intelligent workspace.
          </p>
        </div>

        <div className="mt-3 border-t border-[#EAE8F5] px-2 pt-3">
          <p className="text-xs font-semibold text-slate-800">
            MeetGraph AI
          </p>

          <p className="mt-1 text-[11px] text-slate-500">
            Development workspace
          </p>
        </div>
      </div>
    </aside>
  );
}
