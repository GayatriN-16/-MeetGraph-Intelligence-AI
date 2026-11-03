
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
        item.status.toLowerCase() !== 'completed' &&
        item.due_date,
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
      icon: CalendarDays,
      color: 'bg-[#F0EDFF] text-violet-700',
      description: 'Recordings in workspace',
    },
    {
      label: 'Processed Meetings',
      value: processedMeetings,
      icon: CheckCircle2,
      color: 'bg-emerald-100 text-emerald-700',
      description: 'Successfully transcribed',
    },
    {
      label: 'Pending Tasks',
      value: pendingTasks,
      icon: Clock3,
      color: 'bg-amber-100 text-amber-700',
      description: 'Require attention',
    },
    {
      label: 'Decisions Recorded',
      value: decisions.length,
      icon: FileText,
      color: 'bg-blue-100 text-blue-700',
      description: 'Extracted from meetings',
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

  function getStatusColor(status: string) {
    const value = status.toLowerCase();

    if (value.includes('transcrib') || value.includes('process')) {
      return 'bg-emerald-100 text-emerald-700';
    }

    if (value.includes('error') || value.includes('fail')) {
      return 'bg-red-100 text-red-700';
    }

    return 'bg-amber-100 text-amber-700';
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7">

      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-800 via-violet-700 to-indigo-700 p-7 text-white shadow-xl shadow-violet-200/70 md:p-9">
        <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-indigo-300/20 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-violet-100">
              <Sparkles size={14} />
              Project intelligence workspace
            </span>

            <h1 className="mt-5 text-3xl font-extrabold tracking-tight md:text-4xl">
              Meeting Intelligence
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-violet-100 md:text-base">
              Your meetings, responsibilities and decisions,
              organised in one intelligent workspace.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium">
                <AudioLines size={15} />
                {totalMeetings} project meetings
              </span>

              <span className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium">
                <ListChecks size={15} />
                {totalTasks} action items
              </span>
            </div>
          </div>

          <div className="hidden h-28 w-28 items-center justify-center rounded-3xl border border-white/20 bg-white/10 md:flex">
            <TrendingUp size={55} className="text-white" />
          </div>
        </div>
      </section>

      {/* Page heading */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Workspace Overview
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Live information retrieved from your project.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadDashboard()}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-[#D8D5ED] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-300 hover:bg-[#F5F3FF] hover:text-violet-700 disabled:opacity-50"
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
        <div className="rounded-2xl border border-[#D8D5ED] bg-white p-12 text-center shadow-sm">
          <RefreshCw
            size={26}
            className="mx-auto animate-spin text-violet-600"
          />

          <p className="mt-4 text-sm text-slate-600">
            Loading your meeting intelligence...
          </p>
        </div>
      ) : (
        <>
          {/* Statistics */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, icon: Icon, color, description }) => (
              <article
                key={label}
                className="rounded-2xl border border-[#D8D5ED] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-100"
              >
                <div className="flex items-center justify-between">
                  <div className={`rounded-xl p-3 ${color}`}>
                    <Icon size={21} />
                  </div>

                  <ArrowUpRight size={18} className="text-slate-300" />
                </div>

                <p className="mt-5 text-3xl font-extrabold text-slate-900">
                  {value}
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {label}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {description}
                </p>
              </article>
            ))}
          </section>

          {/* Progress panels */}
          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">

            {/* Meeting processing */}
            <article className="rounded-2xl border border-[#D8D5ED] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">
                    Meeting Processing
                  </h3>

                  <p className="mt-1 text-xs text-slate-600">
                    Transcription progress across this project
                  </p>
                </div>

                <div className="rounded-xl bg-[#F0EDFF] p-3 text-violet-700">
                  <AudioLines size={21} />
                </div>
              </div>

              <div className="mt-7 flex items-end justify-between">
                <p className="text-3xl font-extrabold text-slate-900">
                  {processingRate}%
                </p>

                <p className="text-xs text-slate-600">
                  {processedMeetings} of {totalMeetings} processed
                </p>
              </div>

              <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#F0EDFF]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-700"
                  style={{ width: `${processingRate}%` }}
                />
              </div>

              <p className="mt-4 text-xs text-slate-500">
                Based on the processing status reported by the backend.
              </p>
            </article>

            {/* Task completion */}
            <article className="rounded-2xl border border-[#D8D5ED] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">
                    Task Completion
                  </h3>

                  <p className="mt-1 text-xs text-slate-600">
                    Current action item status
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
                  <CircleCheck size={21} />
                </div>
              </div>

              <div className="mt-7 flex items-end justify-between">
                <p className="text-3xl font-extrabold text-slate-900">
                  {taskCompletionRate}%
                </p>

                <p className="text-xs text-slate-600">
                  {completedTasks} of {totalTasks} completed
                </p>
              </div>

              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                  style={{ width: `${taskCompletionRate}%` }}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-amber-600">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  {pendingTasks} pending
                </span>

                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {completedTasks} completed
                </span>
              </div>
            </article>
          </section>

          {/* Recent meetings and deadlines */}
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">

            {/* Recent meetings */}
            <article className="overflow-hidden rounded-2xl border border-[#D8D5ED] bg-white shadow-sm xl:col-span-2">
              <div className="flex items-center justify-between border-b border-[#EAE8F5] px-6 py-5">
                <div>
                  <h3 className="font-bold text-slate-900">
                    Recent Meetings
                  </h3>

                  <p className="mt-1 text-xs text-slate-600">
                    Your latest uploaded recordings
                  </p>
                </div>

                <CalendarDays size={21} className="text-violet-600" />
              </div>

              {meetings.length === 0 ? (
                <div className="p-10 text-center">
                  <CalendarDays
                    size={32}
                    className="mx-auto text-violet-400"
                  />

                  <p className="mt-3 font-semibold text-slate-800">
                    No meetings yet
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Upload your first recording to get started.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#EAE8F5]">
                  {meetings.slice(0, 5).map((meeting) => (
                    <div
                      key={meeting.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition hover:bg-[#F5F3FF]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="rounded-xl bg-[#F0EDFF] p-3 text-violet-700">
                          <AudioLines size={19} />
                        </div>

                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-semibold text-slate-800">
                            {meeting.title}
                          </h4>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            {meeting.original_filename}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">
                          {formatDuration(meeting.duration_seconds)}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-bold capitalize ${getStatusColor(meeting.status)}`}
                        >
                          {meeting.status.replaceAll('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>

            {/* Upcoming tasks */}
            <article className="overflow-hidden rounded-2xl border border-[#D8D5ED] bg-white shadow-sm">
              <div className="border-b border-[#EAE8F5] px-5 py-5">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
                    <Clock3 size={18} />
                  </div>

                  <h3 className="font-bold text-slate-900">
                    Upcoming Deadlines
                  </h3>
                </div>

                <p className="mt-2 text-xs text-slate-600">
                  Pending tasks with recorded due dates
                </p>
              </div>

              {upcomingTasks.length === 0 ? (
                <div className="p-7 text-center">
                  <CheckCircle2
                    size={28}
                    className="mx-auto text-emerald-500"
                  />

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    No upcoming deadlines
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    No pending tasks with due dates were found.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#EAE8F5]">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-800">
                        {task.task_description}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-violet-700">
                          {task.assignee_name || 'Unassigned'}
                        </span>

                        <span className="rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
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
