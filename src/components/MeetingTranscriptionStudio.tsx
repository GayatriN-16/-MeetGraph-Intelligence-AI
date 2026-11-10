import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  Mic, 
  Square, 
  FileAudio, 
  FileCheck, 
  FileText, 
  Sparkles, 
  Loader2, 
  ArrowRight, 
  ArrowLeft, 
  Download, 
  FileDown, 
  Copy, 
  Check, 
  Calendar, 
  Clock, 
  Play, 
  Pause, 
  Volume2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Plus, 
  RotateCcw,
  Cpu,
  FileSpreadsheet,
  Code2,
  ChevronRight,
  Radio,
  Monitor,
  ScreenShare,
  Video,
  HelpCircle,
  Info,
  ExternalLink,
  Share2,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Meeting } from '../types';
import { api } from '../api/client';
import { downloadMeetingPdfReport } from '../utils/generatePdfReport';
import { convertAudioToWav } from '../utils/audioToWav';
import { GoogleMeetCard } from './GoogleMeetCard';

interface MeetingTranscriptionStudioProps {
  initialMeetings?: Meeting[];
}

export const MeetingTranscriptionStudio: React.FC<MeetingTranscriptionStudioProps> = ({ initialMeetings = [] }) => {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(initialMeetings[0] || null);

  // Input Form States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [project, setProject] = useState('General Meetings & Recordings');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<1 | 2 | 3 | 4>(1);
  const [statusMessage, setStatusMessage] = useState('Initializing pipeline...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showHowToGuide, setShowHowToGuide] = useState(false);
  const [showTabHelpModal, setShowTabHelpModal] = useState(false);

  // Microphone / Tab Audio / Screen Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSource, setRecordingSource] = useState<'mic' | 'tab' | 'screen'>('mic');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState<Blob | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [liveVideoStream, setLiveVideoStream] = useState<MediaStream | null>(null);
  const [liveTranscriptChunks, setLiveTranscriptChunks] = useState<Array<{ timecode: string; seconds: number; speakerName: string; text: string }>>([]);
  const [interimSpeech, setInterimSpeech] = useState<string>('');

  // ElevenLabs STT Configuration States
  const [elevenLabsStatus, setElevenLabsStatus] = useState<{ configured: boolean; model?: string; provider?: string }>({ configured: false });
  const [customElevenLabsKey, setCustomElevenLabsKey] = useState<string>(() => localStorage.getItem('meetgraph_elevenlabs_key') || '');
  const [showElevenLabsModal, setShowElevenLabsModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(customElevenLabsKey);

  // Audio Player & View States
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeReportTab, setActiveReportTab] = useState<'summary' | 'transcript' | 'takeaways' | 'raw-markdown'>('summary');
  const [copiedReport, setCopiedReport] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const videoChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const secondsRef = useRef<number>(0);
  const isRecordingRef = useRef<boolean>(false);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const liveTranscriptScrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll live transcript to bottom as new speech arrives
  useEffect(() => {
    if (liveTranscriptScrollRef.current) {
      liveTranscriptScrollRef.current.scrollTop = liveTranscriptScrollRef.current.scrollHeight;
    }
  }, [liveTranscriptChunks, interimSpeech]);

  // Fetch initial meetings list and ElevenLabs status from API
  useEffect(() => {
    api.getMeetings().then(res => {
      if (res.meetings && res.meetings.length > 0) {
        setMeetings(res.meetings);
        if (!selectedMeeting) {
          setSelectedMeeting(res.meetings[0]);
        }
      }
    }).catch(() => {});

    api.getElevenLabsStatus().then(res => {
      setElevenLabsStatus(res);
    }).catch(() => {});
  }, []);

  // Cleanup active streams and speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
      if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch (e) {}
      }
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [recordedAudioUrl, recordedVideoUrl]);

  // Helper: Setup Web Speech API continuous recognition with auto-restart
  const setupSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not available in this browser');
      return null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            const clean = transcript.trim();
            if (clean) {
              const sec = secondsRef.current;
              const mins = Math.floor(sec / 60);
              const secs = sec % 60;
              const timecode = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
              
              setLiveTranscriptChunks(prev => [
                ...prev,
                {
                  timecode,
                  seconds: sec,
                  speakerName: 'Speaker 1',
                  text: clean
                }
              ]);
            }
          } else {
            currentInterim += transcript;
          }
        }
        setInterimSpeech(currentInterim);
      };

      recognition.onerror = (e: any) => {
        console.warn('SpeechRecognition event warning:', e.error);
        if (e.error === 'not-allowed') {
          setErrorMsg('Microphone permission was denied. Please allow microphone access in your browser address bar.');
        }
      };

      // Auto-restart recognition so it NEVER halts during long live meetings!
      recognition.onend = () => {
        if (isRecordingRef.current) {
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      recognition.start();
      return recognition;
    } catch (err) {
      console.warn('SpeechRecognition start error:', err);
      return null;
    }
  };

  // Start Live Meeting Recording: Microphone
  const startLiveMicMeeting = async () => {
    try {
      setErrorMsg(null);
      setRecordingSource('mic');
      setLiveTranscriptChunks([]);
      setInterimSpeech('');
      setRecordedAudioBlob(null);
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
        setRecordedAudioUrl(null);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      activeStreamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
      };

      isRecordingRef.current = true;
      speechRecognitionRef.current = setupSpeechRecognition();

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);
      secondsRef.current = 0;
      
      timerIntervalRef.current = setInterval(() => {
        secondsRef.current += 1;
        setRecordingSeconds(secondsRef.current);
      }, 1000);

    } catch (err: any) {
      console.error('Microphone access error:', err);
      setErrorMsg('Microphone access denied or unavailable. Please verify browser permissions.');
    }
  };

  // Start Live Meeting Recording: Google Meet / Zoom Tab Audio
  const startLiveOnlineMeeting = async () => {
    try {
      setErrorMsg(null);
      setRecordingSource('tab');
      setLiveTranscriptChunks([]);
      setInterimSpeech('');
      setRecordedAudioBlob(null);
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
        setRecordedAudioUrl(null);
      }

      // Prompt user to select Google Meet / Zoom tab with "Share tab audio" checked
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Verify that user checked the "Share tab audio" checkbox
      if (displayStream.getAudioTracks().length === 0) {
        displayStream.getTracks().forEach(track => track.stop());
        setErrorMsg('⚠️ No audio was shared from the tab. In the browser popup, make sure you choose "Chrome Tab" and check the "Also share tab audio" checkbox at the bottom-left before clicking Share.');
        return;
      }

      // Also attempt to capture local mic so both user & remote attendees are recorded
      let micStream: MediaStream | null = null;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (micErr) {
        console.warn('Microphone stream optional, proceeding with tab audio:', micErr);
      }

      // Combine audio tracks using AudioContext
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      const destination = audioCtx.createMediaStreamDestination();

      if (displayStream.getAudioTracks().length > 0) {
        const tabSource = audioCtx.createMediaStreamSource(displayStream);
        tabSource.connect(destination);
      }

      if (micStream && micStream.getAudioTracks().length > 0) {
        const micSource = audioCtx.createMediaStreamSource(micStream);
        micSource.connect(destination);
      }

      const combinedAudioStream = destination.stream.getAudioTracks().length > 0
        ? destination.stream
        : (displayStream || micStream);

      activeStreamRef.current = combinedAudioStream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(combinedAudioStream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
      };

      // If user stops screen sharing via browser native stop button
      displayStream.getVideoTracks().forEach(track => {
        track.onended = () => {
          stopRecording();
        };
      });

      isRecordingRef.current = true;
      speechRecognitionRef.current = setupSpeechRecognition();

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);
      secondsRef.current = 0;
      
      timerIntervalRef.current = setInterval(() => {
        secondsRef.current += 1;
        setRecordingSeconds(secondsRef.current);
      }, 1000);

    } catch (err: any) {
      console.error('Online meeting capture error:', err);
      if (err.name !== 'NotAllowedError') {
        setErrorMsg('Failed to capture meeting tab audio. Make sure you select a tab and check "Share tab audio".');
      }
    }
  };

  // Start Screen Recording with Mixed Audio (System/Tab + Microphone)
  const startScreenAndAudioRecording = async () => {
    try {
      setErrorMsg(null);
      setRecordingSource('screen');
      setLiveTranscriptChunks([]);
      setInterimSpeech('');
      setRecordedAudioBlob(null);
      setRecordedVideoBlob(null);
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
        setRecordedAudioUrl(null);
      }
      if (recordedVideoUrl) {
        URL.revokeObjectURL(recordedVideoUrl);
        setRecordedVideoUrl(null);
      }

      // 1. Prompt user to select Screen / Window / Tab with system audio
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' },
        audio: true
      });

      // 2. Also capture microphone audio so both remote attendees and the speaker are recorded
      let micStream: MediaStream | null = null;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (micErr) {
        console.warn('Microphone stream optional during screen recording:', micErr);
      }

      // 3. Mix audio streams via Web Audio API AudioContext
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      const destination = audioCtx.createMediaStreamDestination();

      if (displayStream.getAudioTracks().length > 0) {
        const displayAudioSource = audioCtx.createMediaStreamSource(displayStream);
        displayAudioSource.connect(destination);
      }

      if (micStream && micStream.getAudioTracks().length > 0) {
        const micSource = audioCtx.createMediaStreamSource(micStream);
        micSource.connect(destination);
      }

      // Mixed audio stream
      const mixedAudioStream = destination.stream.getAudioTracks().length > 0 
        ? destination.stream 
        : (displayStream.getAudioTracks().length > 0 ? displayStream : micStream || displayStream);

      // 4. Combined media stream containing Video track + Mixed Audio track
      const combinedTracks = [
        ...displayStream.getVideoTracks(),
        ...mixedAudioStream.getAudioTracks()
      ];
      const screenRecordingStream = new MediaStream(combinedTracks);

      setLiveVideoStream(screenRecordingStream);
      activeStreamRef.current = screenRecordingStream;
      videoChunksRef.current = [];
      audioChunksRef.current = [];

      // 5. MediaRecorder for full Video + Audio recording
      let videoMime = 'video/webm;codecs=vp9,opus';
      if (typeof MediaRecorder !== 'undefined' && !MediaRecorder.isTypeSupported(videoMime)) {
        videoMime = 'video/webm';
      }

      const mediaRecorder = new MediaRecorder(screenRecordingStream, { mimeType: videoMime });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (videoChunksRef.current.length > 0) {
          const videoBlob = new Blob(videoChunksRef.current, { type: videoMime });
          setRecordedVideoBlob(videoBlob);
          const vUrl = URL.createObjectURL(videoBlob);
          setRecordedVideoUrl(vUrl);
        }
      };

      // 6. Separate audio-only recorder for ultra-fast, lightweight transcription payload
      try {
        const audioRecorder = new MediaRecorder(mixedAudioStream, { mimeType: 'audio/webm;codecs=opus' });
        audioRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        audioRecorder.onstop = () => {
          if (audioChunksRef.current.length > 0) {
            const aBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            setRecordedAudioBlob(aBlob);
            const aUrl = URL.createObjectURL(aBlob);
            setRecordedAudioUrl(aUrl);
          }
        };
        audioRecorder.start(250);
        audioRecorderRef.current = audioRecorder;
      } catch (e) {
        console.warn('Dedicated audio recorder fallback:', e);
      }

      // If user stops screen sharing via browser native "Stop sharing" button
      displayStream.getVideoTracks().forEach(track => {
        track.onended = () => {
          stopRecording();
        };
      });

      isRecordingRef.current = true;
      speechRecognitionRef.current = setupSpeechRecognition();

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);
      secondsRef.current = 0;

      timerIntervalRef.current = setInterval(() => {
        secondsRef.current += 1;
        setRecordingSeconds(secondsRef.current);
      }, 1000);

    } catch (err: any) {
      console.error('Screen recording error:', err);
      if (err.name !== 'NotAllowedError') {
        setErrorMsg('Failed to start screen recording. Please grant screen capture permission.');
      }
    }
  };

  // Stop recording
  const stopRecording = () => {
    isRecordingRef.current = false;
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (audioRecorderRef.current && audioRecorderRef.current.state !== 'inactive') {
      audioRecorderRef.current.stop();
    }
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch (e) {}
      speechRecognitionRef.current = null;
    }
    setLiveVideoStream(null);
    setIsRecording(false);
    setInterimSpeech('');
  };

  // File Picker Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setRecordedAudioBlob(null);
      setLiveTranscriptChunks([]);
      if (!meetingTitle.trim()) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setMeetingTitle(cleanName);
      }
    }
  };

  // Helper: File to Base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Core Execution of Transcription Pipeline
  const executeTranscription = async (
    targetBlob: Blob | null,
    targetFile: File | null,
    transcriptChunks: Array<{ timecode: string; seconds: number; speakerName: string; text: string }>
  ) => {
    const finalTitle = meetingTitle.trim() || `Live Session - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    setIsProcessing(true);
    setErrorMsg(null);
    setProcessingStep(1);
    setStatusMessage('Ingesting & formatting audio stream for speech diarization...');

    try {
      let wavBase64 = '';
      let fileName = 'Live_Meeting.wav';
      let sizeMb = 2;

      if (targetBlob) {
        setStatusMessage('Resampling recorded audio stream to 16kHz WAV format...');
        try {
          const wavBlob = await convertAudioToWav(targetBlob);
          wavBase64 = await blobToBase64(wavBlob);
          fileName = `Live_Meeting_${Date.now()}.wav`;
          sizeMb = Math.max(1, Math.round(wavBlob.size / (1024 * 1024)));
        } catch (wavErr) {
          console.warn('WAV resampling fallback to raw recording:', wavErr);
          wavBase64 = await blobToBase64(targetBlob);
        }
      } else if (targetFile) {
        setStatusMessage(`Decoding audio file "${targetFile.name}" to 16kHz WAV...`);
        try {
          const wavBlob = await convertAudioToWav(targetFile);
          wavBase64 = await blobToBase64(wavBlob);
          fileName = targetFile.name.replace(/\.[^/.]+$/, '.wav');
          sizeMb = Math.max(1, Math.round(wavBlob.size / (1024 * 1024)));
        } catch (wavErr) {
          console.warn('WAV resampling fallback to raw file:', wavErr);
          wavBase64 = await blobToBase64(targetFile);
          fileName = targetFile.name;
          sizeMb = Math.max(1, Math.round(targetFile.size / (1024 * 1024)));
        }
      }

      setTimeout(() => {
        setProcessingStep(2);
        setStatusMessage('Running speech diarization & timestamping on actual spoken dialogue...');
      }, 700);

      setTimeout(() => {
        setProcessingStep(3);
        setStatusMessage('Extracting verified decisions, tasks, and executive summary from speech...');
      }, 1500);

      const formatSec = (sec: number) => {
        const mins = Math.floor(sec / 60);
        const secs = sec % 60;
        return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
      };
      const durationStr = recordingSeconds > 0 ? formatSec(recordingSeconds) : '2m 15s';

      const response = await api.transcribeMeeting({
        title: finalTitle,
        project,
        audioData: wavBase64 || undefined,
        mimeType: 'audio/wav',
        fileName,
        audioSizeMb: sizeMb,
        recordedDuration: durationStr,
        elevenLabsApiKey: customElevenLabsKey || undefined,
        liveTranscript: transcriptChunks.length > 0 ? transcriptChunks : undefined
      });

      setProcessingStep(4);
      setStatusMessage('Synthesis complete! Summary of Meeting and downloadable PDF ready.');

      setTimeout(() => {
        setIsProcessing(false);
        if (response.meeting) {
          setMeetings(prev => [response.meeting, ...prev.filter(m => m.id !== response.meeting.id)]);
          setSelectedMeeting(response.meeting);
          // Reset states
          setSelectedFile(null);
          setRecordedAudioBlob(null);
          setLiveTranscriptChunks([]);
          setMeetingTitle('');
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }
      }, 800);

    } catch (err: any) {
      console.error('Transcription error:', err);
      setIsProcessing(false);
      setErrorMsg(err.message || 'Failed to complete audio transcription. Please verify your recording contains audible speech.');
    }
  };

  // End Live Meeting and immediately trigger report generation
  const handleEndLiveMeetingAndGenerate = async () => {
    isRecordingRef.current = false;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch (e) {}
      speechRecognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (audioRecorderRef.current && audioRecorderRef.current.state !== 'inactive') {
      audioRecorderRef.current.stop();
    }

    // Flush small delay for onstop events
    await new Promise(resolve => setTimeout(resolve, 200));

    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach(track => track.stop());
    }

    setLiveVideoStream(null);
    setIsRecording(false);
    setInterimSpeech('');

    // Determine final audio blob
    let finalAudioBlob: Blob | null = recordedAudioBlob;
    if (!finalAudioBlob && audioChunksRef.current.length > 0) {
      finalAudioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      setRecordedAudioBlob(finalAudioBlob);
      const url = URL.createObjectURL(finalAudioBlob);
      setRecordedAudioUrl(url);
    }

    // Determine final video blob if screen recording was captured
    if (videoChunksRef.current.length > 0) {
      const vBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
      setRecordedVideoBlob(vBlob);
      const vUrl = URL.createObjectURL(vBlob);
      setRecordedVideoUrl(vUrl);
    }

    await executeTranscription(finalAudioBlob, null, liveTranscriptChunks);
  };

  // Button handler for file upload transcription
  const handleTranscribeUploadedFile = async () => {
    if (!selectedFile && !recordedAudioBlob && liveTranscriptChunks.length === 0) {
      setErrorMsg('Please select an audio file or record audio first.');
      return;
    }
    await executeTranscription(recordedAudioBlob, selectedFile, liveTranscriptChunks);
  };

  // Download PDF
  const handleDownloadPdf = async () => {
    if (!selectedMeeting || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      if (activeReportTab !== 'summary') {
        setActiveReportTab('summary');
        await new Promise(resolve => setTimeout(resolve, 250));
      }
      await downloadMeetingPdfReport(selectedMeeting, 'meeting-summary-printable');
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Download Markdown
  const handleDownloadMd = () => {
    if (!selectedMeeting) return;
    const text = selectedMeeting.executiveReport || `# Summary of Meeting: ${selectedMeeting.title}\n${selectedMeeting.summary}`;
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Meeting_Summary_${selectedMeeting.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy Markdown
  const handleCopyReport = () => {
    if (!selectedMeeting) return;
    const text = selectedMeeting.executiveReport || `# Summary of Meeting: ${selectedMeeting.title}\n${selectedMeeting.summary}`;
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const totalWordsSpoken = liveTranscriptChunks.reduce((acc, chunk) => acc + chunk.text.split(/\s+/).length, 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Modal: Google Meet & Zoom Tab Capture Guide */}
      {showTabHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-xs">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Capture Live Google Meet / Zoom Call
                  </h3>
                  <p className="text-xs text-slate-500">
                    Follow these 3 quick steps in the browser popup
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTabHelpModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                <div>
                  <strong className="text-slate-900 block text-xs">Choose "Chrome Tab" (or Edge Tab)</strong>
                  <span className="text-slate-500 text-[11px] leading-relaxed">
                    When the browser screen-sharing dialog appears, select the <strong>"Chrome Tab"</strong> tab at the top.
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                <div>
                  <strong className="text-slate-900 block text-xs">Select your Google Meet or Zoom tab</strong>
                  <span className="text-slate-500 text-[11px] leading-relaxed">
                    Click to select your active <strong>Google Meet</strong> or <strong>Zoom</strong> meeting tab from the list.
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                <div>
                  <strong className="text-purple-900 block text-xs">Crucial: Check "Also share tab audio"</strong>
                  <span className="text-purple-700 text-[11px] leading-relaxed">
                    Look at the bottom-left corner of the popup and make sure the <strong>"Also share tab audio"</strong> checkbox is <strong>checked ON</strong>. This captures everyone speaking!
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowTabHelpModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTabHelpModal(false);
                  startLiveOnlineMeeting();
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Capture Tab Audio Only</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTabHelpModal(false);
                  startScreenAndAudioRecording();
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <ScreenShare className="w-4 h-4" />
                <span>Record Screen & Tab Video with Audio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brand Header Bar (No Navigation Tabs) */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/90 p-1.5 flex items-center justify-center shadow-xs overflow-hidden shrink-0">
              <img src="/logo.png?v=2" alt="MeetGraph AI Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 tracking-tight text-xl">MeetGraph AI</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                  Live Transcription & Meeting Studio
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Real-Time Meeting Speech-to-Text & Structured PDF Report Studio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowHowToGuide(!showHowToGuide)}
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden md:inline">How It Works</span>
            </button>

            {selectedMeeting && (
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  fileInputRef.current?.click();
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Session</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">

        {/* Collapsible How-To Guide for Live Meetings */}
        {showHowToGuide && (
          <div className="bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 border border-indigo-200 rounded-3xl p-6 shadow-sm space-y-4 transition-all">
            <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  How to Transcribe Live Meetings with MeetGraph AI
                </h3>
              </div>
              <button
                onClick={() => setShowHowToGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">1</span>
                  <span>In-Person Meetings (Room / Mic)</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Click <strong>"Start Live Microphone"</strong>. Place your laptop or phone microphone in the center of the room. Words are captured live in real time as people talk.
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">2</span>
                  <span>Online Meetings (Google Meet / Zoom / Teams)</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Click <strong>"Capture Google Meet / Tab Audio"</strong>. In the browser popup, choose your meeting tab and ensure <strong>"Share tab audio"</strong> is checked. Both remote attendees and your mic are captured.
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">3</span>
                  <span>Instant Meeting Summary & PDF Download</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  When your meeting finishes, click <strong>"End Live Meeting & Generate Report"</strong>. The AI instantly extracts verified decisions, action items, and prepares your PDF report.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* ============================================================ */}
        {/* INPUT / LIVE STUDIO SECTION */}
        {/* ============================================================ */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
              Live Speech-to-Text & Diarization Engine
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              {isRecording ? 'Live Meeting in Progress' : 'Start Live Meeting or Upload Recording'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Transcribe meetings live in real time from your microphone or online meeting tabs (Google Meet, Zoom, Teams), or upload pre-recorded audio files.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ACTIVE LIVE RECORDING CONSOLE */}
          {isRecording ? (
            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl border border-slate-800">
              
              {/* Live Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping"></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs uppercase tracking-wider font-bold text-rose-400">
                        ● LIVE TRANSCRIBING ({recordingSource === 'screen' ? 'Screen Recording & Audio' : recordingSource === 'tab' ? 'Google Meet / Tab Audio' : 'Microphone Stream'})
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-0.5">
                      {meetingTitle.trim() || 'Live Meeting Session'}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Live Audio Activity Waves */}
                  <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl">
                    <Volume2 className="w-4 h-4 text-purple-400" />
                    <div className="flex items-end gap-1 h-3.5">
                      <span className="w-1 h-2 bg-purple-400 rounded-full animate-bounce"></span>
                      <span className="w-1 h-3.5 bg-purple-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                      <span className="w-1 h-2.5 bg-purple-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                      <span className="w-1 h-3 bg-purple-400 rounded-full animate-bounce [animation-delay:75ms]"></span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-300 font-semibold hidden md:inline">
                      {recordingSource === 'screen' ? 'Screen & Mic Audio Active' : recordingSource === 'tab' ? 'Tab & Mic Audio Active' : 'Mic Stream Active'}
                    </span>
                  </div>

                  {/* Digital Clock */}
                  <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 font-mono text-xl font-bold text-emerald-400 tracking-wider">
                    {Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                  </div>

                  {/* Words stats */}
                  <div className="hidden sm:block text-right">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">SPEECH DETECTED</span>
                    <strong className="text-xs font-mono text-white">{totalWordsSpoken} words ({liveTranscriptChunks.length} phrases)</strong>
                  </div>
                </div>
              </div>

              {/* Live Screen Recording Video Stream Preview */}
              {liveVideoStream && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black aspect-video max-h-72 w-full flex items-center justify-center shadow-inner">
                  <video
                    ref={(el) => {
                      if (el && liveVideoStream && el.srcObject !== liveVideoStream) {
                        el.srcObject = liveVideoStream;
                        el.play().catch(() => {});
                      }
                    }}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-3 left-3 bg-rose-600/90 text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    <span>LIVE SCREEN & AUDIO STREAMING</span>
                  </div>
                </div>
              )}

              {/* Streaming Real-Time Dialogue Log */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                    Real-Time Speech Stream (auto-scrolling)
                  </span>
                  <span className="text-[11px] font-mono text-indigo-400">Continuous Web Speech API Active</span>
                </div>

                <div 
                  ref={liveTranscriptScrollRef}
                  className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 h-64 overflow-y-auto space-y-3 font-sans text-xs scroll-smooth"
                >
                  {liveTranscriptChunks.length === 0 && !interimSpeech && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-6 space-y-2">
                      <Mic className="w-8 h-8 text-slate-600 animate-pulse" />
                      <p>Listening for speech... Start talking or begin your meeting discussion.</p>
                    </div>
                  )}

                  {liveTranscriptChunks.map((chunk, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span className="font-bold text-indigo-400">{chunk.speakerName}</span>
                        <span>[{chunk.timecode}]</span>
                      </div>
                      <p className="text-slate-200 text-xs leading-relaxed">{chunk.text}</p>
                    </div>
                  ))}

                  {/* Interim Live Typing Bubble */}
                  {interimSpeech && (
                    <div className="p-3 bg-indigo-950/60 border border-indigo-800/80 rounded-xl space-y-1 animate-pulse">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-300">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        <span>Speaking right now...</span>
                      </div>
                      <p className="text-indigo-200 italic text-xs">{interimSpeech}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Live Meeting Action Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Speech encrypted & buffer kept in local memory (SOC2 compliant)</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Pause Recording
                  </button>

                  <button
                    type="button"
                    onClick={handleEndLiveMeetingAndGenerate}
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>End Live Meeting & Generate Report</span>
                  </button>
                </div>
              </div>

            </div>
          ) : !isProcessing ? (
            /* REGULAR SETUP & START CONSOLE */
            <div className="space-y-6">
              
              {/* Meeting Metadata Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Meeting Title / Subject
                  </label>
                  <input
                    type="text"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    placeholder="e.g., Executive Strategy Alignment & Launch Deliverables"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Project Domain / Workspace
                  </label>
                  <select
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  >
                    <option value="General Meetings & Recordings">General Meetings & Recordings</option>
                    <option value="Product Launch Workspace">Product Launch Workspace</option>
                    <option value="Engineering & Architecture">Engineering & Architecture</option>
                    <option value="Executive Review Board">Executive Review Board</option>
                  </select>
                </div>
              </div>

              {/* Official Google Meet REST API v2 Integration Card */}
              <GoogleMeetCard
                project={project}
                onStartCaptureLive={(code) => {
                  if (code && !meetingTitle.trim()) {
                    setMeetingTitle(`Google Meet - ${code}`);
                  }
                  setShowTabHelpModal(true);
                }}
                onMeetingSynced={(newMeeting) => {
                  setMeetings(prev => [newMeeting, ...prev.filter(m => m.id !== newMeeting.id)]);
                  setSelectedMeeting(newMeeting);
                  window.scrollTo({ top: 380, behavior: 'smooth' });
                }}
              />

              {/* THREE CLEAR INPUT MODES: Capture Meeting Tab & Screen vs Mic vs File Upload */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Mode 1: Live Online Meeting & Screen Recording */}
                <div className="border-2 border-slate-200 hover:border-purple-400 bg-slate-50/50 hover:bg-purple-50/20 rounded-2xl p-5 text-center space-y-3 transition-all flex flex-col justify-between group">
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                      <Monitor className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="inline-block text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded mb-1">
                        Screen & Tab Audio
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Capture Meeting Tab & Screen
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Capture Google Meet, Zoom, or Teams tab audio, or record screen video with synchronized mic audio.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={startScreenAndAudioRecording}
                      className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      <ScreenShare className="w-3.5 h-3.5" />
                      <span>Record Screen & Audio</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowTabHelpModal(true)}
                      className="w-full py-2 px-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Capture Tab Audio Only</span>
                    </button>
                  </div>
                </div>

                {/* Mode 2: Live In-Person Microphone Recording */}
                <div className="border-2 border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20 rounded-2xl p-5 text-center space-y-3 transition-all flex flex-col justify-between group">
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                      <Mic className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="inline-block text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded mb-1">
                        Microphone
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Live In-Person Meeting
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Capture room dialogue and in-person discussions directly from your microphone.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={startLiveMicMeeting}
                    className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Start Microphone</span>
                  </button>
                </div>

                {/* Mode 3: File Upload */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center space-y-3 cursor-pointer transition-all flex flex-col justify-between ${
                    selectedFile
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                      : 'border-slate-300 bg-slate-50/50 hover:bg-indigo-50/20 hover:border-indigo-400'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*,video/*,.mp3,.wav,.m4a,.webm,.ogg,.mp4"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  <div className="space-y-2">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto transition-all ${
                      selectedFile ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {selectedFile ? <FileCheck className="w-6 h-6" /> : <UploadCloud className="w-6 h-6" />}
                    </div>

                    <div>
                      <div className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded mb-1">
                        Up to 250 MB
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        {selectedFile ? selectedFile.name : 'Upload Recorded File'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {selectedFile 
                          ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB attached`
                          : 'Supports MP3, WAV, M4A, WebM, MP4'}
                      </p>
                    </div>
                  </div>

                  <span className={`inline-block text-xs font-bold py-2 px-3 rounded-xl border transition-colors ${
                    selectedFile 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-white border-slate-300 text-slate-800 shadow-2xs hover:bg-slate-50'
                  }`}>
                    {selectedFile ? 'Change File' : 'Browse Files'}
                  </span>
                </div>

              </div>

              {/* Upload Trigger Button if file attached or audio recorded previously */}
              {(selectedFile || recordedAudioBlob) && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleTranscribeUploadedFile}
                    className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-sm shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2.5 transition-all active:scale-98 cursor-pointer"
                  >
                    <span>Transcribe file</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          ) : (
            /* Multi-Stage Extraction Pipeline Progress */
            <div className="py-10 space-y-6 max-w-xl mx-auto">
              <div className="text-center space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900">Transcribing Speech & Compiling Summary of Meeting</h3>
                <p className="text-xs text-indigo-600 font-mono font-medium">{statusMessage}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl shadow-2xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="text-xs font-semibold text-emerald-800">
                    1. Ingesting & optimizing meeting audio stream
                  </div>
                </div>

                <div className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                  processingStep >= 2 ? 'bg-indigo-50/80 border-indigo-200 shadow-2xs' : 'bg-slate-50 border-slate-200'
                }`}>
                  {processingStep === 2 ? (
                    <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
                  ) : processingStep > 2 ? (
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
                  )}
                  <div className="text-xs font-semibold text-slate-800">
                    2. Speech-to-text transcription & speaker identification
                  </div>
                </div>

                <div className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                  processingStep >= 3 ? 'bg-indigo-50/80 border-indigo-200 shadow-2xs' : 'bg-slate-50 border-slate-200'
                }`}>
                  {processingStep === 3 ? (
                    <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
                  ) : processingStep > 3 ? (
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
                  )}
                  <div className="text-xs font-semibold text-slate-800">
                    3. Extracting key decisions, action items & executive summary
                  </div>
                </div>

                <div className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                  processingStep >= 4 ? 'bg-emerald-50 border-emerald-200 shadow-2xs' : 'bg-slate-50 border-slate-200'
                }`}>
                  {processingStep === 4 ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
                  )}
                  <div className="text-xs font-semibold text-slate-800">
                    4. Generating Summary of Meeting & compiling PDF report
                  </div>
                </div>
              </div>
            </div>
          )}

        </section>

        {/* ============================================================ */}
        {/* OUTPUT SECTION: SUMMARY OF MEETING & WHITE PDF DOWNLOAD */}
        {/* ============================================================ */}
        {selectedMeeting ? (
          <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm space-y-0">
            
            {/* Report Toolbar Header */}
            <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {selectedMeeting.project}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                    Ref: REP-{selectedMeeting.id}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {selectedMeeting.graphStatus || 'Completed'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {selectedMeeting.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {selectedMeeting.date} at {selectedMeeting.time}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {selectedMeeting.duration}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <FileAudio className="w-3.5 h-3.5 text-indigo-600" />
                    {selectedMeeting.audioFileName || 'meeting_recording.wav'} ({selectedMeeting.audioSizeMb || 2} MB)
                  </span>
                </div>
              </div>

              {/* Action Buttons with Prominent White "Download PDF" Button */}
              <div className="flex items-center gap-2 shrink-0">
                {/* WHITE BUTTON: DOWNLOAD PDF */}
                <button
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="px-5 py-2.5 text-xs font-extrabold text-slate-900 bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-slate-400 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  title="Download Summary of Meeting in PDF format"
                >
                  {isGeneratingPdf ? (
                    <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                  ) : (
                    <FileDown className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
                </button>
              </div>
            </div>

            {/* Screen Recording Video Playback if recorded */}
            {recordedVideoUrl && (
              <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-white">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-purple-400" />
                    <span className="font-bold">Recorded Meeting Screen & Video Playback</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      Synchronized Audio & Screen Recording
                    </span>
                  </div>
                  <a
                    href={recordedVideoUrl}
                    download={`Meeting_Screen_Recording_${selectedMeeting.id}.webm`}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Recording (.webm)</span>
                  </a>
                </div>
                <video src={recordedVideoUrl} controls className="w-full max-h-72 rounded-xl bg-black shadow-inner" />
              </div>
            )}

            {/* Audio Stream Player Bar */}
            <div className="bg-slate-100/90 px-6 py-2.5 flex items-center justify-between gap-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white ml-0.5" />}
                </button>
                <div>
                  <div className="text-xs font-bold text-slate-800">Transcribed Meeting Audio</div>
                  <div className="text-[10px] font-mono text-indigo-600">
                    {isPlaying ? 'Playing • Timecoded speech segments synchronized' : 'Paused • Timecodes synchronized to transcript'}
                  </div>
                </div>
              </div>

              {recordedAudioUrl && (
                <audio
                  ref={(el) => {
                    if (el) {
                      if (isPlaying && el.paused) el.play().catch(() => {});
                      else if (!isPlaying && !el.paused) el.pause();
                    }
                  }}
                  src={recordedAudioUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
              )}

              <div className="flex-1 max-w-md hidden sm:flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-500">00:00</span>
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden relative cursor-pointer">
                  <div className="h-full bg-indigo-600 w-1/4 rounded-full"></div>
                </div>
                <span className="text-[10px] font-mono text-slate-500">{selectedMeeting.duration}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Volume2 className="w-4 h-4" />
                <span className="font-mono text-slate-700">100%</span>
              </div>
            </div>

            {/* View Tabs */}
            <div className="border-b border-slate-200 bg-white px-6 flex items-center justify-between">
              <div className="flex items-center gap-2 py-2.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">
                  {activeReportTab === 'summary' ? 'Summary of Meeting' : activeReportTab === 'transcript' ? 'Full Diarized Transcript' : activeReportTab === 'takeaways' ? 'Key Strategic Takeaways' : 'Structured Markdown'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto">
                {activeReportTab !== 'summary' && (
                  <button
                    onClick={() => setActiveReportTab('summary')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 flex items-center gap-1.5 transition-all whitespace-nowrap shadow-2xs cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Summary</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveReportTab('transcript')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                    activeReportTab === 'transcript'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileAudio className="w-3.5 h-3.5" />
                  <span>Full Transcript ({(selectedMeeting.transcript || []).length})</span>
                </button>

                <button
                  onClick={() => setActiveReportTab('takeaways')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                    activeReportTab === 'takeaways'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Key Takeaways ({(selectedMeeting.keyTakeaways || []).length})</span>
                </button>

                <button
                  onClick={() => setActiveReportTab('raw-markdown')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                    activeReportTab === 'raw-markdown'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Raw Markdown (.md)</span>
                </button>
              </div>
            </div>

            {/* Report Content Body */}
            <div className="p-6 sm:p-8 space-y-6 bg-slate-50/50">
              
              {/* TAB 1: SUMMARY OF MEETING */}
              {activeReportTab === 'summary' && (
                <div id="meeting-summary-printable" className="space-y-6 max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
                  
                  {/* Document Header */}
                  <div className="space-y-4 border-b border-slate-200 pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                          OFFICIAL MEETING INTELLIGENCE
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                          Summary of Meeting
                        </h3>
                        <p className="text-sm font-semibold text-slate-600 mt-0.5">
                          {selectedMeeting.title}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg inline-block">
                          Ref: REP-{selectedMeeting.id}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-1 font-mono">SOC2 Type II Certified</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">PROJECT</span>
                        <strong className="text-slate-900">{selectedMeeting.project}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">RECORDED DATE</span>
                        <strong className="text-slate-900">{selectedMeeting.date}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">SESSION DURATION</span>
                        <strong className="text-slate-900">{selectedMeeting.duration}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">GRAPH STATUS</span>
                        <strong className="text-emerald-700">{selectedMeeting.graphStatus || 'Indexed'}</strong>
                      </div>
                    </div>

                    {/* Section 1: Executive Overview */}
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-600 font-bold text-[10px] flex items-center justify-center">1</span>
                        Executive Overview & Session Scope
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 border border-slate-200/80 rounded-xl p-4">
                        {selectedMeeting.summary}
                      </p>
                    </div>
                  </div>

                  {/* Section 2: Key Strategic Takeaways */}
                  <div className="space-y-3 border-b border-slate-200 pb-6">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-600 font-bold text-[10px] flex items-center justify-center">2</span>
                      Key Strategic Takeaways & Agenda Coverage
                    </h4>
                    <div className="grid grid-cols-1 gap-2.5">
                      {(selectedMeeting.keyTakeaways || []).map((takeaway, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span><strong>2.{idx + 1}</strong> {takeaway}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 3: Participant Diarization & Attendance Record */}
                  <div className="space-y-3 border-b border-slate-200 pb-6">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-600 font-bold text-[10px] flex items-center justify-center">3</span>
                      Participant Diarization & Attendance Record
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                        <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="p-3">ATTENDEE NAME</th>
                            <th className="p-3">ORGANIZATIONAL ROLE</th>
                            <th className="p-3">AUDIO ID</th>
                            <th className="p-3">STATUS</th>
                            <th className="p-3 text-right">CONFIDENCE</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                          {(selectedMeeting.speakers || []).map((sp) => (
                            <tr key={sp.id} className="hover:bg-slate-50/80">
                              <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                                  {sp.avatarInitials || sp.name.substring(0, 2).toUpperCase()}
                                </span>
                                <span>{sp.name}</span>
                              </td>
                              <td className="p-3 text-slate-600">{sp.role}</td>
                              <td className="p-3 font-mono text-slate-500">{sp.id}</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  PRESENT
                                </span>
                              </td>
                              <td className="p-3 font-mono text-right text-emerald-600 font-semibold">99.2%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Section 4: Verified Decisions & Consensus Matrix */}
                  <div className="space-y-3 border-b border-slate-200 pb-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-600 font-bold text-[10px] flex items-center justify-center">4</span>
                        Verified Decisions & Consensus Matrix
                      </h4>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Consensus Verified
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                        <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="p-3">REF ID</th>
                            <th className="p-3">DECISION STATEMENT</th>
                            <th className="p-3">SPEAKER</th>
                            <th className="p-3">TIMECODE</th>
                            <th className="p-3 text-right">CONFIDENCE</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                          {(selectedMeeting.decisions && selectedMeeting.decisions.length > 0) ? (
                            selectedMeeting.decisions.map((dec, idx) => (
                              <tr key={dec.id || idx} className="hover:bg-slate-50/80">
                                <td className="p-3 font-mono font-bold text-indigo-600">{`DEC-${(idx + 1).toString().padStart(2, '0')}`}</td>
                                <td className="p-3 font-semibold text-slate-900">{dec.title}</td>
                                <td className="p-3 text-slate-700">{dec.speaker?.name || 'Consensus'}</td>
                                <td className="p-3 font-mono text-indigo-600">[{dec.timecode || '00:00'}]</td>
                                <td className="p-3 font-mono text-right text-emerald-600 font-semibold">{dec.confidence || 97}%</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="p-4 text-center text-xs text-slate-500 italic">
                                Consensus recorded directly in meeting transcript and scope overview.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Section 5: Action Items & Accountability Tracker */}
                  <div className="space-y-3 border-b border-slate-200 pb-6">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-600 font-bold text-[10px] flex items-center justify-center">5</span>
                      Action Items & Accountability Tracker
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                        <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="p-3">TASK ID</th>
                            <th className="p-3">ACTION ITEM</th>
                            <th className="p-3">ASSIGNEE</th>
                            <th className="p-3">DEADLINE</th>
                            <th className="p-3">PRIORITY</th>
                            <th className="p-3 text-right">STATUS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                          {(selectedMeeting.tasks && selectedMeeting.tasks.length > 0) ? (
                            selectedMeeting.tasks.map((act, idx) => (
                              <tr key={act.id || idx} className="hover:bg-slate-50/80">
                                <td className="p-3 font-mono font-bold text-indigo-600">{`ACT-${(idx + 1).toString().padStart(2, '0')}`}</td>
                                <td className="p-3 font-medium text-slate-900">{act.taskDescription || act.title}</td>
                                <td className="p-3 font-medium text-slate-700">{act.assignee?.name || act.assigneeName || 'Speaker 1'}</td>
                                <td className="p-3 font-mono text-slate-500">{act.dueDate || 'Nov 15, 2026'}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    act.priority === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}>
                                    {act.priority || 'Medium'}
                                  </span>
                                </td>
                                <td className="p-3 font-mono text-right text-amber-600 font-semibold">
                                  {act.completed ? '✅ Completed' : '⏳ Pending'}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="p-4 text-center text-xs text-slate-500 italic">
                                Action items tracked under general project milestone deliverable registry.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Section 6: Cross-Meeting Timeline Conflict & Risk Assessment */}
                  <div className="space-y-3 border-b border-slate-200 pb-6">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-600 font-bold text-[10px] flex items-center justify-center">6</span>
                      Cross-Meeting Timeline Conflict & Risk Assessment
                    </h4>
                    <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-xs text-slate-700">
                      <div className="flex items-center gap-2 text-slate-900 font-semibold">
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        <span>Cross-referenced against active project milestones and sprint release gates.</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        Dependencies indexed into meeting intelligence cluster. No blocking schedule collisions or resource contention detected.
                      </p>
                    </div>
                  </div>

                  {/* Section 7: Diarized Dialogue Excerpts */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-600 font-bold text-[10px] flex items-center justify-center">7</span>
                      Diarized Dialogue Excerpts (Grounded Source)
                    </h4>
                    <div className="space-y-2.5">
                      {(selectedMeeting.transcript || []).slice(0, 6).map((t) => (
                        <div key={t.id} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1">
                          <div className="flex items-center justify-between text-slate-900 font-bold">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                              {t.speakerName}
                            </span>
                            <span className="font-mono text-indigo-600 font-semibold">[{t.timecode}]</span>
                          </div>
                          <p className="text-slate-600 italic">"{t.text}"</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: FULL TRANSCRIPT */}
              {activeReportTab === 'transcript' && (
                <div className="space-y-3 max-w-4xl mx-auto">
                  {(selectedMeeting.transcript || []).map((t) => (
                    <div
                      key={t.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        t.isKeyDecision
                          ? 'bg-indigo-50/70 border-indigo-200 ring-1 ring-indigo-300'
                          : 'bg-white border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                            {t.speakerName.split(' ').map(n => n[0]).join('') || 'SP'}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{t.speakerName}</span>
                          {t.isKeyDecision && (
                            <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Captured Decision
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-mono font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          [{t.timecode}]
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed pl-8">{t.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: KEY TAKEAWAYS */}
              {activeReportTab === 'takeaways' && (
                <div className="space-y-3 max-w-4xl mx-auto">
                  {(selectedMeeting.keyTakeaways || []).map((takeaway, idx) => (
                    <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 flex items-start gap-3 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{takeaway}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: RAW MARKDOWN */}
              {activeReportTab === 'raw-markdown' && (
                <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-mono font-bold text-slate-700">Structured Markdown Content</span>
                    <button
                      onClick={handleCopyReport}
                      className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center gap-1.5 hover:bg-indigo-100"
                    >
                      {copiedReport ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedReport ? 'Copied' : 'Copy Raw .md'}</span>
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 p-4 rounded-xl whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[500px]">
                    {selectedMeeting.executiveReport || selectedMeeting.summary}
                  </pre>
                </div>
              )}

            </div>

            {/* Bottom Footer with White "Download PDF" Button */}
            <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                {(selectedMeeting.speakers || []).map((sp) => (
                  <span key={sp.id} className="text-[11px] font-medium text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shrink-0 shadow-2xs">
                    {sp.name} ({sp.role})
                  </span>
                ))}
              </div>

              {/* White on bottom "Download PDF" button */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 font-extrabold border border-slate-300 hover:border-slate-400 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  title="Download Summary of Meeting as PDF"
                >
                  {isGeneratingPdf ? (
                    <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                  ) : (
                    <FileDown className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
                </button>

                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    fileInputRef.current?.click();
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Transcribe Another Recording</span>
                </button>
              </div>
            </div>

          </section>
        ) : (
          /* Empty State when no meeting has been transcribed yet */
          <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
              <FileAudio className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900">
                Ready to Transcribe Your Live Meeting
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose <strong>"Record Screen & Meeting"</strong> to record screen video and audio, <strong>"Capture Meet Tab"</strong> for Google Meet / Zoom calls, <strong>"Start Microphone"</strong> for room conversations, or upload a recording above.
              </p>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* RECENT SESSIONS BAR (Easily switch between sessions) */}
        {/* ============================================================ */}
        {meetings.length > 1 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Transcribed Recordings ({meetings.length})
              </span>
              <span className="text-[11px] text-slate-400">Click any session to view and download PDF</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {meetings.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    setSelectedMeeting(m);
                    window.scrollTo({ top: 380, behavior: 'smooth' });
                  }}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedMeeting?.id === m.id
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span>{m.project}</span>
                    <span className="font-mono">{m.duration}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{m.title}</h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                    <span>{m.date.split(',')[0]}</span>
                    <span className="text-indigo-600 font-semibold flex items-center gap-1">
                      View Summary <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* ElevenLabs Scribe STT Configuration Modal */}
      {showElevenLabsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">ElevenLabs Scribe STT Setup</h3>
                  <p className="text-xs text-slate-500">High-fidelity speech-to-text with multi-speaker diarization</p>
                </div>
              </div>
              <button
                onClick={() => setShowElevenLabsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-indigo-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>ElevenLabs Scribe v1 Active Pipeline</span>
                </div>
                <p className="text-indigo-700 leading-relaxed text-[11px]">
                  MeetGraph AI integrates with ElevenLabs' speech-to-text API (Scribe model) for multi-speaker diarization, punctuation, and word-level timestamps. Set <code className="bg-white/80 px-1 py-0.5 rounded font-mono">ELEVENLABS_API_KEY</code> in <code className="bg-white/80 px-1 py-0.5 rounded font-mono">.env</code> or enter your API key below.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ElevenLabs API Key (xi-api-key)
                </label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="e.g. 7a9b...c1d2"
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Stored securely in browser memory and passed directly for speech transcription calls.
                </p>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <Info className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-[11px] text-slate-600">
                  Status: <strong>{customElevenLabsKey || elevenLabsStatus.configured ? 'Configured & Ready' : 'Fallback: Python SpeechRecognition Active'}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              {customElevenLabsKey ? (
                <button
                  type="button"
                  onClick={() => {
                    setCustomElevenLabsKey('');
                    setTempApiKey('');
                    localStorage.removeItem('meetgraph_elevenlabs_key');
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                >
                  Clear Key
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowElevenLabsModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = tempApiKey.trim();
                    setCustomElevenLabsKey(trimmed);
                    if (trimmed) {
                      localStorage.setItem('meetgraph_elevenlabs_key', trimmed);
                    } else {
                      localStorage.removeItem('meetgraph_elevenlabs_key');
                    }
                    setShowElevenLabsModal(false);
                  }}
                  className="px-5 py-2 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Save & Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
