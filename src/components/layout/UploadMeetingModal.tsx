import { useRef, useState } from 'react';
import type { FormEvent } from 'react';

import {
  X,
  UploadCloud,
  FileAudio,
  FileVideo,
  FileText,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import { api } from '../../api/client';
import type { Meeting } from '../../api/client';

interface UploadMeetingModalProps {
  projectId: number;
  onClose: () => void;
  onUploaded: () => void;
}

const POLLING_INTERVAL = 2500;
const MAX_POLLING_TIME = 10 * 60 * 1000;

function isTranscriptFile(file: File): boolean {
  return /\.(txt|srt|vtt)$/i.test(file.name);
}

function isSupportedFile(file: File): boolean {
  return (
    file.type.startsWith('audio/') ||
    file.type.startsWith('video/') ||
    isTranscriptFile(file)
  );
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

export default function UploadMeetingModal({
  projectId,
  onClose,
  onUploaded,
}: UploadMeetingModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [uploadedMeetingId, setUploadedMeetingId] =
    useState<number | null>(null);

  const [transcriptionComplete, setTranscriptionComplete] =
    useState(false);

  async function waitForTranscription(
    meetingId: number,
  ): Promise<Meeting> {
    const startTime = Date.now();

    while (Date.now() - startTime < MAX_POLLING_TIME) {
      const meeting = await api.getMeeting(meetingId);

      if (meeting.status === 'transcribed') {
        return meeting;
      }

      if (meeting.status === 'failed') {
        throw new Error(
          meeting.processing_error ||
          'Transcription failed. Please try again.',
        );
      }

      setMessage(
        meeting.status === 'transcribing'
          ? 'Transcription is in progress. Please wait...'
          : 'Waiting for transcription to start...',
      );

      await wait(POLLING_INTERVAL);
    }

    throw new Error(
      'Transcription is taking longer than expected. Your upload is saved. You can retry checking its status.',
    );
  }

  async function processRecording(meetingId: number) {
    let meeting = await api.getMeeting(meetingId);

    if (meeting.status === 'transcribed') {
      return;
    }

    if (
      meeting.status === 'uploaded' ||
      meeting.status === 'failed'
    ) {
      setMessage('Starting transcription...');

      try {
        await api.transcribeMeeting(meetingId);
      } catch (err) {
        // A 409 can mean another transcription request
        // has already started. Check the actual meeting status.
        meeting = await api.getMeeting(meetingId);

        if (
          meeting.status !== 'transcribing' &&
          meeting.status !== 'transcribed'
        ) {
          throw err;
        }
      }
    }

    await waitForTranscription(meetingId);
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');
    setMessage('');

    if (!uploadedMeetingId && !file) {
      setError('Please select a recording or transcript file.');
      return;
    }

    if (!uploadedMeetingId && !title.trim()) {
      setError('Please enter a meeting title.');
      return;
    }

    if (file && !isSupportedFile(file)) {
      setError(
        'Unsupported file. Select an audio, video, TXT, SRT or VTT file.',
      );
      return;
    }

    if (file && isTranscriptFile(file) && file.size > 10 * 1024 * 1024) {
      setError('Transcript files must be smaller than 10 MB.');
      return;
    }

    try {
      setLoading(true);

      let meetingId = uploadedMeetingId;

      // Step 1: Upload the selected file only once.
      if (meetingId === null && file) {
        if (isTranscriptFile(file)) {
          setMessage('Uploading and processing your transcript...');

          const meeting = await api.uploadTranscript(
            projectId,
            title.trim(),
            file,
          );

          meetingId = meeting.id;
          setUploadedMeetingId(meeting.id);

          // Transcript uploads are already marked transcribed
          // by the backend. No transcription request is needed.
          if (meeting.status !== 'transcribed') {
            throw new Error(
              'Transcript was uploaded, but processing is not complete.',
            );
          }
        } else {
          setMessage('Uploading your meeting recording...');

          const meeting = await api.uploadMeeting(
            projectId,
            title.trim(),
            file,
          );

          meetingId = meeting.id;
          setUploadedMeetingId(meeting.id);
        }
      }

      if (meetingId === null) {
        throw new Error('Unable to identify the uploaded meeting.');
      }

      // Step 2: Recordings require background transcription.
      if (file && !isTranscriptFile(file)) {
        await processRecording(meetingId);
      } else if (!file) {
        // Retry after a previous recording upload.
        await processRecording(meetingId);
      }

      setTranscriptionComplete(true);
      setMessage(
        'Meeting uploaded and processed successfully.',
      );

      window.setTimeout(() => {
        onUploaded();
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to process the meeting.',
      );
    } finally {
      setLoading(false);
    }
  }

  const isVideo = file?.type.startsWith('video/') ?? false;
  const isTranscript = file ? isTranscriptFile(file) : false;

  const fileLabel = isTranscript
    ? 'Choose a transcript'
    : 'Choose a recording';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#17102B]/45 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >
      <section className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#E2DDF5] bg-[#FFFFFF] shadow-2xl shadow-[#35106D]/20">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2DDF5] bg-gradient-to-r from-[#F8F5FF] to-[#F0E9FF] px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-[#17152B]">
              Upload Meeting
            </h2>

            <p className="mt-1 text-xs text-[#625D7A]">
              Add a recording or transcript to your project workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close upload dialog"
            className="rounded-lg p-2 text-[#625D7A] transition hover:bg-[#EAE2FF] hover:text-[#6810D9] disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={handleUpload}
          className="space-y-5 p-6"
        >

          {/* Meeting title */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#17152B]">
              Meeting Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Project Progress Meeting"
              required
              disabled={loading || uploadedMeetingId !== null}
              className="w-full rounded-lg border border-[#E2DDF5] bg-[#F8F5FF] px-4 py-3 text-sm text-[#17152B] outline-none transition placeholder:text-[#89849F] focus:border-[#6810D9] focus:ring-2 focus:ring-[#F0E9FF] disabled:bg-[#FFFFFF]"
            />
          </div>

          {/* Recording or transcript selection */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#17152B]">
              Recording or Transcript File
            </label>

            <label
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#A78BFA] bg-[#F8F5FF] p-7 text-center transition ${
                loading || uploadedMeetingId !== null
                  ? 'cursor-not-allowed opacity-60'
                  : 'cursor-pointer hover:border-[#6810D9] hover:bg-[#F0E9FF]'
              }`}
            >
              {file ? (
                <>
                  {isTranscript ? (
                    <FileText
                      size={30}
                      className="text-[#6810D9]"
                    />
                  ) : isVideo ? (
                    <FileVideo
                      size={30}
                      className="text-[#6810D9]"
                    />
                  ) : (
                    <FileAudio
                      size={30}
                      className="text-[#6810D9]"
                    />
                  )}

                  <p className="mt-3 max-w-full break-all text-sm font-semibold text-[#17152B]">
                    {file.name}
                  </p>

                  <p className="mt-1 text-xs text-[#625D7A]">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>

                  <p className="mt-1 text-xs font-medium text-[#6810D9]">
                    {isTranscript
                      ? 'Transcript file'
                      : isVideo
                        ? 'Video recording'
                        : 'Audio recording'}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0E9FF]">
                    <UploadCloud
                      size={32}
                      className="text-[#6810D9]"
                    />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-[#17152B]">
                    {fileLabel}
                  </p>

                  <p className="mt-1 text-xs text-[#625D7A]">
                    Select a file from your computer.
                  </p>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,video/*,.txt,.srt,.vtt"
                className="hidden"
                disabled={loading || uploadedMeetingId !== null}
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null);
                  setError('');
                  setMessage('');
                }}
              />
            </label>

            <p className="mt-2 text-xs text-[#89849F]">
              Supported formats: audio, video, TXT, SRT and VTT.
              Transcript files must be under 10 MB.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-3 text-sm text-[#B91C1C]">
              <AlertCircle
                size={17}
                className="mt-0.5 shrink-0"
              />

              <p className="break-words">{error}</p>
            </div>
          )}

          {/* Success and processing status */}
          {message && (
            <div className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
              transcriptionComplete
                ? 'border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]'
                : 'border-[#DDD6FE] bg-[#F5F0FF] text-[#6D28D9]'
            }`}>
              {transcriptionComplete ? (
                <CheckCircle2
                  size={17}
                  className="mt-0.5 shrink-0 text-[#16A34A]"
                />
              ) : (
                <LoaderCircle
                  size={17}
                  className="mt-0.5 shrink-0 animate-spin text-[#6810D9]"
                />
              )}

              <p>{message}</p>
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 border-t border-[#E2DDF5] pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-[#E2DDF5] px-4 py-2.5 text-sm font-semibold text-[#625D7A] transition hover:bg-[#F8F5FF] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                transcriptionComplete ||
                (!uploadedMeetingId && (!file || !title.trim()))
              }
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#6810D9] to-[#5135E8] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md hover:shadow-[#6810D9]/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              ) : transcriptionComplete ? (
                <CheckCircle2 size={17} />
              ) : (
                <UploadCloud size={17} />
              )}

              {loading
                ? 'Processing...'
                : transcriptionComplete
                  ? 'Completed'
                  : uploadedMeetingId
                    ? 'Retry Processing'
                    : 'Upload & Process'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}