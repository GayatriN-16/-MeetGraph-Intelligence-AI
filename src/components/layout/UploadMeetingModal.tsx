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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#34303A]/55 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >
      <section className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#EBC3D4] bg-[#FFFFFF] shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EBC3D4] px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-[#34303A]">
              Upload Meeting
            </h2>

            <p className="mt-1 text-xs text-[#55505A]">
              Add a recording or transcript to your project workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close upload dialog"
            className="rounded-lg p-2 text-[#55505A] transition hover:bg-[#FFF5F8] disabled:opacity-50"
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
            <label className="mb-2 block text-sm font-semibold text-[#34303A]">
              Meeting Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Project Progress Meeting"
              required
              disabled={loading || uploadedMeetingId !== null}
              className="w-full rounded-lg border border-[#EBC3D4] bg-white px-4 py-3 text-sm text-[#34303A] outline-none transition focus:border-[#C65383] focus:ring-2 focus:ring-[#F8E1EB] disabled:bg-[#FFF5F8]"
            />
          </div>

          {/* Recording or transcript selection */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#34303A]">
              Recording or Transcript File
            </label>

            <label
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C65383] bg-[#FFF5F8] p-7 text-center transition ${
                loading || uploadedMeetingId !== null
                  ? 'cursor-not-allowed opacity-60'
                  : 'cursor-pointer hover:border-[#A83E6D] hover:bg-[#F8E1EB]'
              }`}
            >
              {file ? (
                <>
                  {isTranscript ? (
                    <FileText
                      size={30}
                      className="text-[#A83E6D]"
                    />
                  ) : isVideo ? (
                    <FileVideo
                      size={30}
                      className="text-[#A83E6D]"
                    />
                  ) : (
                    <FileAudio
                      size={30}
                      className="text-[#A83E6D]"
                    />
                  )}

                  <p className="mt-3 max-w-full break-all text-sm font-semibold text-[#34303A]">
                    {file.name}
                  </p>

                  <p className="mt-1 text-xs text-[#55505A]">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>

                  <p className="mt-1 text-xs font-medium text-[#A83E6D]">
                    {isTranscript
                      ? 'Transcript file'
                      : isVideo
                        ? 'Video recording'
                        : 'Audio recording'}
                  </p>
                </>
              ) : (
                <>
                  <UploadCloud
                    size={32}
                    className="text-[#A83E6D]"
                  />

                  <p className="mt-3 text-sm font-semibold text-[#34303A]">
                    {fileLabel}
                  </p>

                  <p className="mt-1 text-xs text-[#55505A]">
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

            <p className="mt-2 text-xs text-[#89818B]">
              Supported formats: audio, video, TXT, SRT and VTT.
              Transcript files must be under 10 MB.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle
                size={17}
                className="mt-0.5 shrink-0"
              />

              <p className="break-words">{error}</p>
            </div>
          )}

          {/* Success and processing status */}
          {message && (
            <div className="flex items-start gap-2 rounded-lg border border-[#EBC3D4] bg-[#F8E1EB] p-3 text-sm text-[#55505A]">
              {transcriptionComplete ? (
                <CheckCircle2
                  size={17}
                  className="mt-0.5 shrink-0"
                />
              ) : (
                <LoaderCircle
                  size={17}
                  className="mt-0.5 shrink-0 animate-spin"
                />
              )}

              <p>{message}</p>
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 border-t border-[#EBC3D4] pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-[#EBC3D4] px-4 py-2.5 text-sm font-semibold text-[#34303A] transition hover:bg-[#FFF5F8] disabled:opacity-50"
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
              className="flex items-center gap-2 rounded-lg bg-[#C65383] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#A83E6D] disabled:cursor-not-allowed disabled:opacity-50"
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