
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

  const filteredMeetings = meetings.filter((meeting) =>
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

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#A47A32]">
            Project Workspace
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#3F3022]">
            Meetings
          </h1>

          <p className="mt-2 text-sm text-[#766654]">
            Manage uploaded recordings and meeting history.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadMeetings()}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-[#DED3C3] bg-[#FFFDF9] px-4 py-2.5 text-sm font-semibold text-[#3F3022] shadow-sm transition hover:bg-[#EFE2C9] disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#DED3C3] bg-[#FFFDF9] p-5 shadow-sm">
        <div>
          <p className="text-sm text-[#766654]">Total recordings</p>
          <p className="mt-1 text-2xl font-bold text-[#3F3022]">
            {meetings.length}
          </p>
        </div>

        <div className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-[#DED3C3] bg-[#F3EEE5] px-3 py-2.5">
          <Search size={17} className="text-[#766654]" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search meetings..."
            className="w-full bg-transparent text-sm text-[#3F3022] outline-none placeholder:text-[#93816D]"
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[#DED3C3] bg-[#FFFDF9] shadow-sm">
        <div className="border-b border-[#DED3C3] px-6 py-5">
          <h2 className="font-bold text-[#3F3022]">Meeting Library</h2>
          <p className="mt-1 text-xs text-[#766654]">
            Recordings stored in this project
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-[#766654]">
            Loading recordings...
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarDays
              size={32}
              className="mx-auto text-[#A47A32]"
            />

            <p className="mt-3 font-semibold text-[#3F3022]">
              No matching meetings
            </p>

            <p className="mt-1 text-sm text-[#766654]">
              Try another search or upload a recording.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#EAE1D4]">
            {filteredMeetings.map((meeting) => (
              <article
                key={meeting.id}
                className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 transition hover:bg-[#F3EEE5]"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="rounded-xl bg-[#EFE2C9] p-3 text-[#A47A32]">
                    {isVideo(meeting) ? (
                      <FileVideo size={23} />
                    ) : (
                      <FileAudio size={23} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-[#3F3022]">
                      {meeting.title}
                    </h3>

                    <p className="mt-1 truncate text-xs text-[#766654]">
                      {meeting.original_filename}
                    </p>

                    <p className="mt-1 text-xs text-[#93816D]">
                      Meeting ID: {meeting.id}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1.5 text-xs text-[#766654]">
                    <Clock3 size={14} />
                    {formatDuration(meeting.duration_seconds)}
                  </span>

                  <span className="rounded-full bg-[#EFE2C9] px-3 py-1 text-xs font-semibold capitalize text-[#765522]">
                    {meeting.status.replaceAll('_', ' ')}
                  </span>

                  <button
                    type="button"
                    onClick={() => setMeetingToDelete(meeting)}
                    aria-label={`Delete ${meeting.title}`}
                    title="Delete meeting"
                    className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {meetingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3F3022]/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#DED3C3] bg-[#FFFDF9] p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertTriangle size={23} />
              </div>

              <button
                type="button"
                onClick={() => setMeetingToDelete(null)}
                disabled={deleting}
                aria-label="Close confirmation"
                className="rounded-lg p-2 text-[#766654] hover:bg-[#EFE2C9] disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <h2 className="mt-5 text-lg font-bold text-[#3F3022]">
              Delete this meeting?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#766654]">
              You are about to delete{' '}
              <strong className="text-[#3F3022]">
                {meetingToDelete.title}
              </strong>
              . Its associated meeting data will also be affected.
              This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setMeetingToDelete(null)}
                disabled={deleting}
                className="rounded-lg border border-[#DED3C3] px-4 py-2.5 text-sm font-semibold text-[#3F3022] hover:bg-[#F3EEE5]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleDeleteMeeting()}
                disabled={deleting}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
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
