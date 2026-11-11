
import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
  XCircle,
  Sparkles,
} from 'lucide-react';

import {
  api,
  type ProjectIntelligence,
  type Meeting,
} from '../api/client';

interface AnalyticsProps {
  projectId: number;
}

interface MonthlyActivity {
  label: string;
  count: number;
}

function formatDuration(seconds: number) {
  if (!seconds || seconds <= 0) return '0 min';

  const minutes = Math.round(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${minutes} min`;

  return remainingMinutes
    ? `${hours}h ${remainingMinutes}m`
    : `${hours}h`;
}

function formatDate(value: string | null) {
  if (!value) return 'Date unavailable';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Date unavailable';

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: typeof Activity;
  accent: 'pink' | 'cyan' | 'navy' | 'green';
}) {
  const styles = {
    pink: 'bg-[#F0E9FF] text-[#6810D9]',
    cyan: 'bg-[#EAE6FF] text-[#5135E8]',
    navy: 'bg-[#F0E9FF] text-[#625D7A]',
    green: 'bg-[#DCFCE7] text-[#16A34A]',
  };

  return (
    <article className="rounded-2xl border border-[#E2DDF5] bg-[#FFFFFF] p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(81,53,232,0.08)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#89849F]">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-[#17152B]">
            {value}
          </p>
        </div>

        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${styles[accent]}`}>
          <Icon size={21} />
        </div>
      </div>

      <p className="mt-4 text-xs text-[#89849F]">{description}</p>
    </article>
  );
}

export default function Analytics({ projectId }: AnalyticsProps) {
  const [intelligence, setIntelligence] =
    useState<ProjectIntelligence | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError('');

      const [intelligenceData, meetingData] = await Promise.all([
        api.getIntelligence(projectId),
        api.getMeetings(projectId),
      ]);

      setIntelligence(intelligenceData);
      setMeetings(meetingData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load project analytics.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAnalytics();
  }, [projectId]);

  const metrics = useMemo(() => {
    if (!intelligence) return null;

    const completed = intelligence.completed_action_items;
    const pending = intelligence.pending_action_items;
    const total = intelligence.total_action_items;

    const completionRate = total > 0
      ? Math.round((completed / total) * 100)
      : 0;

    const duration = meetings.reduce(
      (sum, meeting) => sum + (meeting.duration_seconds || 0),
      0,
    );

    const processed = meetings.filter(
      (meeting) => meeting.status === 'transcribed',
    ).length;

    const overdue = intelligence.action_items.filter((item) => {
      if (!item.due_date || item.status === 'completed') return false;

      const due = new Date(item.due_date);
      if (Number.isNaN(due.getTime())) return false;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      due.setHours(0, 0, 0, 0);

      return due < today;
    }).length;

    return {
      completed,
      pending,
      total,
      completionRate,
      duration,
      processed,
      overdue,
    };
  }, [intelligence, meetings]);

  const monthlyActivity = useMemo<MonthlyActivity[]>(() => {
    const now = new Date();

    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - (5 - index),
        1,
      );

      const count = meetings.filter((meeting) => {
        const meetingDate = new Date(
          meeting.meeting_date || meeting.created_at,
        );

        return (
          !Number.isNaN(meetingDate.getTime()) &&
          meetingDate.getMonth() === date.getMonth() &&
          meetingDate.getFullYear() === date.getFullYear()
        );
      }).length;

      return {
        label: date.toLocaleDateString('en-IN', { month: 'short' }),
        count,
      };
    });
  }, [meetings]);

  const maxActivity = Math.max(
    1,
    ...monthlyActivity.map((item) => item.count),
  );

  if (loading) {
    return (
      <div className="flex min-h-[55vh] flex-col items-center justify-center">
        <RefreshCw size={25} className="animate-spin text-[#6810D9]" />
        <p className="mt-4 text-sm text-[#89849F]">
          Loading project analytics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <section className="mx-auto mt-8 max-w-xl rounded-2xl border border-[#E2DDF5] bg-[#FFFFFF] p-7 text-center">
        <AlertCircle size={30} className="mx-auto text-[#DC2626]" />
        <h2 className="mt-3 font-semibold text-[#17152B]">
          Unable to load analytics
        </h2>
        <p className="mt-2 text-sm text-[#625D7A]">{error}</p>
        <button
          type="button"
          onClick={() => void loadAnalytics()}
          className="mt-5 rounded-xl bg-gradient-to-r from-[#7412D8] to-[#5135E8] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
        >
          Try again
        </button>
      </section>
    );
  }

  if (!intelligence || !metrics) return null;

  const recentMeetings = [...meetings]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-7">
      {/* Page introduction */}
      <section className="relative overflow-hidden rounded-2xl border border-[#6810D9]/20 bg-gradient-to-r from-[#7412D8] to-[#5135E8] px-6 py-7 shadow-[0_8px_24px_rgba(81,53,232,0.16)] md:px-8">
        <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
              <Sparkles size={13} />
              Workspace insights
            </span>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
              Project Analytics
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85">
              A data-driven overview of your meeting activity and project progress.
            </p>
          </div>

          <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white sm:flex">
            <TrendingUp size={30} strokeWidth={1.7} />
          </div>
        </div>
      </section>

      {/* Refresh action */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => void loadAnalytics()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2DDF5] bg-[#FFFFFF] px-4 py-2.5 text-sm font-semibold text-[#625D7A] transition hover:border-[#5135E8] hover:bg-[#F0E9FF] hover:text-[#6810D9]"
        >
          <RefreshCw size={16} />
          Refresh data
        </button>
      </div>

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total meetings"
          value={intelligence.total_meetings}
          description={`${metrics.processed} successfully transcribed`}
          icon={CalendarDays}
          accent="pink"
        />
        <StatCard
          label="Recording duration"
          value={formatDuration(metrics.duration)}
          description="Combined duration of available recordings"
          icon={Clock3}
          accent="cyan"
        />
        <StatCard
          label="Action items"
          value={metrics.total}
          description={`${metrics.pending} currently pending`}
          icon={Target}
          accent="navy"
        />
        <StatCard
          label="Decisions recorded"
          value={intelligence.total_decisions}
          description="Decisions extracted from meetings"
          icon={FileText}
          accent="green"
        />
      </section>

      {/* Activity and task completion */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <article className="rounded-2xl border border-[#E2DDF5] bg-[#FFFFFF] p-5 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-[#17152B]">
                Meeting activity
              </h2>
              <p className="mt-1 text-xs text-[#89849F]">
                Meetings created over the last six calendar months
              </p>
            </div>
            <div className="rounded-lg bg-[#F0E9FF] p-2.5 text-[#6810D9]">
              <Activity size={20} />
            </div>
          </div>

          <div className="mt-7 flex h-48 items-end gap-3 border-b border-[#E2DDF5] px-1">
            {monthlyActivity.map((item) => (
              <div
                key={item.label}
                className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="text-xs font-semibold text-[#625D7A]">
                  {item.count}
                </span>
                <div
                  className="w-full max-w-12 rounded-t-lg bg-gradient-to-t from-[#6810D9] to-[#5135E8] transition-all"
                  style={{
                    height: `${Math.max(
                      item.count > 0 ? 8 : 2,
                      (item.count / maxActivity) * 130,
                    )}px`,
                  }}
                  title={`${item.count} meetings`}
                />
                <span className="text-xs text-[#89849F]">{item.label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-[#E2DDF5] bg-[#FFFFFF] p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-[#F0E9FF] p-2 text-[#6810D9]">
              <Target size={19} />
            </div>
            <h2 className="font-semibold text-[#17152B]">
              Task completion
            </h2>
          </div>

          <div className="mt-7 flex items-center justify-center">
            <div
              className="relative flex h-40 w-40 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#6810D9 ${metrics.completionRate}%, #E2DDF5 ${metrics.completionRate}% 100%)`,
              }}
            >
              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-[#FFFFFF]">
                <span className="text-3xl font-bold text-[#17152B]">
                  {metrics.completionRate}%
                </span>
                <span className="text-xs text-[#89849F]">Completed</span>
              </div>
            </div>
          </div>

          <div className="mt-7 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-[#625D7A]">
                <CheckCircle2 size={16} className="text-[#16A34A]" />
                Completed
              </span>
              <strong className="text-[#17152B]">{metrics.completed}</strong>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-[#625D7A]">
                <Clock3 size={16} className="text-[#D97706]" />
                Pending
              </span>
              <strong className="text-[#17152B]">{metrics.pending}</strong>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-[#625D7A]">
                <XCircle size={16} className="text-[#DC2626]" />
                Overdue
              </span>
              <strong className="text-[#17152B]">{metrics.overdue}</strong>
            </div>
          </div>
        </article>
      </section>

      {/* Processing and intelligence overview */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-[#E2DDF5] bg-[#FFFFFF] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#17152B]">
              Meeting processing
            </h2>
            <div className="rounded-lg bg-[#F0E9FF] p-2 text-[#6810D9]">
              <TrendingUp size={19} />
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-[#625D7A]">Transcribed meetings</span>
                <strong className="text-[#17152B]">
                  {metrics.processed} / {meetings.length}
                </strong>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#E2DDF5]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#7412D8] to-[#5135E8]"
                  style={{
                    width: `${meetings.length
                      ? (metrics.processed / meetings.length) * 100
                      : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#F0E9FF] p-4">
                <p className="text-xs text-[#5135E8]">Processed</p>
                <p className="mt-2 text-2xl font-bold text-[#17152B]">
                  {metrics.processed}
                </p>
              </div>
              <div className="rounded-xl bg-[#F8F5FF] p-4">
                <p className="text-xs text-[#625D7A]">Other statuses</p>
                <p className="mt-2 text-2xl font-bold text-[#17152B]">
                  {Math.max(0, meetings.length - metrics.processed)}
                </p>
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-[#E2DDF5] bg-[#FFFFFF] p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-[#F0E9FF] p-2 text-[#6810D9]">
              <Users size={19} />
            </div>
            <h2 className="font-semibold text-[#17152B]">
              Intelligence overview
            </h2>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#E2DDF5] bg-[#F8F5FF]/50 p-4">
              <p className="text-xs text-[#89849F]">Processed meetings</p>
              <p className="mt-2 text-2xl font-bold text-[#17152B]">
                {intelligence.processed_meetings}
              </p>
            </div>
            <div className="rounded-xl border border-[#E2DDF5] bg-[#F8F5FF]/50 p-4">
              <p className="text-xs text-[#89849F]">Total decisions</p>
              <p className="mt-2 text-2xl font-bold text-[#17152B]">
                {intelligence.total_decisions}
              </p>
            </div>
            <div className="rounded-xl border border-[#E2DDF5] bg-[#F8F5FF]/50 p-4">
              <p className="text-xs text-[#89849F]">Total action items</p>
              <p className="mt-2 text-2xl font-bold text-[#17152B]">
                {metrics.total}
              </p>
            </div>
            <div className="rounded-xl border border-[#E2DDF5] bg-[#F8F5FF]/50 p-4">
              <p className="text-xs text-[#89849F]">Completion rate</p>
              <p className="mt-2 text-2xl font-bold text-[#17152B]">
                {metrics.completionRate}%
              </p>
            </div>
          </div>
        </article>
      </section>

      {/* Recent meetings */}
      <section className="rounded-2xl border border-[#E2DDF5] bg-[#FFFFFF] p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-[#17152B]">Recent meetings</h2>
            <p className="mt-1 text-xs text-[#89849F]">
              Latest recordings in this workspace
            </p>
          </div>
          <div className="rounded-lg bg-[#F0E9FF] p-2 text-[#6810D9]">
            <CalendarDays size={19} />
          </div>
        </div>

        {recentMeetings.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#89849F]">
            No meetings available yet.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-[#E2DDF5]">
            {recentMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="flex flex-col justify-between gap-3 py-4 transition-colors hover:bg-[#F8F5FF] sm:flex-row sm:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#17152B]">
                    {meeting.title}
                  </p>
                  <p className="mt-1 text-xs text-[#89849F]">
                    {formatDate(meeting.meeting_date || meeting.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#89849F]">
                    {formatDuration(meeting.duration_seconds || 0)}
                  </span>
                  <span className="rounded-full border border-[#E2DDF5] bg-[#F0E9FF] px-3 py-1 text-xs font-semibold capitalize text-[#5135E8]">
                    {meeting.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
