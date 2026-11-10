import { useEffect, useRef, useState } from 'react';
import {
  AudioLines,
  Mic,
  Square,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
} from 'lucide-react';

interface LiveMeetingProps {
  projectId: number;
}

interface TranscriptSegment {
  start_seconds: number;
  end_seconds: number;
  text: string;
  confidence: number | null;
}

type CaptureStatus =
  | 'idle'
  | 'connecting'
  | 'capturing'
  | 'transcribing'
  | 'completed'
  | 'error';

export default function LiveMeeting({ projectId }: LiveMeetingProps) {
  const [status, setStatus] = useState<CaptureStatus>('idle');
  const [title, setTitle] = useState('Live Meeting');
  const [testFile, setTestFile] = useState<File | null>(null);
  const [testFileUrl, setTestFileUrl] = useState('');
  const [recordedUrl, setRecordedUrl] = useState('');
  const [error, setError] = useState('');
  const [duration, setDuration] = useState(0);
  const [meetingId, setMeetingId] = useState<number | null>(null);
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [serverMessage, setServerMessage] = useState('');

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const intentionalStopRef = useRef(false);

  // Revoke each object URL when it is replaced or when the component unmounts.
  useEffect(() => {
    if (!recordedUrl) return;
    return () => URL.revokeObjectURL(recordedUrl);
  }, [recordedUrl]);

  useEffect(() => {
    if (!testFileUrl) return;
    return () => URL.revokeObjectURL(testFileUrl);
  }, [testFileUrl]);

  // Media and socket cleanup must run only on unmount, not when preview URLs change.
  useEffect(() => {
    return () => {
      const recorder = recorderRef.current;

      if (recorder && recorder.state !== 'inactive') {
        recorder.stop();
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());
      socketRef.current?.close();
    };
  }, []);

  function handleFileChange(file: File | null) {
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      setError('Please select a valid audio file.');
      return;
    }

    setTestFile(file);
    setTestFileUrl(URL.createObjectURL(file));
    setError('');
  }

  function handleServerMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);

      if (data.type === 'started') {
        setMeetingId(data.meeting_id);
        setServerMessage(data.message);
      }

      if (data.type === 'transcribing') {
        setStatus('transcribing');
        setServerMessage(data.message);
      }

      if (data.type === 'completed') {
        setMeetingId(data.meeting_id);
        setDuration(data.duration_seconds);
        setSegments(data.segments ?? []);
        setServerMessage(data.message);
        setStatus('completed');
      }

      if (data.type === 'interrupted') {
        setMeetingId(data.meeting_id);
        setError(data.message);
        setStatus('error');
      }

      if (data.type === 'error') {
        setError(data.message);
        setStatus('error');
      }
    } catch {
      setError('Received an invalid response from the server.');
      setStatus('error');
    }
  }

  async function startCapture() {
    let displayStream: MediaStream | null = null;
    let socket: WebSocket | null = null;

    try {
      setError('');
      setServerMessage('');
      setMeetingId(null);
      setSegments([]);
      setDuration(0);
      intentionalStopRef.current = false;
      chunksRef.current = [];

      if (!title.trim()) {
        throw new Error('Please enter a meeting title.');
      }

      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error('Your browser does not support tab audio capture.');
      }

      displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      streamRef.current = displayStream;

      const audioTracks = displayStream.getAudioTracks();

      if (audioTracks.length === 0) {
        displayStream.getTracks().forEach((track) => track.stop());
        throw new Error(
          'No tab audio received. Select a Chrome tab and enable Share tab audio.',
        );
      }

      const protocol =
        window.location.protocol === 'https:' ? 'wss:' : 'ws:';

      const params = new URLSearchParams({
        project_id: String(projectId),
        title: title.trim(),
      });

      const socketUrl =
        `${protocol}//${window.location.host}` +
        `/api/v1/live-sessions/stream?${params.toString()}`;

      socket = new WebSocket(socketUrl);
      socketRef.current = socket;

      setStatus('connecting');

      socket.addEventListener('message', handleServerMessage);

      socket.addEventListener('close', () => {
        if (!intentionalStopRef.current) {
          setServerMessage('Connection closed.');
          setError('The live session connection closed unexpectedly.');
          setStatus('error');
        }
      });

      await new Promise<void>((resolve, reject) => {
        const activeSocket = socket!;

        const handleOpen = () => {
          activeSocket.removeEventListener('error', handleConnectionError);
          resolve();
        };

        const handleConnectionError = () => {
          activeSocket.removeEventListener('open', handleOpen);
          reject(new Error('Could not connect to the MeetGraph AI backend.'));
        };

        activeSocket.addEventListener('open', handleOpen, { once: true });
        activeSocket.addEventListener('error', handleConnectionError, {
          once: true,
        });
      });

      if (socket.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket connection is not available.');
      }

      const audioStream = new MediaStream(audioTracks);

      const mimeType = [
        'audio/webm;codecs=opus',
        'audio/webm',
      ].find((type) => MediaRecorder.isTypeSupported(type));

      const recorder = mimeType
        ? new MediaRecorder(audioStream, { mimeType })
        : new MediaRecorder(audioStream);

      recorderRef.current = recorder;
      streamRef.current = displayStream;

      recorder.ondataavailable = (event) => {
        if (event.data.size === 0) return;

        chunksRef.current.push(event.data);

        if (socket?.readyState === WebSocket.OPEN) {
          socket.send(event.data);
        } else {
          setError('The backend connection closed before the audio chunk could be sent.');
          setStatus('error');
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });

        const url = URL.createObjectURL(blob);

        setRecordedUrl((previous) => {
          if (previous) URL.revokeObjectURL(previous);
          return url;
        });

        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        if (socket?.readyState === WebSocket.OPEN) {
          // MediaRecorder emits its final dataavailable event before onstop.
          // WebSocket preserves send order, so this control message follows all audio chunks.
          intentionalStopRef.current = true;
          socket.send(JSON.stringify({ action: 'stop' }));
          setServerMessage('Recording uploaded. Waiting for transcription...');
          setStatus('transcribing');
        } else {
          setError('The backend connection closed before the recording could be finalized.');
          setStatus('error');
        }
      };

      displayStream.getVideoTracks().forEach((track) => {
        track.addEventListener('ended', () => {
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        });
      });

      recorder.start(1000);
      startedAtRef.current = Date.now();
      setStatus('capturing');
      setServerMessage('Audio is being sent to the backend.');
    } catch (err) {
      displayStream?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;

      intentionalStopRef.current = true;
      socket?.close();
      socketRef.current = null;

      setStatus('error');
      setError(
        err instanceof Error ? err.message : 'Unable to start live capture.',
      );
    }
  }

  function stopCapture() {
    const recorder = recorderRef.current;

    if (recorder?.state === 'recording') {
      recorder.stop();
    }

    setDuration(
      Math.round((Date.now() - startedAtRef.current) / 1000),
    );
  }

  function downloadRecording() {
    if (!recordedUrl) return;

    const link = document.createElement('a');
    link.href = recordedUrl;
    link.download = 'meetgraph-live-recording.webm';
    link.click();
  }

  const busy =
    status === 'connecting' ||
    status === 'capturing' ||
    status === 'transcribing';

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-[#269BA5]">
          MEETING INTELLIGENCE
        </p>

        <h1 className="mt-2 text-2xl font-bold text-[#187D87]">
          Live Meeting
        </h1>

        <p className="mt-2 text-sm text-[#89818B]">
          Capture browser meeting audio and save its transcript automatically.
        </p>
      </div>

      <section className="rounded-2xl border border-[#C6E5E6] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#DDF3F3] text-[#269BA5]">
            <AudioLines size={24} />
          </div>

          <div>
            <h2 className="font-bold text-[#187D87]">
              Start a live session
            </h2>

            <p className="text-xs text-[#89818B]">
              Project ID: {projectId}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-semibold text-[#187D87]">
            Meeting title
          </label>

          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={busy}
            maxLength={250}
            className="w-full rounded-xl border border-[#C6E5E6] bg-[#F3FAFA] px-4 py-3 text-sm text-[#187D87] outline-none transition placeholder:text-[#89818B] focus:border-[#269BA5] focus:ring-2 focus:ring-[#DDF3F3]"
            placeholder="Enter meeting title"
          />
        </div>

        <div className="mt-6 rounded-xl border border-dashed border-[#269BA5] bg-[#F3FAFA] p-5">
          <label className="flex cursor-pointer flex-col items-center gap-2 text-center">
            <Upload className="text-[#269BA5]" size={25} />

            <span className="text-sm font-semibold text-[#187D87]">
              Select test audio
            </span>

            <span className="text-xs text-[#89818B]">
              WAV, MP3 or another browser-supported audio format
            </span>

            <input
              type="file"
              accept="audio/*"
              disabled={busy}
              className="mt-2 max-w-full text-xs text-[#55505A] file:mr-3 file:rounded-lg file:border-0 file:bg-[#DDF3F3] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#187D87] hover:file:bg-[#C6E5E6]"
              onChange={(event) =>
                handleFileChange(event.target.files?.[0] ?? null)
              }
            />
          </label>

          {testFile && (
            <div className="mt-4 rounded-lg border border-[#C6E5E6] bg-white p-3 text-sm text-[#187D87]">
              Selected: {testFile.name}
            </div>
          )}
        </div>

        {testFileUrl && (
          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold text-[#187D87]">
              Test audio playback
            </p>

            <audio
              controls
              src={testFileUrl}
              className="w-full"
            />

            <p className="mt-2 text-xs text-[#89818B]">
              Start capture, select the tab containing this page, enable
              Share tab audio, then play this audio.
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={startCapture}
            disabled={busy}
            className="flex items-center gap-2 rounded-xl bg-[#187D87] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#269BA5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Mic size={17} />
            Start live meeting
          </button>

          <button
            type="button"
            onClick={stopCapture}
            disabled={status !== 'capturing'}
            className="flex items-center gap-2 rounded-xl border border-[#C6E5E6] bg-white px-5 py-3 text-sm font-semibold text-[#187D87] transition hover:border-[#269BA5] hover:bg-[#F3FAFA] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Square size={16} />
            Stop and transcribe
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-[#C6E5E6] bg-[#F3FAFA] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[#89818B]">
            Session status
          </p>

          <div className="mt-3 flex items-center gap-2">
            {status === 'capturing' ? (
              <>
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
                <span className="text-sm font-semibold text-red-700">
                  Recording and streaming audio
                </span>
              </>
            ) : status === 'connecting' || status === 'transcribing' ? (
              <>
                <LoaderCircle size={18} className="animate-spin text-[#269BA5]" />
                <span className="text-sm font-semibold text-[#269BA5]">
                  {status === 'connecting' ? 'Connecting...' : 'Transcribing...'}
                </span>
              </>
            ) : status === 'completed' ? (
              <>
                <CheckCircle2 className="text-[#63866B]" size={18} />
                <span className="text-sm font-semibold text-[#63866B]">
                  Meeting saved and transcribed
                </span>
              </>
            ) : (
              <>
                <span className="h-2.5 w-2.5 rounded-full bg-[#89818B]" />
                <span className="text-sm font-semibold text-[#55505A]">
                  {status === 'error' ? 'Session failed' : 'Not recording'}
                </span>
              </>
            )}
          </div>

          {serverMessage && (
            <p className="mt-2 text-xs text-[#55505A]">
              {serverMessage}
            </p>
          )}

          {meetingId !== null && (
            <p className="mt-2 text-sm font-semibold text-[#187D87]">
              Saved meeting ID: {meetingId}
            </p>
          )}

          {duration > 0 && (
            <p className="mt-1 text-xs text-[#89818B]">
              Duration: {duration} seconds
            </p>
          )}
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {recordedUrl && (
          <div className="mt-5 rounded-xl border border-[#C9DCCB] bg-[#F0F7F0] p-4">
            <p className="font-semibold text-[#426B49]">
              Local recording available
            </p>

            <audio controls src={recordedUrl} className="mt-3 w-full" />

            <button
              type="button"
              onClick={downloadRecording}
              className="mt-3 flex items-center gap-2 rounded-lg bg-[#63866B] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4E7156]"
            >
              <Download size={16} />
              Download recording
            </button>
          </div>
        )}
      </section>

      {segments.length > 0 && (
        <section className="rounded-2xl border border-[#C6E5E6] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#187D87]">
            Meeting transcript
          </h2>

          <p className="mt-1 text-xs text-[#89818B]">
            {segments.length} transcript segments
          </p>

          <div className="mt-5 space-y-4">
            {segments.map((segment, index) => (
              <div key={`${segment.start_seconds}-${index}`} className="border-b border-[#C6E5E6] pb-3 last:border-0">
                <p className="text-xs font-semibold text-[#269BA5]">
                  {segment.start_seconds.toFixed(1)}s – {segment.end_seconds.toFixed(1)}s
                </p>

                <p className="mt-1 text-sm leading-6 text-[#187D87]">
                  {segment.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}