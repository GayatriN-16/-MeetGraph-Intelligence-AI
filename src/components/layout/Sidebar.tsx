
import {
  LayoutDashboard,
  CalendarDays,
  BrainCircuit,
  ListChecks,
  Network,
  AudioLines,
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
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-[#E9E1D4] bg-[#FFFFFF] text-[#4A3B2A]">
      <div className="flex h-20 items-center gap-3 border-b border-[#E9E1D4] px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4A3B2A] text-[#F4EBD9]">
          <AudioLines size={22} />
        </div>

        <div>
          <h1 className="text-lg font-bold tracking-tight">
            MeetGraph AI
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8B7B6A]">
            Meeting Intelligence
          </p>
        </div>
      </div>

      <div className="px-4 pt-7">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#A99B8A]">
          Workspace
        </p>

        <nav className="space-y-1">
          {navigation.map(({ id, label, icon: Icon }) => {
            const active = activePage === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                aria-current={active ? 'page' : undefined}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#F4EBD9] text-[#4A3B2A]'
                    : 'text-[#8B7B6A] hover:bg-[#FAF7F0] hover:text-[#4A3B2A]'
                }`}
              >
                <Icon
                  size={18}
                  className={active ? 'text-[#B18C49]' : ''}
                />
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-[#E9E1D4] p-5">
        <p className="text-xs font-semibold text-[#4A3B2A]">
          MeetGraph AI
        </p>
        <p className="mt-1 text-xs text-[#8B7B6A]">
          Development workspace
        </p>
      </div>
    </aside>
  );
}
