
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';

import {
  X,
  UploadCloud,
  FileAudio,
  FileVideo,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import { api } from '../../api/client';

interface UploadMeetingModalProps {
  projectId: number;
  onClose: () => void;
  onUploaded: () => void;
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

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');
    setMessage('');

    if (!uploadedMeetingId && !file) {
      setError('Please select an audio or video recording.');
      return;
    }

    if (!uploadedMeetingId && !title.trim()) {
      setError('Please enter a meeting title.');
      return;
    }

    try {
      setLoading(true);

      let meetingId = uploadedMeetingId;

      // Step 1: Upload the recording only once.
      if (meetingId === null) {
        setMessage('Uploading your meeting recording...');

        const meeting = await api.uploadMeeting(
          projectId,
          title.trim(),
          file!,
        );

        meetingId = meeting.id;
        setUploadedMeetingId(meeting.id);

        setMessage('Upload successful. Starting transcription...');
      }

      // Step 2: Transcribe the uploaded recording.
      setMessage('Transcription is in progress. Please wait...');

      await api.transcribeMeeting(meetingId);

      setTranscriptionComplete(true);
      setMessage('Meeting uploaded and transcription completed successfully.');

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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#3F3022]/55 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >
      <section className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#DED3C3] bg-[#FFFDF9] shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DED3C3] px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-[#3F3022]">
              Upload Meeting
            </h2>

            <p className="mt-1 text-xs text-[#766654]">
              Add a recording to your project workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close upload dialog"
            className="rounded-lg p-2 text-[#766654] transition hover:bg-[#EFE2C9] disabled:opacity-50"
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
            <label className="mb-2 block text-sm font-semibold text-[#3F3022]">
              Meeting Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Project Progress Meeting"
              required
              disabled={loading || uploadedMeetingId !== null}
              className="w-full rounded-lg border border-[#DED3C3] bg-white px-4 py-3 text-sm text-[#3F3022] outline-none transition focus:border-[#B58B3F] focus:ring-2 focus:ring-[#EFE2C9] disabled:bg-[#F3EEE5]"
            />
          </div>

          {/* Recording selection */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#3F3022]">
              Recording File
            </label>

            <label
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#CBB994] bg-[#F8F5EF] p-7 text-center transition ${
                loading || uploadedMeetingId !== null
                  ? 'cursor-not-allowed opacity-60'
                  : 'cursor-pointer hover:border-[#A47A32] hover:bg-[#EFE2C9]/50'
              }`}
            >
              {file ? (
                <>
                  {isVideo ? (
                    <FileVideo
                      size={30}
                      className="text-[#A47A32]"
                    />
                  ) : (
                    <FileAudio
                      size={30}
                      className="text-[#A47A32]"
                    />
                  )}

                  <p className="mt-3 max-w-full break-all text-sm font-semibold text-[#3F3022]">
                    {file.name}
                  </p>

                  <p className="mt-1 text-xs text-[#766654]">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </>
              ) : (
                <>
                  <UploadCloud
                    size={32}
                    className="text-[#A47A32]"
                  />

                  <p className="mt-3 text-sm font-semibold text-[#3F3022]">
                    Choose a recording
                  </p>

                  <p className="mt-1 text-xs text-[#766654]">
                    Select an audio or video file from your computer.
                  </p>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,video/*"
                className="hidden"
                disabled={loading || uploadedMeetingId !== null}
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null);
                  setError('');
                }}
              />
            </label>

            <p className="mt-2 text-xs text-[#93816D]">
              Supported formats depend on the backend transcription service.
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
            <div className="flex items-start gap-2 rounded-lg border border-[#D9C49D] bg-[#F4EBD9] p-3 text-sm text-[#765522]">
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
          <div className="flex justify-end gap-3 border-t border-[#DED3C3] pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-[#DED3C3] px-4 py-2.5 text-sm font-semibold text-[#3F3022] transition hover:bg-[#F3EEE5] disabled:opacity-50"
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
              className="flex items-center gap-2 rounded-lg bg-[#A47A32] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#856027] disabled:cursor-not-allowed disabled:opacity-50"
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
                : uploadedMeetingId
                  ? 'Retry Transcription'
                  : 'Upload & Process'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
