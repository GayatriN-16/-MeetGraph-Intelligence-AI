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
  X,
} from 'lucide-react';

import type { Page } from '../../types';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  isMobileOpen?: boolean;
  onClose?: () => void;
}

const navigation: {
  id: Page;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'meetings', label: 'Meetings', icon: CalendarDays },
  { id: 'live', label: 'Live Meeting', icon: Radio },
  { id: 'assistant', label: 'AI Assistant', icon: BrainCircuit },
  { id: 'knowledge', label: 'Knowledge Graph', icon: Network },
  { id: 'tasks', label: 'Tasks & Decisions', icon: ListChecks },
  { id: 'analytics', label: 'Analytics', icon: ChartNoAxesCombined },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({
  activePage,
  onNavigate,
  isMobileOpen = false,
  onClose,
}: SidebarProps) {
  function handleNavigate(page: Page) {
    onNavigate(page);
    onClose?.();
  }

  return (
    <aside
      id="meetgraph-sidebar"
      aria-label="Main sidebar"
      aria-hidden={!isMobileOpen && undefined}
      className={`
        mg-sidebar fixed inset-y-0 left-0 z-50
        flex h-[100dvh] w-[280px] shrink-0 flex-col
        border-r border-[#E2DDF5] bg-[#FFFFFF] px-3
        transition-transform duration-300 ease-in-out
        md:sticky md:top-0 md:z-20 md:h-screen md:w-[238px]
        md:translate-x-0
        ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}
    >
      {/* Brand */}
      <div className="flex h-[76px] shrink-0 items-center gap-3 border-b border-[#E2DDF5] px-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#6810D9] to-[#5135E8] text-white shadow-md shadow-[#6810D9]/20">
          <AudioLines size={21} strokeWidth={2.1} />
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-bold tracking-tight text-[#17152B]">
            MeetGraph AI
          </h1>
          <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#89849F]">
            Meeting intelligence
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#625D7A] hover:bg-[#F0E9FF] hover:text-[#6810D9] md:hidden"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <div className="min-h-0 flex-1 overflow-y-auto px-1 pt-7">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#89849F]">
          Workspace
        </p>

        <nav aria-label="Main navigation" className="space-y-1">
          {navigation.map(({ id, label, icon: Icon }) => {
            const active = activePage === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => handleNavigate(id)}
                aria-current={active ? 'page' : undefined}
                className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-[13px] transition-colors duration-150 ${
                  active
                    ? 'border-[#E2DDF5] bg-[#F0E9FF] font-semibold text-[#6810D9]'
                    : 'border-transparent font-medium text-[#625D7A] hover:border-[#E2DDF5] hover:bg-[#F8F5FF] hover:text-[#6810D9]'
                }`}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2.1 : 1.8}
                  className={
                    active
                      ? 'shrink-0 text-[#6810D9]'
                      : 'shrink-0 text-[#89849F] group-hover:text-[#6810D9]'
                  }
                />

                <span className="min-w-0 flex-1">{label}</span>

                {active && (
                  <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#6810D9]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar footer */}
      <div className="mt-auto shrink-0 px-1 pb-5 pt-4">
        <div className="rounded-xl border border-[#E2DDF5] bg-[#F8F5FF] p-3.5">
          <div className="flex items-center gap-2 text-[#6810D9]">
            <AudioLines size={15} />
            <p className="text-xs font-semibold">Meeting intelligence</p>
          </div>

          <p className="mt-2 text-[11px] leading-5 text-[#625D7A]">
            Meetings, tasks and decisions in one connected workspace.
          </p>
        </div>

        <div className="mt-4 border-t border-[#E2DDF5] px-2 pt-4">
          <p className="text-xs font-semibold text-[#17152B]">
            MeetGraph AI
          </p>

          <p className="mt-1 text-[11px] text-[#89849F]">
            Development workspace
          </p>
        </div>
      </div>
    </aside>
  );
}