import React, { useState } from 'react';
import { X, UploadCloud, FileAudio, CheckCircle2, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { Meeting } from '../types';
import { SPEAKERS } from '../data/mockData';

interface UploadMeetingModalProps {
  onClose: () => void;
  onMeetingUploaded: (newMeeting: Meeting) => void;
}

export const UploadMeetingModal: React.FC<UploadMeetingModalProps> = ({ onClose, onMeetingUploaded }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [project, setProject] = useState('Product Launch v1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const handleSimulatedUpload = () => {
    if (!meetingTitle.trim()) {
      setMeetingTitle('Executive Strategy Sync - ' + new Date().toLocaleDateString());
    }
    setIsProcessing(true);
    setStep(2); // Whisper Transcription

    setTimeout(() => {
      setStep(3); // Neo4j Graph Indexing
    }, 1500);

    setTimeout(() => {
      setStep(4); // Synthesis Complete
      setIsProcessing(false);

      const createdMeeting: Meeting = {
        id: 'mtg-' + Date.now(),
        title: meetingTitle || 'Executive Strategy Sync',
        project,
        date: 'Oct 26, 2026',
        time: '11:00 AM EST',
        duration: '28m 15s',
        durationSeconds: 1695,
        speakers: [SPEAKERS.PS, SPEAKERS.AM, SPEAKERS.AV],
        graphStatus: 'Completed / Indexed',
        summary: 'Uploaded executive stream. Automatically diarized with 3 distinct speaker profiles. Extracted 4 key decision nodes and 2 action items.',
        keyTakeaways: [
          'Validated multi-channel audio stream tokenization',
          'Indexed meeting memory into Neo4j graph cluster'
        ],
        audioFileName: selectedFile ? selectedFile.name : 'Executive_Briefing_Oct26.m4a',
        audioSizeMb: selectedFile ? Math.round(selectedFile.size / (1024 * 1024)) : 42,
        transcript: [
          {
            id: 't-new-1',
            speakerId: 'sp_ps',
            speakerName: 'Priya Sharma',
            timecode: '02:14',
            seconds: 134,
            text: 'We have verified the Neo4j Cypher query latency improvements across all active project schemas.',
            sentiment: 'positive',
            isKeyDecision: true
          },
          {
            id: 't-new-2',
            speakerId: 'sp_am',
            speakerName: 'Arjun Mehta',
            timecode: '10:40',
            seconds: 640,
            text: 'Let us confirm the updated release target for Capstone v2.4.',
            sentiment: 'neutral'
          }
        ]
      };

      onMeetingUploaded(createdMeeting);
    }, 3200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-[#f8fafc] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Upload Meeting Recording</h3>
              <p className="text-xs text-slate-500">Audio stream ingestion & Neo4j graph entity indexing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {!isProcessing && step !== 4 ? (
            <>
              {/* Form Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting Title</label>
                  <input
                    type="text"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    placeholder="e.g., Client Briefing & Strategy Sync"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Project</label>
                  <select
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 outline-none"
                  >
                    <option value="Product Launch v1">Product Launch v1</option>
                    <option value="Core Engine">Core Engine</option>
                    <option value="Acme Engineering - Capstone v2.4">Acme Engineering - Capstone v2.4</option>
                    <option value="Client Review Board">Client Review Board</option>
                  </select>
                </div>
              </div>

              {/* Drag & Drop Audio File Area */}
              <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/40 rounded-xl p-8 text-center space-y-3 cursor-pointer hover:bg-indigo-50/70 transition-colors">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
                  <FileAudio className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Drop M4A, MP3, WAV or MP4 audio/video here
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Multi-channel speaker diarization enabled up to 500 MB
                  </p>
                </div>

                <div className="pt-2">
                  <span className="text-xs font-semibold bg-white border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-lg shadow-sm hover:border-indigo-400">
                    Browse File System
                  </span>
                </div>
              </div>

              {/* Preset Sample Audio Fast Test */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Test with preset audio stream: <strong>Client_Briefing_Oct26.m4a</strong> (142 MB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMeetingTitle('Client Briefing Oct 26');
                    setSelectedFile(new File([''], 'Client_Briefing_Oct26.m4a'));
                  }}
                  className="font-bold text-indigo-600 hover:text-indigo-800 underline"
                >
                  Select Sample
                </button>
              </div>
            </>
          ) : (
            /* Real-time Extraction Pipeline Stepper */
            <div className="py-8 space-y-6">
              <div className="text-center space-y-1">
                <h4 className="text-base font-bold text-slate-900">Ingesting Executive Meeting Stream</h4>
                <p className="text-xs text-slate-500">Grounded Neo4j entity extraction in progress</p>
              </div>

              <div className="space-y-3 max-w-md mx-auto">
                {/* Step 1 */}
                <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="text-xs font-medium text-emerald-900">
                    1. Audio stream uploaded & encrypted (SOC2 compliant)
                  </div>
                </div>

                {/* Step 2 */}
                <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                  step >= 2 ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'
                }`}>
                  {step === 2 ? (
                    <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
                  ) : step > 2 ? (
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0"></div>
                  )}
                  <div className="text-xs font-medium text-slate-800">
                    2. Whisper v3 multi-channel speaker diarization
                  </div>
                </div>

                {/* Step 3 */}
                <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                  step >= 3 ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'
                }`}>
                  {step === 3 ? (
                    <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
                  ) : step > 3 ? (
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0"></div>
                  )}
                  <div className="text-xs font-medium text-slate-800">
                    3. Neo4j graph entity mapping & decision synthesis
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>

          {!isProcessing && (
            <button
              onClick={handleSimulatedUpload}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs shadow flex items-center gap-2 transition-colors"
            >
              <span>Process & Index Memory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
