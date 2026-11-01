
import { useCallback, useEffect, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

import {
  api,
  type Meeting,
  type ProjectIntelligence,
} from '../api/client';

interface DashboardProps {
  projectId: number;
}

export default function Dashboard({ projectId }: DashboardProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [intelligence, setIntelligence] =
    useState<ProjectIntelligence | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [meetingData, intelligenceData] = await Promise.all([
        api.getMeetings(projectId),
        api.getIntelligence(projectId),
      ]);

      setMeetings(meetingData);
      setIntelligence(intelligenceData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load dashboard information.',
      );
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const stats = [
    {
      label: 'Total Meetings',
      value: intelligence?.total_meetings ?? meetings.length,
      icon: CalendarDays,
    },
    {
      label: 'Processed Meetings',
      value: intelligence?.processed_meetings ?? 0,
      icon: CheckCircle2,
    },
    {
      label: 'Pending Tasks',
      value: intelligence?.pending_action_items ?? 0,
      icon: Clock3,
    },
    {
      label: 'Decisions Recorded',
      value: intelligence?.total_decisions ?? 0,
      icon: FileText,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">

      {/* Page heading */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#B58B3F]">
            Workspace Overview
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#3F3022]">
            Meeting Intelligence
          </h1>

          <p className="mt-2 text-sm text-[#766654]">
            Review meetings, track tasks and explore project decisions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadDashboard()}
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

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Unable to load project data</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-[#DED3C3] bg-[#FFFDF9] p-12 text-center">
          <RefreshCw
            size={24}
            className="mx-auto animate-spin text-[#B58B3F]"
          />
          <p className="mt-4 text-sm text-[#766654]">
            Loading your meeting intelligence...
          </p>
        </div>
      ) : (
        <>
          {/* Statistics */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-xl border border-[#DED3C3] bg-[#FFFDF9] p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#766654]">
                    {label}
                  </p>

                  <div className="rounded-lg bg-[#EFE2C9] p-2.5">
                    <Icon size={19} className="text-[#A47A32]" />
                  </div>
                </div>

                <p className="mt-5 text-3xl font-bold text-[#3F3022]">
                  {value}
                </p>
              </div>
            ))}
          </section>

          {/* Recent meetings */}
          <section className="overflow-hidden rounded-xl border border-[#DED3C3] bg-[#FFFDF9] shadow-sm">
            <div className="flex items-center justify-between border-b border-[#DED3C3] px-6 py-5">
              <div>
                <h2 className="font-bold text-[#3F3022]">
                  Recent Meetings
                </h2>

                <p className="mt-1 text-xs text-[#766654]">
                  Recordings available in this workspace
                </p>
              </div>

              <CalendarDays size={20} className="text-[#B58B3F]" />
            </div>

            {meetings.length === 0 ? (
              <div className="p-12 text-center">
                <CalendarDays
                  size={32}
                  className="mx-auto text-[#B58B3F]"
                />

                <h3 className="mt-3 font-semibold text-[#3F3022]">
                  No meetings yet
                </h3>

                <p className="mt-1 text-sm text-[#766654]">
                  Upload your first meeting recording to get started.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#EAE1D4]">
                {meetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 transition hover:bg-[#F3EEE5]"
                  >
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-[#3F3022]">
                        {meeting.title}
                      </h3>

                      <p className="mt-1 truncate text-xs text-[#766654]">
                        {meeting.original_filename}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs text-[#766654]">
                        {meeting.duration_seconds != null
                          ? `${Math.round(meeting.duration_seconds)} sec`
                          : 'Duration unavailable'}
                      </span>

                      <span className="rounded-full bg-[#EFE2C9] px-3 py-1 text-xs font-semibold capitalize text-[#765522]">
                        {meeting.status.replaceAll('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Workspace information */}
          <section className="rounded-xl border border-[#DED3C3] bg-[#EFE2C9] p-5">
            <h3 className="text-sm font-bold text-[#3F3022]">
              Project Intelligence
            </h3>

            <p className="mt-1 text-sm text-[#766654]">
              This dashboard displays information retrieved from your
              MeetGraph AI backend.
            </p>

            <p className="mt-3 text-xs font-semibold text-[#765522]">
              Project ID: {projectId}
            </p>
          </section>
        </>
      )}
    </div>
  );
}
