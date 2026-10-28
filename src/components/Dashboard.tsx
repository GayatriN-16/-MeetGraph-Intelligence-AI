
import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  AudioLines,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileAudio,
  Network,
  Plus,
  Search,
  ShieldAlert,
  Sparkles,
  Users,
  XCircle,
} from 'lucide-react';
import type {
  Meeting,
  Decision,
  ActionItem,
  TimelineConflict,
  ExtractionPipelineStep,
  NavigationTab,
} from '../types';

interface DashboardProps {
  meetings: Meeting[];
  decisions: Decision[];
  actionItems: ActionItem[];
  timelineConflict: TimelineConflict;
  extractionPipeline: ExtractionPipelineStep[];
  onSelectMeeting: (meeting: Meeting) => void;
  onOpenConflictModal: () => void;
  onToggleActionItem: (id: string) => void;
  onSelectTab: (tab: NavigationTab) => void;
  openUploadModal: () => void;
}

const panelClass =
  'rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40';

const sectionTitleClass = 'text-sm font-semibold text-slate-900';

const formatDate = (value: string) => {
  if (!value) return 'Date unavailable';

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
};

const StatusPill: React.FC<{
  children: React.ReactNode;
  tone?: 'green' | 'amber' | 'rose' | 'violet' | 'slate';
}> = ({ children, tone = 'slate' }) => {
  const tones = {
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
    amber: 'bg-amber-50 text-amber-700 ring-amber-600/15',
    rose: 'bg-rose-50 text-rose-700 ring-rose-600/15',
    violet: 'bg-violet-50 text-violet-700 ring-violet-600/15',
    slate: 'bg-slate-100 text-slate-600 ring-slate-500/15',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({
  meetings,
  decisions,
  actionItems,
  timelineConflict,
  extractionPipeline,
  onSelectMeeting,
  onOpenConflictModal,
  onToggleActionItem,
  onSelectTab,
  openUploadModal,
}) => {
  const openTasks = actionItems.filter((item) => !item.completed);

  const verifiedDecisions = decisions.filter(
    (decision) =>
      decision.status === 'Verified' ||
      decision.status === 'User Confirmed',
  );

  const needsReview = decisions.filter(
    (decision) => decision.status === 'Needs Review',
  );

  const completedMeetings = meetings.filter(
    (meeting) => meeting.graphStatus === 'Completed / Indexed',
  );

  const highPriorityTasks = openTasks.filter(
    (item) => item.priority === 'High',
  );

  const recentMeetings = [...meetings]
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      if (Number.isNaN(dateA)) return 1;
      if (Number.isNaN(dateB)) return -1;

      return dateB - dateA;
    })
    .slice(0, 4);

  const hasRecords =
    meetings.length > 0 || decisions.length > 0 || actionItems.length > 0;

  return (
    <div className="mx-auto w-full max-w-[1680px] space-y-7 px-4 py-6 text-slate-800 sm:px-6 lg:px-8">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <StatusPill tone="violet">Workspace overview</StatusPill>
            <StatusPill>Sample workspace</StatusPill>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Your meeting intelligence
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Explore meeting records, decisions, assigned tasks, and
            relationships across your available meeting history.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectTab('ask-ai')}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50"
          >
            <Sparkles className="h-4 w-4 text-violet-600" />
            Ask AI
          </button>

          <button
            type="button"
            onClick={openUploadModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-500/20"
          >
            <Plus className="h-4 w-4" />
            Upload meeting
          </button>
        </div>
      </section>

      <section className="flex items-start gap-3 rounded-xl border border-violet-100 bg-violet-50/70 p-4">
        <Activity className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />
        <div>
          <p className="text-sm font-semibold text-violet-950">
            Demonstration workspace
          </p>
          <p className="mt-1 text-xs leading-5 text-violet-800/80">
            Figures on this page are calculated from the records currently
            loaded in the application. The existing dataset contains sample
            records and does not represent verified production data or live
            processing services.
          </p>
        </div>
      </section>

      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Workspace summary"
      >
        <div className={`${panelClass} p-5`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Meetings available
              </p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                {meetings.length}
              </p>
            </div>
            <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500">
            {completedMeetings.length} marked completed / indexed in sample data
          </div>
        </div>

        <div className={`${panelClass} p-5`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Decisions recorded
              </p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                {decisions.length}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-emerald-700">
              {verifiedDecisions.length} confirmed in current records
            </span>
            {needsReview.length > 0 && (
              <span>· {needsReview.length} need review</span>
            )}
          </div>
        </div>

        <div className={`${panelClass} p-5`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Open action items
              </p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                {openTasks.length}
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
              <Clock3 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500">
            <span className="font-medium text-amber-700">
              {highPriorityTasks.length} high priority
            </span>
            {' · '}
            {actionItems.length} total records
          </div>
        </div>

        <div className={`${panelClass} p-5`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Knowledge graph
              </p>
              <p className="mt-3 text-xl font-bold tracking-tight text-slate-950">
                Preview only
              </p>
            </div>
            <div className="rounded-xl bg-sky-50 p-3 text-sky-700">
              <Network className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500">
            Live database connection not verified
          </div>
        </div>
      </section>

      {!hasRecords && (
        <section className={`${panelClass} px-5 py-12 text-center`}>
          <FileAudio className="mx-auto h-10 w-10 text-violet-400" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Start your meeting history
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Upload a meeting recording to begin adding records to this workspace.
          </p>
          <button
            type="button"
            onClick={openUploadModal}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" />
            Upload first meeting
          </button>
        </section>
      )}

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
        <div className="min-w-0 space-y-6 xl:col-span-7">
          <section className={`${panelClass} overflow-hidden`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className={sectionTitleClass}>Recent meetings</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Latest records currently loaded in this workspace
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSelectTab('meetings')}
                className="inline-flex items-center gap-1 text-sm font-semibold text-violet-700 hover:text-violet-900"
              >
                View library
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {recentMeetings.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <FileAudio className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-700">
                  No meetings available
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Upload a recording to add a meeting to this workspace.
                </p>
                <button
                  type="button"
                  onClick={openUploadModal}
                  className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                >
                  Upload a meeting
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Meeting</th>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Duration</th>
                      <th className="px-5 py-3 text-right font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentMeetings.map((meeting) => (
                      <tr
                        key={meeting.id}
                        className="transition hover:bg-violet-50/30"
                      >
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => onSelectMeeting(meeting)}
                            className="text-left"
                          >
                            <span className="block max-w-[260px] font-semibold text-slate-800 hover:text-violet-700">
                              {meeting.title}
                            </span>
                          </button>
                          <span className="mt-1 block text-xs text-slate-500">
                            {meeting.project}
                          </span>
                          <span className="mt-2 inline-flex">
                            <StatusPill
                              tone={
                                meeting.graphStatus === 'Completed / Indexed'
                                  ? 'green'
                                  : meeting.graphStatus === 'Processing'
                                    ? 'amber'
                                    : 'slate'
                              }
                            >
                              {meeting.graphStatus ?? 'Not indexed'}
                            </StatusPill>
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-600">
                          {formatDate(meeting.date)}
                          <span className="mt-1 block text-slate-400">
                            {meeting.time}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-600">
                          {meeting.duration || 'Not available'}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => onSelectMeeting(meeting)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                          >
                            View details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className={`${panelClass} p-5`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h2 className={sectionTitleClass}>Recent decisions</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Recorded decisions and their source meetings
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectTab('tasks-decisions')}
                className="text-xs font-semibold text-violet-700 hover:text-violet-900"
              >
                All decisions
              </button>
            </div>

            {decisions.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No decisions have been recorded yet.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {decisions.slice(0, 3).map((decision) => {
                  const sourceMeeting = meetings.find(
                    (meeting) => meeting.id === decision.sourceMeetingId,
                  );

                  return (
                    <article
                      key={decision.id}
                      className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-violet-100"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="min-w-0 flex-1 text-sm font-semibold leading-6 text-slate-800">
                          {decision.title}
                        </p>
                        <StatusPill
                          tone={
                            decision.status === 'Verified' ||
                            decision.status === 'User Confirmed'
                              ? 'green'
                              : decision.status === 'Needs Review'
                                ? 'amber'
                                : 'violet'
                          }
                        >
                          {decision.status}
                        </StatusPill>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          {decision.speaker.name}
                        </span>
                        {decision.category && <span>{decision.category}</span>}
                        <span>Confidence: {decision.confidence}%</span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/70 pt-3">
                        <span className="text-xs text-slate-500">
                          Source: {decision.sourceMeetingTitle}
                        </span>
                        <button
                          type="button"
                          disabled={!sourceMeeting}
                          onClick={() => {
                            if (sourceMeeting) onSelectMeeting(sourceMeeting);
                          }}
                          className="text-xs font-semibold text-violet-700 hover:text-violet-900 disabled:cursor-not-allowed disabled:text-slate-400"
                        >
                          View source · {decision.timecode}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className={`${panelClass} overflow-hidden`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className={sectionTitleClass}>Action items</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Change task completion in the current workspace
                </p>
              </div>
              <StatusPill tone={openTasks.length > 0 ? 'amber' : 'green'}>
                {openTasks.length} open
              </StatusPill>
            </div>

            {actionItems.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-500">
                No action items have been recorded yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {actionItems.slice(0, 5).map((item) => (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-start gap-3 px-5 py-4 transition hover:bg-slate-50/80"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => onToggleActionItem(item.id)}
                      aria-label={`Mark ${item.taskDescription} ${
                        item.completed ? 'incomplete' : 'complete'
                      }`}
                      className="mt-1 h-4 w-4 rounded border-slate-300 accent-violet-600 focus:ring-violet-500"
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-sm font-medium leading-5 ${
                          item.completed
                            ? 'text-slate-400 line-through'
                            : 'text-slate-800'
                        }`}
                      >
                        {item.taskDescription}
                      </span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span>{item.assignee.name}</span>
                        <span>Due {item.dueDate || 'Not specified'}</span>
                        <span>{item.sourceMeetingTitle}</span>
                      </span>
                    </span>
                    <StatusPill
                      tone={
                        item.completed
                          ? 'green'
                          : item.priority === 'High'
                            ? 'rose'
                            : item.priority === 'Medium'
                              ? 'amber'
                              : 'slate'
                      }
                    >
                      {item.completed ? 'Completed' : item.priority}
                    </StatusPill>
                  </label>
                ))}
              </div>
            )}

            {actionItems.length > 5 && (
              <div className="border-t border-slate-100 px-5 py-3">
                <button
                  type="button"
                  onClick={() => onSelectTab('tasks-decisions')}
                  className="text-sm font-semibold text-violet-700 hover:text-violet-900"
                >
                  View all {actionItems.length} tasks
                  <ArrowRight className="ml-1 inline h-4 w-4" />
                </button>
              </div>
            )}
          </section>
        </div>

        <aside className="min-w-0 space-y-6 xl:col-span-5">
          <section className="overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-sm shadow-rose-100/40">
            <div className="flex items-start gap-3 bg-rose-50/70 p-5">
              <div className="rounded-xl bg-rose-100 p-2.5 text-rose-700">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Timeline conflict
                  </h2>
                  <StatusPill tone="rose">Sample evidence</StatusPill>
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  This conflict is supplied by the demonstration dataset and
                  has not been independently verified.
                </p>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <h3 className="text-base font-semibold text-slate-900">
                {timelineConflict.title}
              </h3>

              <p className="text-sm leading-6 text-slate-600">
                {timelineConflict.description}
              </p>

              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                {[timelineConflict.node1, timelineConflict.node2].map(
                  (node, index) => (
                    <div
                      key={`${node.meetingTitle}-${index}`}
                      className="flex items-start gap-3"
                    >
                      <span
                        className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          index === 0
                            ? 'bg-violet-100 text-violet-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800">
                          {node.meetingTitle}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {node.date} · {node.speaker}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-slate-600">
                          {node.quote}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-violet-700">
                          Target: {node.targetDate}
                        </p>
                      </div>
                    </div>
                  ),
                )}
                <div className="border-t border-slate-200 pt-3 text-xs text-slate-500">
                  Difference in sample data:{' '}
                  <strong className="text-rose-700">
                    {timelineConflict.deltaDays} days
                  </strong>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenConflictModal}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 transition hover:bg-rose-100"
              >
                Review conflict evidence
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>

          <section className={`${panelClass} p-5`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-violet-50 p-2.5 text-violet-700">
                  <Network className="h-5 w-5" />
                </div>
                <div>
                  <h2 className={sectionTitleClass}>Knowledge graph</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Relationship exploration
                  </p>
                </div>
              </div>
              <StatusPill>Preview</StatusPill>
            </div>

            <div className="mt-5 rounded-xl border border-dashed border-violet-200 bg-gradient-to-br from-violet-50 via-white to-sky-50 p-5">
              <div className="mx-auto flex max-w-xs flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm ring-1 ring-violet-100">
                  <Network className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-800">
                  Explore connected meeting knowledge
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Open the graph explorer to inspect the currently available
                  sample nodes and relationships.
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              A live Neo4j connection has not been verified.
            </div>

            <button
              type="button"
              onClick={() => onSelectTab('knowledge-graph')}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
            >
              Open graph explorer
              <ArrowRight className="h-4 w-4" />
            </button>
          </section>

          <section className={`${panelClass} p-5`}>
            <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
              <div className="rounded-xl bg-sky-50 p-2.5 text-sky-700">
                <AudioLines className="h-5 w-5" />
              </div>
              <div>
                <h2 className={sectionTitleClass}>Processing activity</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Sample pipeline events, not live service telemetry
                </p>
              </div>
            </div>

            {extractionPipeline.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No processing activity is available.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {extractionPipeline.map((step) => {
                  const completed = step.status === 'completed';
                  const queued = step.status === 'queued';

                  return (
                    <div key={step.id} className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          completed
                            ? 'bg-emerald-50 text-emerald-700'
                            : queued
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-sky-50 text-sky-700'
                        }`}
                      >
                        {completed ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : queued ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <Activity className="h-4 w-4" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p className="text-sm font-medium text-slate-800">
                            {step.title}
                          </p>
                          <span className="text-[11px] text-slate-400">
                            {step.timeAgo}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {step.subtitle}
                        </p>
                        <div className="mt-2">
                          <StatusPill
                            tone={
                              completed
                                ? 'green'
                                : queued
                                  ? 'slate'
                                  : 'violet'
                            }
                          >
                            {queued
                              ? 'Queued in sample'
                              : completed
                                ? 'Completed in sample'
                                : 'Processing in sample'}
                          </StatusPill>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-500">
              These events come from local sample data. They do not confirm
              that transcription, speaker diarization, or graph indexing is
              currently running.
            </div>
          </section>

          <section className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-violet-600" />
              <h2 className={sectionTitleClass}>Find meeting intelligence</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Explore meeting records or ask about decisions, responsibilities,
              and the source evidence available in the current dataset.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onSelectTab('meetings')}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:border-violet-200 hover:text-violet-700"
              >
                <CalendarDays className="h-4 w-4" />
                Meetings
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('ask-ai')}
                className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
              >
                <Sparkles className="h-4 w-4" />
                Ask AI
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};
