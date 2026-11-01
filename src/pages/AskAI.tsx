
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
  ChevronDown,
  CalendarDays,
  RefreshCw,
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
  'What happened in this meeting?',
  'Which tasks were assigned to Rahul?',
  'What work is still remaining?',
  'What deadlines were discussed?',
];

function formatTime(seconds: number | null) {
  if (seconds == null) return null;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
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

  const selectedMeeting = meetings.find(
    (meeting) => String(meeting.id) === selectedMeetingId,
  );

  const loadMeetings = useCallback(async () => {
    try {
      setLoadingMeetings(true);
      setMeetingError('');

      const data = await api.getMeetings(projectId);
      setMeetings(data);

      // Reset the selection if its meeting no longer exists.
      if (
        selectedMeetingId !== 'all' &&
        !data.some((meeting) => String(meeting.id) === selectedMeetingId)
      ) {
        setSelectedMeetingId('all');
      }
    } catch (err) {
      setMeetingError(
        err instanceof Error
          ? err.message
          : 'Unable to load project meetings.',
      );
    } finally {
      setLoadingMeetings(false);
    }
  }, [projectId, selectedMeetingId]);

  useEffect(() => {
    void loadMeetings();
  }, [loadMeetings]);

  async function submitQuestion(value = question) {
    const trimmed = value.trim();

    if (trimmed.length < 3 || loading) return;

    try {
      setLoading(true);
      setError('');
      setQuestion(trimmed);
      setResponse(null);

      // Send the selected meeting ID separately.
      // null means search across all project meetings.
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
        [trimmed, ...previous.filter((item) => item !== trimmed)].slice(0, 5),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to get an answer. Please try again.',
      );
      setResponse(null);
    } finally {
      setLoading(false);
    }
  }

  function handleMeetingChange(value: string) {
    setSelectedMeetingId(value);
    setResponse(null);
    setError('');
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      {/* Page heading */}
      <section>
        <p className="text-sm font-semibold text-[#B58B3F]">
          Meeting Intelligence
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[#3F3022]">
          Ask MeetGraph AI
        </h1>

        <p className="mt-2 text-sm text-[#766654]">
          Ask questions across your project meetings or select one specific
          meeting to get focused answers.
        </p>
      </section>

      {/* Question input */}
      <section className="rounded-2xl border border-[#DED3C3] bg-[#FFFDF9] p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-[#EFE2C9] p-2">
            <BrainCircuit size={21} className="text-[#A47A32]" />
          </div>

          <div>
            <h2 className="font-bold text-[#3F3022]">
              Ask your question
            </h2>

            <p className="text-xs text-[#766654]">
              Choose the meeting scope before asking.
            </p>
          </div>
        </div>

        {/* Meeting selector */}
        <div className="mt-5">
          <label
            htmlFor="meeting-selector"
            className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#3F3022]"
          >
            <CalendarDays size={16} className="text-[#A47A32]" />
            Search scope
          </label>

          <div className="relative">
            <select
              id="meeting-selector"
              value={selectedMeetingId}
              onChange={(event) => handleMeetingChange(event.target.value)}
              disabled={loadingMeetings || loading}
              className="w-full appearance-none rounded-xl border border-[#DED3C3] bg-[#F8F5EF] px-4 py-3 pr-10 text-sm text-[#3F3022] outline-none focus:border-[#B58B3F] focus:ring-2 focus:ring-[#EFE2C9] disabled:opacity-60"
            >
              <option value="all">All Meetings</option>

              {meetings.map((meeting) => (
                <option key={meeting.id} value={String(meeting.id)}>
                  {meeting.title}
                </option>
              ))}
            </select>

            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#766654]"
            />
          </div>

          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-xs text-[#93816D]">
              {loadingMeetings
                ? 'Loading meetings...'
                : selectedMeeting
                  ? `Searching only in: ${selectedMeeting.title}`
                  : `Searching across ${meetings.length} project meetings.`}
            </p>

            <button
              type="button"
              onClick={() => void loadMeetings()}
              disabled={loadingMeetings || loading}
              className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#A47A32] hover:text-[#765522] disabled:opacity-50"
            >
              <RefreshCw
                size={13}
                className={loadingMeetings ? 'animate-spin' : ''}
              />
              Refresh
            </button>
          </div>

          {meetingError && (
            <p className="mt-2 text-xs text-red-600">
              {meetingError}
            </p>
          )}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void submitQuestion();
          }}
          className="mt-5"
        >
          <label
            htmlFor="meeting-question"
            className="mb-2 block text-sm font-semibold text-[#3F3022]"
          >
            Your question
          </label>

          <textarea
            id="meeting-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Example: Which tasks were assigned to Rahul?"
            rows={3}
            disabled={loading}
            className="w-full resize-none rounded-xl border border-[#DED3C3] bg-[#F8F5EF] p-4 text-sm text-[#3F3022] outline-none placeholder:text-[#93816D] focus:border-[#B58B3F] focus:ring-2 focus:ring-[#EFE2C9] disabled:opacity-60"
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[#93816D]">
              Answers are based on saved meeting evidence.
            </p>

            <button
              type="submit"
              disabled={loading || question.trim().length < 3 || loadingMeetings}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-[#A47A32] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#856027] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}

              {loading ? 'Analysing...' : 'Ask AI'}
            </button>
          </div>
        </form>
      </section>

      {/* Suggested questions */}
      {!response && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles size={17} className="text-[#B58B3F]" />

            <h2 className="text-sm font-bold text-[#3F3022]">
              Suggested questions
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                disabled={loading || loadingMeetings}
                onClick={() => {
                  setQuestion(item);
                  void submitQuestion(item);
                }}
                className="rounded-xl border border-[#DED3C3] bg-[#FFFDF9] p-4 text-left text-sm font-medium text-[#57432F] transition hover:border-[#B58B3F] hover:bg-[#EFE2C9] disabled:opacity-50"
              >
                {item}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-[#DED3C3] bg-[#FFFDF9] p-8 text-center">
          <LoaderCircle
            size={26}
            className="mx-auto animate-spin text-[#B58B3F]"
          />

          <p className="mt-3 text-sm font-medium text-[#766654]">
            Searching your meeting records...
          </p>
        </div>
      )}

      {/* Answer */}
      {response && !loading && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-[#A47A32]" />

            <h2 className="font-bold text-[#3F3022]">
              AI Response
            </h2>
          </div>

          <div className="rounded-2xl border border-[#DED3C3] bg-[#FFFDF9] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#A47A32]">
              Your question
            </p>

            <p className="mt-2 text-sm font-semibold text-[#3F3022]">
              {response.question}
            </p>

            <div className="my-5 border-t border-[#EAE1D4]" />

            <p className="text-xs font-semibold uppercase tracking-wide text-[#A47A32]">
              Answer
            </p>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#57432F]">
              {response.answer}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#EFE2C9] px-3 py-1 text-xs font-semibold text-[#765522]">
                {response.answer_method.replaceAll('_', ' ')}
              </span>

              <span className="text-xs text-[#93816D]">
                {response.sources.length} supporting sources
              </span>
            </div>
          </div>

          {/* Evidence */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <FileText size={18} className="text-[#A47A32]" />

              <h2 className="font-bold text-[#3F3022]">
                Meeting Evidence
              </h2>
            </div>

            {response.sources.length === 0 ? (
              <div className="rounded-xl border border-[#DED3C3] bg-[#FFFDF9] p-5 text-sm text-[#766654]">
                No supporting transcript evidence was returned.
              </div>
            ) : (
              <div className="space-y-3">
                {response.sources.map((source, index) => (
                  <article
                    key={`${source.meeting_id}-${index}`}
                    className="rounded-xl border border-[#DED3C3] bg-[#FFFDF9] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-[#A47A32]">
                          Meeting ID: {source.meeting_id}
                        </p>

                        <h3 className="mt-1 font-bold text-[#3F3022]">
                          {source.meeting_title}
                        </h3>
                      </div>

                      <span className="rounded-full bg-[#EFE2C9] px-3 py-1 text-xs font-semibold capitalize text-[#765522]">
                        {source.source_type.replaceAll('_', ' ')}
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-[#57432F]">
                      "{source.evidence_text}"
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-[#EAE1D4] pt-3 text-xs text-[#766654]">
                      {source.speaker && (
                        <span className="flex items-center gap-1.5">
                          <User size={14} />
                          {source.speaker}
                        </span>
                      )}

                      {source.start_seconds != null && (
                        <span className="flex items-center gap-1.5">
                          <Clock3 size={14} />

                          {formatTime(source.start_seconds)}

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
        </section>
      )}

      {/* Recent questions */}
      {history.length > 0 && (
        <section className="rounded-xl border border-[#DED3C3] bg-[#FFFDF9] p-5">
          <h2 className="mb-3 text-sm font-bold text-[#3F3022]">
            Recent questions
          </h2>

          <div className="space-y-2">
            {history.map((item, index) => (
              <button
                key={`${item}-${index}`}
                type="button"
                disabled={loading || loadingMeetings}
                onClick={() => {
                  setQuestion(item);
                  void submitQuestion(item);
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[#766654] transition hover:bg-[#EFE2C9] hover:text-[#3F3022]"
              >
                {item}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
