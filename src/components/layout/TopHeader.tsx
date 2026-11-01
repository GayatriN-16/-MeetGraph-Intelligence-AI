
import { Search, CircleHelp, UploadCloud } from 'lucide-react';

interface TopHeaderProps {
  projectName: string;
  onUploadMeeting: () => void;
}

export default function TopHeader({
  projectName,
  onUploadMeeting,
}: TopHeaderProps) {
  return (
    <header className="flex min-h-20 flex-wrap items-center justify-between gap-4 border-b border-[#DED3C3] bg-[#FFFDF9] px-6 py-4 md:px-8">
      <div>
        <p className="text-xs text-[#766654]">
          Current workspace
        </p>
        <h2 className="mt-1 text-sm font-semibold text-[#3F3022]">
          {projectName}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden w-64 items-center gap-2 rounded-lg border border-[#DED3C3] bg-[#F8F5EF] px-3 py-2.5 sm:flex">
          <Search size={17} className="text-[#766654]" />
          <input
            placeholder="Search meetings and tasks..."
            className="w-full bg-transparent text-sm text-[#3F3022] outline-none placeholder:text-[#93816D]"
            disabled
          />
        </div>

        <button
          type="button"
          onClick={onUploadMeeting}
          className="flex items-center gap-2 rounded-lg bg-[#A47A32] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#856027] focus:outline-none focus:ring-2 focus:ring-[#C6A15B]"
        >
          <UploadCloud size={17} />
          <span>Upload Meeting</span>
        </button>

        <button
          type="button"
          title="Help"
          aria-label="Help"
          className="rounded-lg p-2 text-[#766654] transition hover:bg-[#EFE2C9] hover:text-[#A47A32]"
        >
          <CircleHelp size={20} />
        </button>
      </div>
    </header>
  );
}
