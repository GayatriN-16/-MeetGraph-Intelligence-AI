import { useCallback, useEffect, useState } from 'react';

import {
  BrainCircuit,
  Send,
  LoaderCircle,
  MessageSquare,
  Clock3,
  FileText,
  User,
  Sparkles,
  RefreshCw,
  Bot,
  CheckCircle2,
  Lightbulb,
  Plus,
  AudioLines,
  ShieldCheck,
  ListChecks,
  CalendarDays,
  Users,
  Download,
} from 'lucide-react';

import {
  api,
  type Meeting,
  type QuestionResponse,
} from '../api/client';

interface AskAIProps {
  projectId: number;
}

const suggestions = [
  {
    title: 'Meeting agenda',
    question: 'What was the main agenda of this meeting?',
    icon: CalendarDays,
  },
  {
    title: 'Topics discussed',
    question: 'What topics were discussed in this meeting?',
    icon: MessageSquare,
  },
  {
    title: 'Meeting summary',
    question: 'What happened in this meeting?',
    icon: FileText,
  },
  {
    title: 'Participants',
    question: 'Who participated in this meeting?',
    icon: Users,
  },
  {
    title: 'Task assignments',
    question: 'Which tasks were assigned and to whom?',
    icon: User,
  },
  {
    title: 'Decisions',
    question: 'What decisions were made during the meeting?',
    icon: CheckCircle2,
  },
  {
    title: 'Deadlines',
    question: 'What deadlines were discussed?',
    icon: Clock3,
  },
  {
    title: 'Pending work',
    question: 'What work is still remaining in the project?',
    icon: ListChecks,
  },
];

const comparisonSuggestions = [
  {
    title: 'Topics discussed in both',
    question:
      'What topics were discussed in both Meeting 1 and Meeting 2?',
    icon: MessageSquare,
  },
  {
    title: 'Topics only in Meeting 1',
    question:
      'What topics were discussed only in Meeting 1 and not in Meeting 2?',
    icon: FileText,
  },
  {
    title: 'Topics only in Meeting 2',
    question:
      'What topics were discussed only in Meeting 2 and not in Meeting 1?',
    icon: FileText,
  },
  {
    title: 'Compare both meetings',
    question:
      'Compare the topics discussed in Meeting 1 and Meeting 2.',
    icon: CheckCircle2,
  },
];

function formatTime(seconds: number | null) {
  if (seconds == null) return null;

  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const remaining = safe % 60;

  return `${minutes}:${String(remaining).padStart(2, '0')}`;
}

/* Download a plain text file */
function downloadTextFile(content: string, filename: string) {
  const blob = new Blob([content], {
    type: 'text/plain;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

/* Escape HTML before adding transcript content to the PDF report */
function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return entities[character];
  });
}

/* Download the current AI answer as a printable PDF report */
function downloadAnswerAsPDF(response: QuestionResponse) {
  const evidenceHtml = response.sources.length
    ? response.sources
        .map((source, index) => {
          const start = formatTime(source.start_seconds) ?? 'Unknown';
          const end = formatTime(source.end_seconds);

          return `
            <section class="source">
              <h3>Evidence ${index + 1}: ${escapeHtml(source.meeting_title)}</h3>

              <p>${escapeHtml(source.evidence_text)}</p>

              <p class="meta">
                Meeting ${source.meeting_id}
                ${
                  source.speaker
                    ? ` | Speaker: ${escapeHtml(source.speaker)}`
                    : ''
                }
                | Timestamp: ${start}${end ? ` - ${end}` : ''}
              </p>
            </section>
          `;
        })
        .join('')
    : '<p>No supporting transcript evidence was returned.</p>';

  const report = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <title>MeetGraph AI Answer</title>

        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #172554;
            max-width: 850px;
            margin: 0 auto;
            padding: 36px;
            line-height: 1.65;
          }

          h1 {
            color: #5b21b6;
            margin-bottom: 4px;
          }

          h2 {
            color: #4c1d95;
            margin: 28px 0 10px;
          }

          h3 {
            color: #312e81;
            margin: 0 0 8px;
            font-size: 15px;
          }

          .subtitle,
          .meta,
          .footer {
            color: #64748b;
            font-size: 12px;
          }

          .content,
          .source {
            border: 1px solid #d8d5ed;
            border-radius: 10px;
            padding: 16px;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
          }

          .source {
            margin-top: 12px;
          }

          .footer {
            border-top: 1px solid #d8d5ed;
            margin-top: 32px;
            padding-top: 12px;
          }

          @media print {
            body {
              padding: 0;
            }

            .content,
            .source {
              break-inside: avoid;
            }
          }
        </style>
      </head>

      <body>
        <h1>MeetGraph AI</h1>

        <p class="subtitle">Meeting Intelligence Report</p>

        <h2>Your question</h2>

        <div class="content">
          ${escapeHtml(response.question)}
        </div>

        <h2>AI answer</h2>

        <div class="content">
          ${escapeHtml(response.answer)}
        </div>

        <h2>Supporting evidence (${response.sources.length})</h2>

        ${evidenceHtml}

        <div class="footer">
          Generated by MeetGraph AI on
          ${escapeHtml(new Date().toLocaleString())}
        </div>

        <script>
          window.addEventListener('load', () => {
            window.setTimeout(() => window.print(), 250);
          });
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    alert(
      'Please allow pop-ups for this site, then try downloading the PDF again.',
    );
    return;
  }

  printWindow.document.open();
  printWindow.document.write(report);
  printWindow.document.close();
}

/* Download the current AI answer as a TXT file */
function downloadAnswerAsTXT(response: QuestionResponse) {
  const evidenceText = response.sources.length
    ? response.sources
        .map((source, index) => {
          const start = formatTime(source.start_seconds) ?? 'Unknown';
          const end = formatTime(source.end_seconds);

          return [
            `Evidence ${index + 1}`,
            `Meeting: ${source.meeting_title}`,
            `Meeting ID: ${source.meeting_id}`,
            `Source type: ${source.source_type}`,
            `Speaker: ${source.speaker || 'Unknown'}`,
            `Timestamp: ${start}${end ? ` - ${end}` : ''}`,
            '',
            source.evidence_text,
          ].join('\n');
        })
        .join('\n\n----------------------------------------\n\n')
    : 'No supporting transcript evidence was returned.';

  const content = [
    'MEETGRAPH AI',
    'MEETING INTELLIGENCE REPORT',
    `Generated: ${new Date().toLocaleString()}`,
    '',
    'YOUR QUESTION',
    response.question,
    '',
    'AI ANSWER',
    response.answer,
    '',
    `SUPPORTING EVIDENCE (${response.sources.length})`,
    evidenceText,
    '',
    '----------------------------------------',
    'Generated by MeetGraph AI',
  ].join('\n');

  downloadTextFile(content, 'MeetGraph_AI_Answer.txt');
}

export default function AskAI({ projectId }: AskAIProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState('all');

  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<QuestionResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingMeetings, setLoadingMeetings] = useState(true);

  const [error, setError] = useState('');
  const [meetingError, setMeetingError] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  const loadMeetings = useCallback(async () => {
    try {
      setLoadingMeetings(true);
      setMeetingError('');

      const data = await api.getMeetings(projectId);
      setMeetings(data);
    } catch (err) {
      setMeetingError(
        err instanceof Error ? err.message : 'Unable to load meetings.',
      );
    } finally {
      setLoadingMeetings(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadMeetings();
  }, [loadMeetings]);

  async function submitQuestion(value = question) {
    const trimmed = value.trim();

    if (trimmed.length < 3 || loading || loadingMeetings) return;

    try {
      setLoading(true);
      setError('');
      setQuestion(trimmed);
      setResponse(null);

      const meetingId =
        selectedMeetingId === 'all'
          ? null
          : Number(selectedMeetingId);

      const result = await api.askQuestion(
        projectId,
        trimmed,
        meetingId,
      );

      setResponse(result);

      setHistory((previous) =>
        [trimmed, ...previous.filter((item) => item !== trimmed)].slice(0, 6),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to get an answer. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  function startNewConversation() {
    setQuestion('');
    setResponse(null);
    setError('');
  }

  function handleMeetingChange(value: string) {
    setSelectedMeetingId(value);
    setResponse(null);
    setError('');
  }

  const hasAnswer = Boolean(response && !loading);

  const selectedMeeting = meetings.find(
    (meeting) => String(meeting.id) === selectedMeetingId,
  );

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-10">

      {/* Page heading */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-violet-700">
            <Sparkles size={16} />
            Project Workspace
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Ask MeetGraph AI
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Explore your meeting conversations, tasks, participants and decisions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadMeetings()}
          disabled={loadingMeetings || loading}
          className="flex items-center gap-2 rounded-xl border border-[#D8D5ED] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-300 hover:bg-[#F5F3FF] hover:text-violet-700 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loadingMeetings ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </section>

      {/* Hero banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-800 via-violet-700 to-indigo-700 p-7 text-white shadow-lg shadow-violet-200/70 md:p-9">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium">
              <BrainCircuit size={14} />
              Meeting intelligence assistant
            </span>

            <h2 className="mt-5 text-2xl font-bold md:text-3xl">
              Your meeting knowledge,
              <br />
              ready to answer.
            </h2>

            <p className="mt-3 text-sm leading-6 text-violet-100">
              Ask questions across recorded meetings. Discover responsibilities,
              deadlines and decisions with supporting meeting evidence.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs">
                <AudioLines size={14} />
                {meetings.length} project meetings
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs">
                <ShieldCheck size={14} />
                Evidence-based answers
              </span>
            </div>
          </div>

          <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/20 bg-white/10">
            <BrainCircuit size={46} strokeWidth={1.5} />
          </div>
        </div>

        <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-indigo-300/20 blur-3xl" />
      </section>

      {/* Meeting library status */}
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D8D5ED] bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              loadingMeetings
                ? 'bg-amber-400'
                : meetingError
                  ? 'bg-red-500'
                  : 'bg-emerald-500'
            }`}
          />

          {loadingMeetings
            ? 'Connecting to meeting library...'
            : meetingError
              ? 'Meeting library connection failed'
              : 'Meeting library connected'}
        </div>

        <span className="text-xs text-slate-500">
          {meetings.length} recordings available
        </span>
      </section>

      {meetingError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {meetingError}
        </div>
      )}

      {/* Assistant workspace */}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_310px]">

        {/* Conversation panel */}
        <section className="overflow-hidden rounded-2xl border border-[#D8D5ED] bg-white shadow-sm">

          {/* Conversation header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE8F5] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0EDFF] text-violet-700">
                <MessageSquare size={21} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Conversation
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Ask anything about your project meetings
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={startNewConversation}
              className="inline-flex items-center gap-2 rounded-xl border border-[#D8D5ED] px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-violet-300 hover:bg-[#F5F3FF] hover:text-violet-700"
            >
              <Plus size={15} />
              New question
            </button>
          </div>

          {/* Meeting scope selector */}
          <div className="border-b border-[#EAE8F5] bg-white px-5 py-4 md:px-6">
            <label
              htmlFor="meeting-scope"
              className="mb-2 block text-xs font-semibold text-slate-700"
            >
              Search scope
            </label>

            <select
              id="meeting-scope"
              value={selectedMeetingId}
              onChange={(event) => handleMeetingChange(event.target.value)}
              disabled={loadingMeetings || loading}
              className="w-full rounded-xl border border-[#D8D5ED] bg-[#F5F3FF] px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:opacity-60"
            >
              <option value="all">
                All project meetings
              </option>

              {meetings.map((meeting) => (
                <option key={meeting.id} value={meeting.id}>
                  {meeting.title}
                </option>
              ))}
            </select>

            <p className="mt-2 text-[11px] text-slate-500">
              {selectedMeeting
                ? `Questions will be restricted to ${selectedMeeting.title}.`
                : 'Questions will search across all meetings in this project.'}
            </p>
          </div>

          {/* Conversation body */}
          <div className="min-h-[350px] space-y-6 bg-[#F5F3FF]/70 p-5 md:p-7">

            {!response && !loading && (
              <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E6E6FA] text-violet-700">
                  <BrainCircuit size={34} />
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  What would you like to know?
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                  Ask about a meeting, participant, assigned task or deadline.
                  Answers are retrieved from available meeting records.
                </p>

                <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
                  <Lightbulb size={15} className="text-amber-500" />
                  Try one of the suggested questions
                </div>
              </div>
            )}

            {loading && (
              <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E6E6FA] text-violet-700">
                  <LoaderCircle size={32} className="animate-spin" />
                </div>

                <h3 className="mt-5 font-bold text-slate-900">
                  Searching meeting records
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Finding relevant information and supporting evidence...
                </p>
              </div>
            )}

            {hasAnswer && response && (
              <>
                {/* User question */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-violet-700 px-5 py-4 text-white shadow-sm">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-violet-200">
                      <User size={14} />
                      YOUR QUESTION
                    </div>

                    <p className="text-sm leading-6">
                      {response.question}
                    </p>
                  </div>
                </div>

                {/* AI answer */}
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6E6FA] text-violet-700">
                    <Bot size={21} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        MeetGraph AI
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          response.sources.length > 0
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {response.sources.length > 0
                          ? 'Evidence retrieved'
                          : 'No supporting evidence'}
                      </span>
                    </div>

                    <article className="rounded-2xl rounded-tl-md border border-[#D8D5ED] bg-white p-5 shadow-sm">
                      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                        {response.answer}
                      </p>

                      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#EAE8F5] pt-4">
                        <span className="rounded-lg bg-[#F0EDFF] px-3 py-1.5 text-[11px] font-semibold capitalize text-violet-800">
                          {response.answer_method.replaceAll('_', ' ')}
                        </span>

                        <span className="text-xs text-slate-500">
                          {response.sources.length} supporting sources
                        </span>
                      </div>
                    </article>

                    {/* Download answer buttons */}
                    <div className="mt-3 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => downloadAnswerAsPDF(response)}
                        className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-800"
                      >
                        <Download size={15} />
                        Download PDF
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadAnswerAsTXT(response)}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#D8D5ED] bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-[#F5F3FF]"
                      >
                        <FileText size={15} />
                        Download TXT
                      </button>
                    </div>
                  </div>
                </div>

                {/* Supporting evidence */}
                <div className="border-t border-[#D8D5ED] pt-5 md:ml-[52px]">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-900">
                        Supporting evidence
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Information retrieved from original meeting records
                      </p>
                    </div>

                    <FileText size={20} className="text-violet-600" />
                  </div>

                  {response.sources.length === 0 ? (
                    <div className="rounded-xl border border-[#D8D5ED] bg-white p-4 text-sm text-slate-500">
                      No supporting transcript evidence was returned.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {response.sources.map((source, index) => (
                        <article
                          key={`${source.meeting_id}-${index}`}
                          className="rounded-2xl border border-[#D8D5ED] bg-white p-4 transition hover:border-violet-300"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-[11px] font-medium text-slate-400">
                                MEETING {source.meeting_id}
                              </p>

                              <h4 className="mt-1 text-sm font-semibold text-slate-800">
                                {source.meeting_title}
                              </h4>
                            </div>

                            <span className="rounded-full bg-[#F0EDFF] px-3 py-1 text-[10px] font-semibold capitalize text-violet-800">
                              {source.source_type.replaceAll('_', ' ')}
                            </span>
                          </div>

                          <blockquote className="mt-3 rounded-xl border-l-[3px] border-violet-400 bg-[#F5F3FF] px-4 py-3 text-sm leading-6 text-slate-700">
                            {source.evidence_text}
                          </blockquote>

                          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                            {source.speaker && (
                              <span className="inline-flex items-center gap-1.5">
                                <User size={13} className="text-violet-600" />
                                {source.speaker}
                              </span>
                            )}

                            {(source.start_seconds != null ||
                              source.end_seconds != null) && (
                              <span className="inline-flex items-center gap-1.5">
                                <Clock3 size={13} className="text-violet-600" />
                                {formatTime(source.start_seconds) ?? 'Unknown'}
                                {source.end_seconds != null &&
                                  ` - ${formatTime(source.end_seconds)}`}
                              </span>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Question composer */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void submitQuestion();
            }}
            className="border-t border-[#EAE8F5] bg-white p-5 md:p-6"
          >
            <label htmlFor="meeting-question" className="sr-only">
              Ask a question
            </label>

            <div className="rounded-2xl border border-[#D8D5ED] bg-[#F5F3FF] p-3 transition focus-within:border-violet-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-100">
              <textarea
                id="meeting-question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask MeetGraph AI about your meetings..."
                rows={3}
                maxLength={1000}
                disabled={loading}
                className="w-full resize-y bg-transparent px-2 py-2 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-60"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#D8D5ED] pt-3">
                <span className="text-[11px] text-slate-500">
                  Answers are based on saved meeting evidence
                </span>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    loadingMeetings ||
                    question.trim().length < 3
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-700 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:shadow-md hover:shadow-violet-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <LoaderCircle size={15} className="animate-spin" />
                  ) : (
                    <Send size={15} />
                  )}

                  {loading ? 'Searching...' : 'Ask MeetGraph AI'}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Right sidebar */}
        <aside className="space-y-5">

          {/* Suggested questions */}
          <section className="rounded-2xl border border-[#D8D5ED] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Lightbulb size={18} className="text-amber-500" />

              <h3 className="font-bold text-slate-900">
                Suggested questions
              </h3>
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Select a question to search your meeting records.
            </p>

            {selectedMeetingId === 'all' && meetings.length >= 2 && (
              <div className="mt-5 border-t border-[#EAE8F5] pt-4">
                <div className="mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-violet-700">
                    Cross-meeting comparison
                  </h4>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Compare discussion across Meeting 1 and Meeting 2 using
                    the evidence available in this project.
                  </p>
                </div>

                <div className="space-y-2">
                  {comparisonSuggestions.map(
                    ({ title, question: suggestedQuestion, icon: Icon }) => (
                      <button
                        key={title}
                        type="button"
                        disabled={loading || loadingMeetings}
                        onClick={() => {
                          setQuestion(suggestedQuestion);
                          void submitQuestion(suggestedQuestion);
                        }}
                        className="group flex w-full items-start gap-3 rounded-xl border border-violet-200 bg-[#F5F3FF] p-3 text-left transition hover:border-violet-400 hover:bg-[#F0EDFF] disabled:opacity-50"
                      >
                        <div className="rounded-lg bg-white p-2 text-violet-700">
                          <Icon size={16} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800">
                            {title}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-500 group-hover:text-violet-700">
                            {suggestedQuestion}
                          </p>
                        </div>
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}

            {selectedMeetingId !== 'all' && (
              <p className="mt-4 rounded-xl bg-[#F5F3FF] p-3 text-xs leading-5 text-slate-600">
                To compare meetings, change Search scope to All project meetings.
              </p>
            )}

            <div className="mt-4 space-y-2">
              {suggestions.map(
                ({ title, question: suggestedQuestion, icon: Icon }) => (
                  <button
                    key={title}
                    type="button"
                    disabled={loading || loadingMeetings}
                    onClick={() => {
                      setQuestion(suggestedQuestion);
                      void submitQuestion(suggestedQuestion);
                    }}
                    className="group flex w-full items-start gap-3 rounded-xl border border-[#EAE8F5] p-3 text-left transition hover:border-violet-300 hover:bg-[#F5F3FF] disabled:opacity-50"
                  >
                    <div className="rounded-lg bg-[#F0EDFF] p-2 text-violet-700">
                      <Icon size={16} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800">
                        {title}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500 group-hover:text-violet-700">
                        {suggestedQuestion}
                      </p>
                    </div>
                  </button>
                ),
              )}
            </div>
          </section>

          {/* Recent questions */}
          <section className="rounded-2xl border border-[#D8D5ED] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Clock3 size={18} className="text-violet-600" />

              <h3 className="font-bold text-slate-900">
                Recent questions
              </h3>
            </div>

            {history.length === 0 ? (
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Your recent questions will appear here.
              </p>
            ) : (
              <div className="mt-3 space-y-1">
                {history.map((item, index) => (
                  <button
                    key={`${item}-${index}`}
                    type="button"
                    disabled={loading || loadingMeetings}
                    onClick={() => {
                      setQuestion(item);
                      void submitQuestion(item);
                    }}
                    className="flex w-full items-start gap-2 rounded-lg px-2 py-2.5 text-left text-xs leading-5 text-slate-600 transition hover:bg-[#F5F3FF] hover:text-violet-700 disabled:opacity-50"
                  >
                    <MessageSquare
                      size={14}
                      className="mt-0.5 shrink-0 text-violet-500"
                    />

                    <span>{item}</span>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Evidence information */}
          <section className="rounded-2xl border border-[#DDD6FE] bg-[#F0EDFF] p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-violet-700" />

              <h3 className="text-sm font-bold text-slate-900">
                Evidence-first answers
              </h3>
            </div>

            <p className="mt-3 text-xs leading-6 text-slate-600">
              MeetGraph AI retrieves information from saved project meeting
              records. If supporting information is unavailable, it should
              not be treated as a confirmed meeting fact.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}