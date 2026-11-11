
import { useCallback, useEffect, useState } from 'react';

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  AlertCircle,
  ArrowUpRight,
  AudioLines,
  CircleCheck,
  ListChecks,
  Sparkles,
  TrendingUp,
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

  // Display numbers follow chronological order; database IDs remain unchanged.
  const orderedMeetings = [...meetings].sort((a, b) => {
    const dateA = new Date(a.meeting_date ?? a.created_at).getTime();
    const dateB = new Date(b.meeting_date ?? b.created_at).getTime();

    if (dateA !== dateB) return dateA - dateB;
    return a.id - b.id;
  });

  const meetingNumberById = new Map(
    orderedMeetings.map((meeting, index) => [meeting.id, index + 1]),
  );

  // Keep the dashboard's recent-meetings section newest-first.
  const recentMeetings = [...orderedMeetings].reverse().slice(0, 5);

  const actionItems = intelligence?.action_items ?? [];
  const decisions = intelligence?.decisions ?? [];

  const completedTasks = actionItems.filter(
    (item) => item.status.toLowerCase() === 'completed',
  ).length;

  const pendingTasks = intelligence?.pending_action_items ?? 0;
  const totalTasks = intelligence?.total_action_items ?? 0;
  const processedMeetings = intelligence?.processed_meetings ?? 0;
  const totalMeetings = intelligence?.total_meetings ?? meetings.length;

  const processingRate =
    totalMeetings > 0
      ? Math.round((processedMeetings / totalMeetings) * 100)
      : 0;

  const taskCompletionRate =
    totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

  const upcomingTasks = [...actionItems]
    .filter(
      (item) =>
        item.status.toLowerCase() !== 'completed' && item.due_date,
    )
    .sort(
      (a, b) =>
        new Date(a.due_date!).getTime() -
        new Date(b.due_date!).getTime(),
    )
    .slice(0, 4);

  const stats = [
    {
      label: 'Total Meetings',
      value: totalMeetings,
      description: 'Recordings in workspace',
      icon: CalendarDays,
    },
    {
      label: 'Processed Meetings',
      value: processedMeetings,
      description: 'Successfully transcribed',
      icon: CheckCircle2,
    },
    {
      label: 'Pending Tasks',
      value: pendingTasks,
      description: 'Require attention',
      icon: Clock3,
    },
    {
      label: 'Decisions Recorded',
      value: decisions.length,
      description: 'Extracted from meetings',
      icon: FileText,
    },
  ];

  function formatDuration(seconds: number | null) {
    if (seconds == null) return 'Duration unavailable';
    if (seconds < 60) return `${Math.round(seconds)} sec`;

    const minutes = Math.floor(seconds / 60);
    const remaining = Math.round(seconds % 60);

    return `${minutes}m ${remaining}s`;
  }

  function formatDate(value: string | null) {
    if (!value) return 'Date unavailable';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return 'Date unavailable';

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  function getStatusStyle(status: string) {
    const value = status.toLowerCase();

    if (value.includes('transcrib') || value.includes('process')) {
      return 'border border-emerald-200 bg-emerald-50 text-emerald-700';
    }

    if (
      value.includes('error') ||
      value.includes('fail') ||
      value.includes('interrupt')
    ) {
      return 'border border-red-200 bg-red-50 text-red-700';
    }

    if (value.includes('complete')) {
      return 'border border-emerald-200 bg-emerald-50 text-emerald-700';
    }

    return 'border border-amber-200 bg-amber-50 text-amber-700';
  }

  return (
    <div className="mx-auto max-w-[1440px] space-y-7">
      {/* Page introduction */}
      <section className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-[#6810D9]/20 bg-gradient-to-r from-[#7412D8] to-[#5135E8] px-6 py-6 shadow-[0_8px_24px_rgba(81,53,232,0.16)] md:px-8">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
            <Sparkles size={13} />
            Project workspace
          </span>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Meeting overview
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/85">
            Track meeting activity, follow action items and review decisions across your workspace.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/15 px-3 py-2 text-xs font-medium text-white">
              <AudioLines size={14} className="text-white" />
              {totalMeetings} project meetings
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/15 px-3 py-2 text-xs font-medium text-white">
              <ListChecks size={14} className="text-white" />
              {totalTasks} action items
            </span>
          </div>
        </div>
        <div className="hidden h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white md:flex">
          <TrendingUp size={29} strokeWidth={1.7} />
        </div>
      </section>

      {/* Page heading */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#6810D9]">
            Workspace Overview
          </h2>
          <p className="mt-1 text-sm text-[#625D7A]">
            Project information retrieved from your workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadDashboard()}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-[#E2DDF5] bg-[#FFFFFF] px-4 py-2.5 text-xs font-semibold text-[#625D7A] transition hover:border-[#5135E8] hover:bg-[#F0E9FF] disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </section>

      {/* Error */}
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
        <div className="rounded-xl border border-[#E2DDF5] bg-[#FFFFFF] p-12 text-center">
          <RefreshCw
            size={25}
            className="mx-auto animate-spin text-[#6810D9]"
          />
          <p className="mt-4 text-sm text-[#625D7A]">
            Loading your meeting intelligence...
          </p>
        </div>
      ) : (
        <>
          {/* Statistics */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, description, icon: Icon }) => (
              <article
                key={label}
                className="rounded-xl border border-[#E2DDF5] bg-[#FFFFFF] p-5 shadow-[0_1px_3px_rgba(48,50,56,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(81,53,232,0.09)]"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-[#F0E9FF] p-3 text-[#6810D9]">
                    <Icon size={20} strokeWidth={1.8} />
                  </div>
                  <ArrowUpRight size={17} className="text-[#89849F]" />
                </div>

                <p className="mt-5 text-3xl font-semibold tracking-tight text-[#17152B]">
                  {value}
                </p>
                <p className="mt-1 text-sm font-semibold text-[#17152B]">
                  {label}
                </p>
                <p className="mt-1 text-xs text-[#89849F]">
                  {description}
                </p>
              </article>
            ))}
          </section>

          {/* Progress */}
          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <article className="rounded-xl border border-[#E2DDF5] bg-[#FFFFFF] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#17152B]">
                    Meeting Processing
                  </h3>
                  <p className="mt-1 text-xs text-[#625D7A]">
                    Transcription progress across this project
                  </p>
                </div>
                <div className="rounded-lg bg-[#F0E9FF] p-3 text-[#6810D9]">
                  <AudioLines size={20} />
                </div>
              </div>

              <div className="mt-7 flex items-end justify-between">
                <p className="text-3xl font-semibold text-[#17152B]">
                  {processingRate}%
                </p>
                <p className="text-xs text-[#625D7A]">
                  {processedMeetings} of {totalMeetings} processed
                </p>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#F0E9FF]">
                <div
                  className="h-full rounded-full bg-[#6810D9] transition-all duration-700"
                  style={{ width: `${processingRate}%` }}
                />
              </div>

              <p className="mt-4 text-xs text-[#89849F]">
                Based on processing status reported by the backend.
              </p>
            </article>

            <article className="rounded-xl border border-[#E2DDF5] bg-[#FFFFFF] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#17152B]">
                    Task Completion
                  </h3>
                  <p className="mt-1 text-xs text-[#625D7A]">
                    Current action item status
                  </p>
                </div>
                <div className="rounded-lg bg-[#F0E9FF] p-3 text-[#6810D9]">
                  <CircleCheck size={20} />
                </div>
              </div>

              <div className="mt-7 flex items-end justify-between">
                <p className="text-3xl font-semibold text-[#17152B]">
                  {taskCompletionRate}%
                </p>
                <p className="text-xs text-[#625D7A]">
                  {completedTasks} of {totalTasks} completed
                </p>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#F0E9FF]">
                <div
                  className="h-full rounded-full bg-[#6810D9] transition-all duration-700"
                  style={{ width: `${taskCompletionRate}%` }}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-[#625D7A]">
                  <span className="h-2 w-2 rounded-full bg-[#6810D9]" />
                  {pendingTasks} pending
                </span>
                <span className="flex items-center gap-1.5 text-[#625D7A]">
                  <span className="h-2 w-2 rounded-full bg-[#55B88A]" />
                  {completedTasks} completed
                </span>
              </div>
            </article>
          </section>

          {/* Recent meetings and deadlines */}
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <article className="overflow-hidden rounded-xl border border-[#E2DDF5] bg-[#FFFFFF] xl:col-span-2">
              <div className="flex items-center justify-between border-b border-[#E2DDF5] px-6 py-5">
                <div>
                  <h3 className="text-sm font-semibold text-[#17152B]">
                    Recent Meetings
                  </h3>
                  <p className="mt-1 text-xs text-[#625D7A]">
                    Your latest uploaded recordings
                  </p>
                </div>
                <CalendarDays size={20} className="text-[#6810D9]" />
              </div>

              {meetings.length === 0 ? (
                <div className="p-10 text-center">
                  <CalendarDays
                    size={30}
                    className="mx-auto text-[#6810D9]"
                  />
                  <p className="mt-3 text-sm font-semibold text-[#17152B]">
                    No meetings yet
                  </p>
                  <p className="mt-1 text-xs text-[#89849F]">
                    Upload your first recording to get started.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#E2DDF5]">
                  {recentMeetings.map((meeting: Meeting) => (
                    <div
                      key={meeting.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition-colors hover:bg-[#F8F5FF]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="rounded-lg bg-[#F0E9FF] p-3 text-[#6810D9]">
                          <AudioLines size={18} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-semibold text-[#17152B]">
                            {meeting.title}
                          </h4>
                          <p className="mt-1 truncate text-xs text-[#89849F]">
                            Meeting {meetingNumberById.get(meeting.id)} · {meeting.original_filename}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#625D7A]">
                          {formatDuration(meeting.duration_seconds)}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-semibold capitalize ${getStatusStyle(meeting.status)}`}
                        >
                          {meeting.status.replaceAll('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="overflow-hidden rounded-xl border border-[#E2DDF5] bg-[#FFFFFF]">
              <div className="border-b border-[#E2DDF5] px-5 py-5">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-gradient-to-br from-[#7412D8] to-[#5135E8] p-2 text-white">
                    <Clock3 size={17} />
                  </div>
                  <h3 className="text-sm font-semibold text-[#17152B]">
                    Upcoming Deadlines
                  </h3>
                </div>
                <p className="mt-2 text-xs text-[#625D7A]">
                  Pending tasks with recorded due dates
                </p>
              </div>

              {upcomingTasks.length === 0 ? (
                <div className="p-7 text-center">
                  <CheckCircle2
                    size={27}
                    className="mx-auto text-[#55B88A]"
                  />
                  <p className="mt-3 text-sm font-semibold text-[#17152B]">
                    No upcoming deadlines
                  </p>
                  <p className="mt-1 text-xs text-[#89849F]">
                    No pending tasks with due dates were found.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#E2DDF5]">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="px-5 py-4">
                      <p className="text-sm font-semibold text-[#17152B]">
                        {task.task_description}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-[#625D7A]">
                          {task.assignee_name || 'Unassigned'}
                        </span>
                        <span className="rounded-md bg-[#F0E9FF] px-2 py-1 text-[10px] font-semibold text-[#6810D9]">
                          {formatDate(task.due_date)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>
        </>
      )}
    </div>
  );
}
