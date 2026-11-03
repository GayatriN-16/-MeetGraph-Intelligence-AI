
import {
  Search,
  CircleHelp,
  UploadCloud,
  Sparkles,
} from 'lucide-react';

interface TopHeaderProps {
  projectName: string;
  onUploadMeeting: () => void;
}

export default function TopHeader({
  projectName,
  onUploadMeeting,
}: TopHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex min-h-[76px] flex-wrap items-center justify-between gap-4 border-b border-[#D8D5ED] bg-white/95 px-5 py-3 backdrop-blur-md md:px-8">

      {/* Workspace information */}
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <Sparkles size={12} className="text-violet-600" />
          Current workspace
        </p>

        <h2 className="mt-1 truncate text-sm font-bold text-slate-900">
          {projectName}
        </h2>
      </div>

      {/* Header actions */}
      <div className="flex items-center gap-3">

        {/* Search */}
        <div className="hidden w-64 items-center gap-2 rounded-xl border border-[#D8D5ED] bg-[#F5F3FF] px-3 py-2.5 transition-colors focus-within:border-violet-400 sm:flex">
          <Search size={16} className="shrink-0 text-slate-400" />

          <input
            placeholder="Search meetings and tasks..."
            aria-label="Search meetings and tasks"
            className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
            disabled
          />
        </div>

        {/* Workspace status */}
        <span className="hidden items-center gap-2 rounded-full border border-[#DDD6FE] bg-[#F0EDFF] px-3 py-2 text-[11px] font-semibold text-violet-800 md:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Workspace active
        </span>

        {/* Upload meeting */}
        <button
          type="button"
          onClick={onUploadMeeting}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-700 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
        >
          <UploadCloud size={16} />
          <span>Upload Meeting</span>
        </button>

        {/* Help */}
        <button
          type="button"
          title="Help"
          aria-label="Help"
          className="rounded-xl p-2 text-slate-500 transition hover:bg-[#F0EDFF] hover:text-violet-800"
        >
          <CircleHelp size={19} />
        </button>
      </div>
    </header>
  );
}
