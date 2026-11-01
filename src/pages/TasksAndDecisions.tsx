
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
  if (item.assignee_name?.trim()) {
    return item.assignee_name;
  }

  return 'Assignee not identified';
}

function isCompleted(status: string) {
  return ['completed', 'complete', 'done'].includes(
    status.toLowerCase(),
  );
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

  const filteredTasks = useMemo(() => {
    const tasks = data?.action_items ?? [];

    if (filter === 'open') {
      return tasks.filter((task) => !isCompleted(task.status));
    }

    if (filter === 'completed') {
      return tasks.filter((task) => isCompleted(task.status));
    }

    return tasks;
  }, [data, filter]);

  const pendingCount =
    data?.action_items.filter((item) => !isCompleted(item.status)).length ?? 0;

  const completedCount =
    data?.action_items.filter((item) => isCompleted(item.status)).length ?? 0;

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#A47A32]">
            Project Workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#3F3022]">
            Tasks & Decisions
          </h1>
          <p className="mt-2 text-sm text-[#766654]">
            Track responsibilities, deadlines and decisions extracted from
            your meeting recordings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadData()}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-[#D9CBB7] bg-[#FFFDF9] px-4 py-2.5 text-sm font-semibold text-[#3F3022] shadow-sm transition hover:bg-[#EFE2C9] disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Unable to load project intelligence</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-[#DED3C3] bg-[#FFFDF9] p-12 text-center">
          <RefreshCw
            size={25}
            className="mx-auto animate-spin text-[#A47A32]"
          />
          <p className="mt-4 text-sm text-[#766654]">
            Loading project tasks and decisions...
          </p>
        </div>
      ) : data ? (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Total action items"
              value={data.total_action_items}
              icon={ListChecks}
            />
            <StatCard
              label="Pending tasks"
              value={pendingCount}
              icon={Clock3}
            />
            <StatCard
              label="Completed tasks"
              value={completedCount}
              icon={CheckCircle2}
            />
          </section>

          <section className="overflow-hidden rounded-xl border border-[#D9CBB7] bg-[#FFFDF9] shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5DACA] px-6 py-5">
              <div>
                <h2 className="font-bold text-[#3F3022]">
                  Action Items
                </h2>
                <p className="mt-1 text-xs text-[#766654]">
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
                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      filter === value
                        ? 'bg-[#4A3B2A] text-white'
                        : 'border border-[#D9CBB7] bg-white text-[#6F5B45] hover:bg-[#F3EEE5]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="p-12 text-center">
                <ListChecks
                  size={32}
                  className="mx-auto text-[#A47A32]"
                />
                <h3 className="mt-3 font-semibold text-[#3F3022]">
                  No tasks found
                </h3>
                <p className="mt-1 text-sm text-[#766654]">
                  {filter === 'all'
                    ? 'No action items have been extracted yet.'
                    : `There are no ${filter} tasks.`}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#EAE1D4]">
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

          <section className="overflow-hidden rounded-xl border border-[#D9CBB7] bg-[#FFFDF9] shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E5DACA] px-6 py-5">
              <div>
                <h2 className="font-bold text-[#3F3022]">
                  Project Decisions
                </h2>
                <p className="mt-1 text-xs text-[#766654]">
                  Decisions extracted from meeting discussions
                </p>
              </div>
              <FileText size={20} className="text-[#A47A32]" />
            </div>

            {data.decisions.length === 0 ? (
              <div className="p-10 text-center">
                <FileText
                  size={30}
                  className="mx-auto text-[#A47A32]"
                />
                <h3 className="mt-3 font-semibold text-[#3F3022]">
                  No decisions recorded yet
                </h3>
                <p className="mt-1 text-sm text-[#766654]">
                  No decisions have been extracted from the available
                  meeting recordings.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#EAE1D4]">
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
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof ListChecks;
}) {
  return (
    <div className="rounded-xl border border-[#D9CBB7] bg-[#FFFDF9] p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#705D48]">{label}</p>
        <div className="rounded-lg bg-[#EFE2C9] p-2.5">
          <Icon size={19} className="text-[#966B25]" />
        </div>
      </div>
      <p className="mt-5 text-3xl font-bold text-[#3F3022]">{value}</p>
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
    <article className="px-6 py-5 transition hover:bg-[#F8F3EA]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold leading-6 text-[#3F3022]">
            {task.task_description}
          </h3>
          <p className="mt-1 text-xs text-[#806C55]">
            {meetingTitle} · Meeting ID: {task.meeting_id}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
            completed
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-[#EFE2C9] text-[#765522]'
          }`}
        >
          {task.status.replaceAll('_', ' ')}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-xs text-[#705D48]">
        <span className="flex items-center gap-2">
          <UserRound size={15} className="text-[#A47A32]" />
          {getAssignee(task)}
        </span>

        <span className="flex items-center gap-2">
          <CalendarDays size={15} className="text-[#A47A32]" />
          {formatDate(task.due_date)}
        </span>

        {task.estimated_duration_minutes != null && (
          <span className="flex items-center gap-2">
            <Clock3 size={15} className="text-[#A47A32]" />
            {task.estimated_duration_minutes} minutes estimated
          </span>
        )}
      </div>

      {task.evidence_text && (
        <div className="mt-4 rounded-lg border border-[#E5DACA] bg-[#F8F3EA] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#966B25]">
            Meeting evidence
          </p>
          <p className="mt-2 text-sm leading-6 text-[#51412F]">
            "{task.evidence_text}"
          </p>

          {(start || end) && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-[#806C55]">
              <Clock3 size={13} />
              {start ?? 'Start unavailable'} - {end ?? 'End unavailable'}
            </p>
          )}
        </div>
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
    <article className="px-6 py-5 hover:bg-[#F8F3EA]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-[#3F3022]">
          {decision.title}
        </h3>
        <span className="rounded-full bg-[#EFE2C9] px-3 py-1 text-xs font-semibold capitalize text-[#765522]">
          {decision.status}
        </span>
      </div>

      <p className="mt-1 text-xs text-[#806C55]">
        {meetingTitle} · Meeting ID: {decision.meeting_id}
      </p>

      {decision.description && (
        <p className="mt-3 text-sm leading-6 text-[#51412F]">
          {decision.description}
        </p>
      )}

      {decision.evidence_text && (
        <div className="mt-4 rounded-lg border border-[#E5DACA] bg-[#F8F3EA] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#966B25]">
            Meeting evidence
          </p>
          <p className="mt-2 text-sm leading-6 text-[#51412F]">
            "{decision.evidence_text}"
          </p>
          {(start || end) && (
            <p className="mt-2 text-xs text-[#806C55]">
              {start ?? 'Start unavailable'} - {end ?? 'End unavailable'}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
