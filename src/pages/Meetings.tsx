
import { useCallback, useEffect, useState } from 'react';

import {
  CalendarDays,
  Clock3,
  FileAudio,
  FileVideo,
  RefreshCw,
  Search,
  Trash2,
  X,
  AlertTriangle,
  AudioLines,
  Sparkles,
} from 'lucide-react';

import { api, type Meeting } from '../api/client';

interface MeetingsProps {
  projectId: number;
}

export default function Meetings({ projectId }: MeetingsProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [meetingToDelete, setMeetingToDelete] =
    useState<Meeting | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadMeetings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await api.getMeetings(projectId);
      setMeetings(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load meetings.',
      );
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadMeetings();
  }, [loadMeetings]);

  async function handleDeleteMeeting() {
    if (!meetingToDelete) return;

    try {
      setDeleting(true);
      setError('');

      await api.deleteMeeting(meetingToDelete.id);

      setMeetings((current) =>
        current.filter((meeting) => meeting.id !== meetingToDelete.id),
      );

      setMeetingToDelete(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to delete meeting.',
      );
    } finally {
      setDeleting(false);
    }
  }

  // Display numbers follow chronological order; database IDs remain unchanged.
  const orderedMeetings = [...meetings].sort((a, b) => {
    const dateA = new Date(a.meeting_date ?? a.created_at).getTime();
    const dateB = new Date(b.meeting_date ?? b.created_at).getTime();

    if (dateA !== dateB) return dateA - dateB;
    return a.id - b.id;
  });

  const filteredMeetings = orderedMeetings.filter((meeting) =>
    `${meeting.title} ${meeting.original_filename}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  function formatDuration(seconds: number | null) {
    if (seconds == null) return 'Unavailable';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);

    return `${minutes}m ${remainingSeconds}s`;
  }

  function isVideo(meeting: Meeting) {
    return meeting.mime_type?.startsWith('video/') ?? false;
  }

  function getStatusStyle(status: string) {
    const normalized = status.toLowerCase();

    if (normalized.includes('transcrib') || normalized.includes('complete')) {
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    }

    if (normalized.includes('process')) {
      return 'bg-[#F0E9FF] text-[#6810D9] ring-[#E2DDF5]';
    }

    if (normalized.includes('fail') || normalized.includes('error')) {
      return 'bg-red-50 text-red-600 ring-red-200';
    }

    return 'border border-[#E2DDF5] bg-[#F8F5FF] text-[#625D7A] ring-[#E2DDF5]';
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7">

      {/* Page heading */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#6810D9]">
            <Sparkles size={16} />
            Project Workspace
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#17152B]">
            Meetings
          </h1>

          <p className="mt-2 text-sm text-[#625D7A]">
            Manage recordings, explore meeting history and monitor processing.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadMeetings()}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-[#E2DDF5] bg-[#FFFFFF] px-4 py-2.5 text-sm font-semibold text-[#625D7A] shadow-sm transition hover:border-[#6810D9] hover:bg-[#F8F5FF] hover:text-[#6810D9] disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </section>

      {/* Hero banner */}
      <section className="relative overflow-hidden rounded-3xl border border-[#E2DDF5] bg-gradient-to-r from-[#6810D9] via-[#7412D8] to-[#5135E8] p-7 text-white shadow-lg shadow-[#6810D9]/10 md:p-9">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
              <AudioLines size={14} className="text-white" />
              Meeting library
            </span>

            <h2 className="mt-5 text-2xl font-bold text-white md:text-3xl">
              Every conversation, organised.
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/80">
              Your project recordings are stored in one place, ready for
              transcription and meeting intelligence.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs text-white">
                {meetings.length} project recordings
              </span>

              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs text-white">
                Searchable meeting history
              </span>
            </div>
          </div>

          <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/20 bg-white/10 text-white shadow-sm">
            <CalendarDays size={46} strokeWidth={1.5} />
          </div>
        </div>

        <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      </section>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Recording summary and search */}
      <section className="grid gap-4 md:grid-cols-[1fr_1.5fr]">
        <div className="flex items-center gap-4 rounded-2xl border border-[#E2DDF5] bg-[#FFFFFF] p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#E2DDF5] bg-[#F0E9FF] text-[#6810D9]">
            <FileAudio size={23} />
          </div>

          <div>
            <p className="text-sm text-[#625D7A]">
              Total recordings
            </p>

            <p className="mt-1 text-2xl font-bold text-[#17152B]">
              {meetings.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[#E2DDF5] bg-[#FFFFFF] p-4 shadow-sm focus-within:border-[#6810D9]">
          <Search size={19} className="shrink-0 text-[#89849F]" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by meeting title or filename..."
            aria-label="Search meetings"
            className="w-full bg-transparent text-sm text-[#25213B] outline-none placeholder:text-[#89849F]"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="rounded-lg p-1 text-[#89849F] transition hover:bg-[#F0E9FF] hover:text-[#6810D9]"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </section>

      {/* Meeting library */}
      <section className="overflow-hidden rounded-2xl border border-[#E2DDF5] bg-[#FFFFFF] shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2DDF5] px-6 py-5">
          <div>
            <h2 className="font-bold text-[#17152B]">
              Meeting Library
            </h2>

            <p className="mt-1 text-xs text-[#625D7A]">
              Recordings stored in this project
            </p>
          </div>

          <span className="rounded-full border border-[#E2DDF5] bg-[#F0E9FF] px-3 py-1.5 text-xs font-semibold text-[#6810D9]">
            {filteredMeetings.length} shown
          </span>
        </div>

        {loading ? (
          <div className="p-14 text-center">
            <RefreshCw
              size={27}
              className="mx-auto animate-spin text-[#6810D9]"
            />

            <p className="mt-4 text-sm text-[#625D7A]">
              Loading your meeting recordings...
            </p>
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="p-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#E2DDF5] bg-[#F0E9FF] text-[#6810D9]">
              <CalendarDays size={30} />
            </div>

            <h3 className="mt-4 font-semibold text-[#17152B]">
              {search ? 'No matching meetings' : 'No recordings yet'}
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm text-[#625D7A]">
              {search
                ? 'Try another search term.'
                : 'Upload a meeting recording to start building your project intelligence.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E2DDF5]">
            {filteredMeetings.map((meeting) => (
              <article
                key={meeting.id}
                className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 transition hover:bg-[#F8F5FF]"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#E2DDF5] bg-[#F0E9FF] text-[#6810D9]">
                    {isVideo(meeting) ? (
                      <FileVideo size={23} />
                    ) : (
                      <FileAudio size={23} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-[#17152B]">
                      {meeting.title}
                    </h3>

                    <p className="mt-1 truncate text-xs text-[#625D7A]">
                      {meeting.original_filename}
                    </p>

                    <p className="mt-1 text-xs text-[#89849F]">
                      Meeting {orderedMeetings.findIndex((item) => item.id === meeting.id) + 1}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1.5 text-xs text-[#89849F]">
                    <Clock3 size={14} />
                    {formatDuration(meeting.duration_seconds)}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ring-1 ring-inset ${getStatusStyle(meeting.status)}`}
                  >
                    {meeting.status.replaceAll('_', ' ')}
                  </span>

                  <button
                    type="button"
                    onClick={() => setMeetingToDelete(meeting)}
                    aria-label={`Delete ${meeting.title}`}
                    title="Delete meeting"
                    className="rounded-xl border border-red-200 p-2.5 text-red-500 transition hover:border-red-300 hover:bg-red-50"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Delete confirmation */}
      {meetingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17102B]/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-meeting-title"
            className="w-full max-w-md rounded-2xl border border-[#E2DDF5] bg-[#FFFFFF] p-6 shadow-2xl shadow-[#35106D]/20"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <AlertTriangle size={24} />
              </div>

              <button
                type="button"
                onClick={() => setMeetingToDelete(null)}
                disabled={deleting}
                aria-label="Close confirmation"
                className="rounded-lg p-2 text-[#89849F] transition hover:bg-[#F0E9FF] hover:text-[#6810D9] disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <h2
              id="delete-meeting-title"
              className="mt-5 text-lg font-bold text-[#17152B]"
            >
              Delete this meeting?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#625D7A]">
              You are about to delete{' '}
              <strong className="text-[#17152B]">
                {meetingToDelete.title}
              </strong>.
              Its associated meeting data will also be affected. This action
              cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setMeetingToDelete(null)}
                disabled={deleting}
                className="rounded-xl border border-[#E2DDF5] px-4 py-2.5 text-sm font-semibold text-[#625D7A] transition hover:bg-[#F8F5FF] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleDeleteMeeting()}
                disabled={deleting}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleting && (
                  <RefreshCw size={15} className="animate-spin" />
                )}

                {deleting ? 'Deleting...' : 'Delete Meeting'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
