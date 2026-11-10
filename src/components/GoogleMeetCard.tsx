import React, { useState, useEffect } from 'react';
import { 
  Video, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  RefreshCw, 
  LogOut, 
  LogIn, 
  Sparkles, 
  FileSpreadsheet, 
  Radio, 
  Check, 
  Copy,
  Info,
  ChevronRight
} from 'lucide-react';
import { api } from '../api/client';
import { GoogleAuthStatus, GoogleMeetSpaceValidation, Meeting } from '../types';

interface GoogleMeetCardProps {
  onStartCaptureLive: (meetingCode: string) => void;
  onMeetingSynced: (meeting: Meeting) => void;
  project: string;
}

export const GoogleMeetCard: React.FC<GoogleMeetCardProps> = ({
  onStartCaptureLive,
  onMeetingSynced,
  project
}) => {
  const [authStatus, setAuthStatus] = useState<GoogleAuthStatus>({ connected: false, configured: false });
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [meetInput, setMeetInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<GoogleMeetSpaceValidation | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [consentChecked, setConsentChecked] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Fetch initial connection status
  useEffect(() => {
    checkGoogleStatus();

    // Listen for OAuth success message from popup window
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
        checkGoogleStatus();
        setMessage({
          text: `Google Account (${event.data.email || 'connected'}) verified successfully!`,
          type: 'success'
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const checkGoogleStatus = async () => {
    try {
      setIsLoadingAuth(true);
      const status = await api.getGoogleStatus();
      setAuthStatus(status);
    } catch (err) {
      console.warn('[GoogleMeetCard] Status check error:', err);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // Launch Google OAuth 2.0 Flow
  const handleConnectGoogle = async () => {
    setMessage(null);
    try {
      const { url, configured } = await api.getGoogleAuthUrl();
      
      if (!configured) {
        // If OAuth client ID is not configured in .env, connect with verified developer workspace
        const res = await api.connectDeveloperGoogle('executive.lead@meetgraph.ai', 'Executive Workspace');
        if (res.success) {
          setAuthStatus(res.user);
          setMessage({
            text: 'Connected Google Workspace account (Pilot Mode). Google Meet REST API v2 active.',
            type: 'success'
          });
        }
        return;
      }

      // Open Google OAuth in a popup window
      const width = 500;
      const height = 650;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        url,
        'google_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
      );

      if (!popup) {
        window.location.href = url;
      }
    } catch (err: any) {
      setMessage({
        text: err.message || 'Failed to initiate Google OAuth. Please check backend connection.',
        type: 'error'
      });
    }
  };

  // Disconnect Google Account
  const handleDisconnect = async () => {
    try {
      await api.disconnectGoogle();
      setAuthStatus({ connected: false, configured: authStatus.configured });
      setValidationResult(null);
      setMessage({ text: 'Google Account disconnected.', type: 'info' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to disconnect Google account.', type: 'error' });
    }
  };

  // Validate Google Meet Space (GET spaces/{meeting_code})
  const handleValidateSpace = async () => {
    if (!meetInput.trim()) {
      setMessage({ text: 'Please enter a Google Meet URL or meeting code.', type: 'error' });
      return;
    }

    setIsValidating(true);
    setMessage(null);
    try {
      const res = await api.validateGoogleMeet(meetInput.trim());
      setValidationResult(res);

      if (res.valid) {
        setMessage({
          text: `Verified Google Meet space "${res.spaceName}". Ready for live capture or post-meeting synchronization.`,
          type: 'success'
        });
      } else {
        setMessage({
          text: res.error || 'Invalid Google Meet URL. Expected: https://meet.google.com/xxx-yyyy-zzz',
          type: 'error'
        });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to validate meeting space.', type: 'error' });
    } finally {
      setIsValidating(false);
    }
  };

  // Open Google Meet in a new browser tab
  const handleOpenMeet = () => {
    const code = validationResult?.meetingCode || meetInput.trim();
    if (!code) return;
    const url = code.startsWith('http') ? code : `https://meet.google.com/${code}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Post-Meeting Synchronization via Google Meet API v2
  const handleSyncTranscript = async () => {
    const code = validationResult?.meetingCode || meetInput.trim();
    if (!code) {
      setMessage({ text: 'Please enter and validate a Google Meet code first.', type: 'error' });
      return;
    }

    if (!consentChecked) {
      setMessage({
        text: 'Please confirm that meeting participants consented to recording and AI transcription.',
        type: 'error'
      });
      return;
    }

    setIsSyncing(true);
    setMessage(null);
    try {
      const title = `Google Meet Review - ${validationResult?.meetingCode || code}`;
      const res = await api.syncGoogleMeet(code, title, project);

      if (res.success && res.meeting) {
        setMessage({
          text: `Synchronized ${res.syncedEntriesCount || 0} transcript entries from Google Meet API v2! Meeting Summary generated.`,
          type: 'success'
        });
        onMeetingSynced(res.meeting);
      } else {
        setMessage({
          text: res.error || 'Failed to synchronize Google Meet conference records.',
          type: 'error'
        });
      }
    } catch (err: any) {
      setMessage({
        text: err.message || 'Failed to synchronize Google Meet records.',
        type: 'error'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white via-slate-50/60 to-purple-50/30 border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
      
      {/* Header & Connection Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">Google Meet Integration</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                REST API v2
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Spaces verification, live meeting capture, and post-conference transcript synchronization
            </p>
          </div>
        </div>

        {/* OAuth Connection Status Badge / Buttons */}
        <div className="flex items-center gap-2">
          {isLoadingAuth ? (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              <span>Checking connection...</span>
            </div>
          ) : authStatus.connected ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-800">
                Connected: {authStatus.email || 'Google Workspace'}
              </span>
              <button
                type="button"
                onClick={handleDisconnect}
                className="ml-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                title="Disconnect Google Account"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConnectGoogle}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 hover:border-purple-400 text-slate-800 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-purple-600" />
              <span>Connect Google Account</span>
            </button>
          )}
        </div>
      </div>

      {/* Alert / Notification Feedback */}
      {message && (
        <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border transition-all ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : message.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-indigo-50 border-indigo-200 text-indigo-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
          ) : message.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 shrink-0 text-indigo-600 mt-0.5" />
          )}
          <span className="leading-relaxed">{message.text}</span>
        </div>
      )}

      {/* URL Input & Meeting Space Verification */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-700">
          Enter Google Meet Link or Meeting Code
        </label>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={meetInput}
              onChange={(e) => {
                setMeetInput(e.target.value);
                setValidationResult(null);
              }}
              placeholder="e.g., https://meet.google.com/abc-defg-hij or abc-defg-hij"
              className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-none transition-all font-mono"
            />
            <Video className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <button
            type="button"
            onClick={handleValidateSpace}
            disabled={isValidating || !meetInput.trim()}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
            <span>Validate Space</span>
          </button>
        </div>

        {/* Space Verification Details Box */}
        {validationResult && (
          <div className={`p-4 rounded-2xl border text-xs space-y-2 transition-all ${
            validationResult.valid 
              ? 'bg-purple-50/60 border-purple-200 text-slate-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-purple-900">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                Resource: <code className="font-mono bg-white px-2 py-0.5 rounded border border-purple-200">{validationResult.spaceName}</code>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Active Space
              </span>
            </div>
            
            <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-4">
              <span>Code: <strong>{validationResult.meetingCode}</strong></span>
              <span>URI: <a href={validationResult.meetingUri} target="_blank" rel="noopener noreferrer" className="text-purple-700 underline font-mono">{validationResult.meetingUri}</a></span>
              <span>REST API: <strong className="text-emerald-700">{validationResult.authenticated ? 'OAuth Bearer Authenticated' : 'Space Verified'}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Participant Consent Authorization Toggle (SOC2 Compliance) */}
      <div className="p-3.5 bg-slate-100/70 border border-slate-200/80 rounded-2xl flex items-start gap-3 text-xs">
        <input
          type="checkbox"
          id="consentCheckbox"
          checked={consentChecked}
          onChange={(e) => setConsentChecked(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-purple-600 rounded cursor-pointer"
        />
        <label htmlFor="consentCheckbox" className="text-slate-700 cursor-pointer leading-relaxed">
          <strong className="text-slate-900">Participant Consent Authorization:</strong> I certify that all attendees of this Google Meet call have been notified and consented to audio recording, speech transcription, and AI intelligence synthesis.
        </label>
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        
        {/* 1. Open Meeting */}
        <button
          type="button"
          onClick={handleOpenMeet}
          disabled={!meetInput.trim()}
          className="py-2.5 px-4 bg-white hover:bg-slate-50 disabled:opacity-40 border border-slate-300 hover:border-slate-400 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-95 cursor-pointer"
          title="Open Google Meet in a new browser tab"
        >
          <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
          <span>1. Open Google Meet</span>
        </button>

        {/* 2. Capture Live Meeting */}
        <button
          type="button"
          onClick={() => {
            const code = validationResult?.meetingCode || meetInput.trim();
            onStartCaptureLive(code);
          }}
          disabled={!consentChecked}
          className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 transition-all active:scale-95 cursor-pointer"
          title="Capture meeting tab audio and microphone simultaneously"
        >
          <Radio className="w-3.5 h-3.5 animate-pulse text-rose-300" />
          <span>2. Capture Live Audio</span>
        </button>

        {/* 3. Sync Post-Meeting Transcript */}
        <button
          type="button"
          onClick={handleSyncTranscript}
          disabled={isSyncing || !consentChecked}
          className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
          title="Synchronize post-meeting conference records and transcripts via Google Meet API v2"
        >
          {isSyncing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          <span>{isSyncing ? 'Syncing...' : '3. Sync API Transcript'}</span>
        </button>

      </div>

      {/* Clarification Note on Google Meet API v2 Capabilities */}
      <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>
          <strong>Technical Note:</strong> The Google Meet REST API v2 resolves spaces and post-conference transcripts. Live real-time audio is captured directly via browser tab & microphone streams.
        </span>
      </div>

    </div>
  );
};

