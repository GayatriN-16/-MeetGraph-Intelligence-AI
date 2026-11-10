import {
  LayoutDashboard,
  CalendarDays,
  BrainCircuit,
  ListChecks,
  Network,
  AudioLines,
  ChartNoAxesCombined,
  Settings,
  Radio,
} from 'lucide-react';

import type { Page } from '../../types';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const navigation: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'meetings', label: 'Meetings', icon: CalendarDays },
  { id: 'live', label: 'Live Meeting', icon: Radio },
  { id: 'assistant', label: 'AI Assistant', icon: BrainCircuit },
  { id: 'knowledge', label: 'Knowledge Graph', icon: Network },
  { id: 'tasks', label: 'Tasks & Decisions', icon: ListChecks },
  { id: 'analytics', label: 'Analytics', icon: ChartNoAxesCombined },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="mg-sidebar sticky top-0 flex h-screen w-[238px] shrink-0 flex-col border-r border-[#EBC3D4] bg-white px-3">
      <div className="flex h-[76px] shrink-0 items-center gap-3 border-b border-[#EBC3D4] px-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C65383] text-white shadow-sm">
          <AudioLines size={21} strokeWidth={2.1} />
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-[15px] font-bold tracking-tight text-[#34303A]">
            MeetGraph AI
          </h1>

          <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#89818B]">
            Meeting intelligence
          </p>
        </div>
      </div>

      <div className="px-1 pt-7">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#89818B]">
          Workspace
        </p>

        <nav aria-label="Main navigation" className="space-y-1">
          {navigation.map(({ id, label, icon: Icon }) => {
            const active = activePage === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                aria-current={active ? 'page' : undefined}
                className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-[13px] transition-colors duration-150 ${
                  active
                    ? 'border-[#C65383] bg-[#F8E1EB] font-semibold text-[#A83E6D]'
                    : 'border-transparent font-medium text-[#55505A] hover:border-[#EBC3D4] hover:bg-[#FFF5F8] hover:text-[#A83E6D]'
                }`}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2.1 : 1.8}
                  className={active ? 'text-[#A83E6D]' : 'text-[#89818B] group-hover:text-[#A83E6D]'}
                />

                <span>{label}</span>

                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#A83E6D]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto px-1 pb-5">
        <div className="rounded-xl border border-[#EBC3D4] bg-[#F8E1EB] p-3.5">
          <div className="flex items-center gap-2 text-[#A83E6D]">
            <AudioLines size={15} className="text-[#A83E6D]" />

            <p className="text-xs font-semibold">
              Meeting intelligence
            </p>
          </div>

          <p className="mt-2 text-[11px] leading-5 text-[#55505A]">
            Meetings, tasks and decisions in one connected workspace.
          </p>
        </div>

        <div className="mt-4 border-t border-[#EBC3D4] px-2 pt-4">
          <p className="text-xs font-semibold text-[#34303A]">
            MeetGraph AI
          </p>

          <p className="mt-1 text-[11px] text-[#89818B]">
            Development workspace
          </p>
        </div>
      </div>
    </aside>
  );
}