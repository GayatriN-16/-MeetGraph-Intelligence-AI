import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  ListChecks,
  RefreshCw,
  UserRound,
  Sparkles,
  Target,
  CircleDashed,
} from 'lucide-react';

import {
  api,
  type ActionItem,
  type Decision,
  type ProjectIntelligence,
} from '../api/client';

interface TasksAndDecisionsProps {
  projectId: number;
}

type TaskFilter = 'all' | 'open' | 'completed';

function formatDate(value: string | null) {
  if (!value) return 'No deadline specified';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Invalid date';

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTimestamp(seconds: number | null) {
  if (seconds == null) return null;

  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function getAssignee(item: ActionItem) {
  return item.assignee_name?.trim() || 'Assignee not identified';
}

function isCompleted(status: string) {
  return ['completed', 'complete', 'done'].includes(status.toLowerCase());
}

function getStatusStyle(status: string) {
  const normalized = status.toLowerCase();

  if (isCompleted(normalized)) {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  }

  if (normalized.includes('progress')) {
    return 'bg-[#DDF3F3] text-[#187D87] ring-[#C6E5E6]';
  }

  return 'bg-amber-50 text-amber-700 ring-amber-200';
}

export default function TasksAndDecisions({
  projectId,
}: TasksAndDecisionsProps) {
  const [data, setData] = useState<ProjectIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<TaskFilter>('all');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const result = await api.getIntelligence(projectId);
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load tasks and decisions.',
      );
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const meetingTitles = useMemo(() => {
    const titles = new Map<number, string>();

    data?.meetings.forEach((meeting) => {
      titles.set(meeting.meeting_id, meeting.title);
    });

    return titles;
  }, [data]);

  const tasks = data?.action_items ?? [];

  const filteredTasks = useMemo(() => {
    if (filter === 'open') {
      return tasks.filter((task) => !isCompleted(task.status));
    }

    if (filter === 'completed') {
      return tasks.filter((task) => isCompleted(task.status));
    }

    return tasks;
  }, [tasks, filter]);

  const pendingCount = tasks.filter(
    (item) => !isCompleted(item.status),
  ).length;

  const completedCount = tasks.filter(
    (item) => isCompleted(item.status),
  ).length;

  const completionRate =
    tasks.length > 0
      ? Math.round((completedCount / tasks.length) * 100)
      : 0;

  const assignedCount = tasks.filter(
    (item) => Boolean(item.assignee_name?.trim()),
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <RefreshCw size={28} className="animate-spin text-[#269BA5]" />
        <p className="mt-4 text-sm text-[#55505A]">
          Loading project tasks and decisions...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      {/* Page heading */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#269BA5]">
            <Sparkles size={16} />
            Project Workspace
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#187D87]">
            Tasks & Decisions
          </h1>

          <p className="mt-2 text-sm text-[#55505A]">
            Track responsibilities, deadlines and decisions from your meetings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadData()}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-[#C6E5E6] bg-white px-4 py-2.5 text-sm font-semibold text-[#55505A] shadow-sm transition hover:border-[#269BA5] hover:bg-[#F3FAFA] disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Unable to load project intelligence</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}

      {data && (
        <>
          {/* Hero banner */}
          <section className="relative overflow-hidden rounded-3xl border border-[#C6E5E6] bg-[#DDF3F3] p-7 text-[#187D87] shadow-sm md:p-9">
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#C6E5E6] bg-white px-3 py-1.5 text-xs font-medium text-[#55505A]">
                  <Target size={14} className="text-[#269BA5]" />
                  Project execution
                </span>

                <h2 className="mt-5 text-2xl font-bold md:text-3xl">
                  Turn meeting discussions into action.
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#55505A]">
                  Follow assigned responsibilities, review recorded deadlines
                  and trace tasks back to their meeting evidence.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#C6E5E6] bg-white px-3 py-2 text-xs text-[#187D87]">
                    {tasks.length} action items
                  </span>
                  <span className="rounded-full border border-[#C6E5E6] bg-white px-3 py-2 text-xs text-[#187D87]">
                    {assignedCount} with named assignees
                  </span>
                </div>
              </div>

              <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-[#C6E5E6] bg-white text-[#269BA5] shadow-sm">
                <ListChecks size={46} strokeWidth={1.5} />
              </div>
            </div>

            <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-[#269BA5]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-white/60 blur-3xl" />
          </section>

          {/* Statistics */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total action items"
              value={tasks.length}
              icon={ListChecks}
              color="gold"
              caption="Extracted from meetings"
            />
            <StatCard
              label="Pending tasks"
              value={pendingCount}
              icon={Clock3}
              color="amber"
              caption="Require attention"
            />
            <StatCard
              label="Completed tasks"
              value={completedCount}
              icon={CheckCircle2}
              color="emerald"
              caption="Marked as completed"
            />
            <StatCard
              label="Recorded decisions"
              value={data.decisions.length}
              icon={FileText}
              color="blue"
              caption="Extracted from discussions"
            />
          </section>

          {/* Progress panels */}
          <section className="grid gap-4 lg:grid-cols-2">
            <ProgressPanel
              title="Task completion"
              description="Completion status of extracted action items"
              percentage={completionRate}
              detail={`${completedCount} of ${tasks.length} completed`}
              icon={CheckCircle2}
              color="gold"
            />

            <div className="rounded-2xl border border-[#C6E5E6] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-[#187D87]">
                    Task distribution
                  </h3>
                  <p className="mt-1 text-xs text-[#55505A]">
                    Current action item status
                  </p>
                </div>

                <div className="rounded-xl bg-[#DDF3F3] p-2.5 text-[#269BA5]">
                  <CircleDashed size={20} />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <DistributionRow
                  label="Pending"
                  count={pendingCount}
                  total={tasks.length}
                  color="bg-[#269BA5]"
                />
                <DistributionRow
                  label="Completed"
                  count={completedCount}
                  total={tasks.length}
                  color="bg-emerald-500"
                />
              </div>
            </div>
          </section>

          {/* Action items */}
          <section className="overflow-hidden rounded-2xl border border-[#C6E5E6] bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#C6E5E6] px-6 py-5">
              <div>
                <h2 className="font-bold text-[#187D87]">Action Items</h2>
                <p className="mt-1 text-xs text-[#55505A]">
                  Tasks identified from project meeting recordings
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ['all', 'All'],
                    ['open', 'Pending'],
                    ['completed', 'Completed'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                      filter === value
                        ? 'bg-[#269BA5] text-white shadow-sm shadow-[#269BA5]/20'
                        : 'border border-[#C6E5E6] bg-white text-[#55505A] hover:border-[#269BA5] hover:bg-[#F3FAFA]'
                    }`}
                  >
                    {label}
                    {value === 'all'
                      ? ` (${tasks.length})`
                      : value === 'open'
                        ? ` (${pendingCount})`
                        : ` (${completedCount})`}
                  </button>
                ))}
              </div>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DDF3F3] text-[#269BA5]">
                  <ListChecks size={27} />
                </div>
                <h3 className="mt-4 font-semibold text-[#187D87]">
                  No tasks found
                </h3>
                <p className="mt-2 text-sm text-[#55505A]">
                  {filter === 'all'
                    ? 'No action items have been extracted yet.'
                    : `There are no ${filter} tasks.`}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 p-5 md:p-6">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    meetingTitle={
                      meetingTitles.get(task.meeting_id) ??
                      `Meeting ${task.meeting_id}`
                    }
                  />
                ))}
              </div>
            )}
          </section>

          {/* Decisions */}
          <section className="overflow-hidden rounded-2xl border border-[#C6E5E6] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#C6E5E6] px-6 py-5">
              <div>
                <h2 className="font-bold text-[#187D87]">Project Decisions</h2>
                <p className="mt-1 text-xs text-[#55505A]">
                  Decisions extracted from meeting discussions
                </p>
              </div>

              <div className="rounded-xl bg-[#DDF3F3] p-2.5 text-[#269BA5]">
                <FileText size={20} />
              </div>
            </div>

            {data.decisions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DDF3F3] text-[#269BA5]">
                  <FileText size={27} />
                </div>

                <h3 className="mt-4 font-semibold text-[#187D87]">
                  No decisions recorded yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-[#55505A]">
                  No decisions have been extracted from the available meeting
                  recordings.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 p-5 md:p-6">
                {data.decisions.map((decision) => (
                  <DecisionCard
                    key={decision.id}
                    decision={decision}
                    meetingTitle={
                      meetingTitles.get(decision.meeting_id) ??
                      `Meeting ${decision.meeting_id}`
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  caption,
}: {
  label: string;
  value: number;
  icon: typeof ListChecks;
  color: 'gold' | 'amber' | 'emerald' | 'blue';
  caption: string;
}) {
  const styles = {
    gold: 'bg-[#DDF3F3] text-[#269BA5] ring-1 ring-inset ring-[#C6E5E6]',
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-[#DDF3F3] text-[#187D87] ring-1 ring-inset ring-[#C6E5E6]',
  };

  return (
    <div className="rounded-2xl border border-[#C6E5E6] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#55505A]">{label}</p>
        <div className={`rounded-xl p-2.5 ${styles[color]}`}>
          <Icon size={20} />
        </div>
      </div>

      <p className="mt-5 text-3xl font-bold text-[#187D87]">{value}</p>
      <p className="mt-1 text-xs text-[#89818B]">{caption}</p>
    </div>
  );
}

function ProgressPanel({
  title,
  description,
  percentage,
  detail,
  icon: Icon,
  color,
}: {
  title: string;
  description: string;
  percentage: number;
  detail: string;
  icon: typeof CheckCircle2;
  color: 'gold';
}) {
  const barColor = 'bg-gradient-to-r from-[#187D87] to-[#269BA5]';

  return (
    <div className="rounded-2xl border border-[#C6E5E6] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-[#187D87]">{title}</h3>
          <p className="mt-1 text-xs text-[#55505A]">{description}</p>
        </div>

        <div className="rounded-xl bg-[#DDF3F3] p-2.5 text-[#269BA5]">
          <Icon size={20} />
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between gap-3">
        <p className="text-3xl font-bold text-[#187D87]">{percentage}%</p>
        <p className="text-xs text-[#55505A]">{detail}</p>
      </div>

      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#C6E5E6]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="mt-3 text-xs text-[#89818B]">
        Based on action item statuses returned by the backend.
      </p>
    </div>
  );
}

function DistributionRow({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-[#55505A]">{label}</span>
        <span className="font-semibold text-[#187D87]">{count}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[#C6E5E6]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function EvidencePanel({
  evidence,
  start,
  end,
}: {
  evidence: string;
  start: string | null;
  end: string | null;
}) {
  return (
    <div className="mt-4 rounded-xl border border-[#C6E5E6] bg-[#DDF3F3]/60 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#269BA5]">
        Meeting evidence
      </p>

      <p className="mt-2 text-sm leading-6 text-[#55505A]">
        "{evidence}"
      </p>

      {(start || end) && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-[#55505A]">
          <Clock3 size={13} />
          {start ?? 'Start unavailable'} - {end ?? 'End unavailable'}
        </p>
      )}
    </div>
  );
}

function TaskCard({
  task,
  meetingTitle,
}: {
  task: ActionItem;
  meetingTitle: string;
}) {
  const completed = isCompleted(task.status);
  const start = formatTimestamp(task.start_seconds);
  const end = formatTimestamp(task.end_seconds);

  return (
    <article className="rounded-2xl border border-[#C6E5E6] p-5 transition hover:border-[#269BA5] hover:shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              completed
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-[#DDF3F3] text-[#269BA5]'
            }`}
          >
            {completed ? (
              <CheckCircle2 size={20} />
            ) : (
              <ListChecks size={20} />
            )}
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-bold leading-6 text-[#187D87]">
              {task.task_description}
            </h3>
            <p className="mt-1 text-xs text-[#55505A]">
              {meetingTitle} · Meeting ID: {task.meeting_id}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ring-1 ring-inset ${getStatusStyle(task.status)}`}
        >
          {task.status.replaceAll('_', ' ')}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetadataItem
          icon={UserRound}
          label="Assignee"
          value={getAssignee(task)}
        />

        <MetadataItem
          icon={CalendarDays}
          label="Deadline"
          value={formatDate(task.due_date)}
        />

        <MetadataItem
          icon={Clock3}
          label="Estimated duration"
          value={
            task.estimated_duration_minutes != null
              ? `${task.estimated_duration_minutes} minutes`
              : 'Not specified'
          }
        />
      </div>

      {task.evidence_text && (
        <EvidencePanel
          evidence={task.evidence_text}
          start={start}
          end={end}
        />
      )}
    </article>
  );
}

function DecisionCard({
  decision,
  meetingTitle,
}: {
  decision: Decision;
  meetingTitle: string;
}) {
  const start = formatTimestamp(decision.start_seconds);
  const end = formatTimestamp(decision.end_seconds);

  return (
    <article className="rounded-2xl border border-[#C6E5E6] p-5 transition hover:border-[#269BA5]/50 hover:shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DDF3F3] text-[#269BA5]">
            <FileText size={20} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#187D87]">
              {decision.title}
            </h3>
            <p className="mt-1 text-xs text-[#55505A]">
              {meetingTitle} · Meeting ID: {decision.meeting_id}
            </p>
          </div>
        </div>

        <span className="rounded-full bg-[#DDF3F3] px-3 py-1.5 text-xs font-semibold capitalize text-[#269BA5] ring-1 ring-inset ring-[#C6E5E6]">
          {decision.status.replaceAll('_', ' ')}
        </span>
      </div>

      {decision.description && (
        <p className="mt-4 text-sm leading-6 text-[#55505A]">
          {decision.description}
        </p>
      )}

      {decision.evidence_text && (
        <EvidencePanel
          evidence={decision.evidence_text}
          start={start}
          end={end}
        />
      )}
    </article>
  );
}

function MetadataItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-[#F3FAFA] p-3">
      <Icon size={16} className="mt-0.5 shrink-0 text-[#269BA5]" />
      <div className="min-w-0">
        <p className="text-[11px] text-[#89818B]">{label}</p>
        <p className="mt-1 break-words text-xs font-semibold text-[#55505A]">
          {value}
        </p>
      </div>
    </div>
  );
}