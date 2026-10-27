import React, { useState } from 'react';
import { Settings, Database, Radio, Shield, Save, Check } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(95);
  const [neo4jUri, setNeo4jUri] = useState('bolt://localhost:7687');
  const [enableDiarization, setEnableDiarization] = useState(true);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 font-sans text-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Intelligence System Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure Capstone v2.4 graph engine, Whisper diarization, and confidence scoring parameters.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs shadow-sm flex items-center gap-2 transition-colors"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Saved Settings!' : 'Save Configuration'}</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Neo4j Config Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <Database className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Neo4j Graph Database Cluster</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Database Connection URI</label>
              <input
                type="text"
                value={neo4jUri}
                onChange={(e) => setNeo4jUri(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div>
                <div className="font-bold text-slate-900">Cypher Multi-Hop Caching</div>
                <div className="text-slate-500 text-[11px]">Cache graph traversals for sub-10ms citation retrieval</div>
              </div>
              <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                Active (15m TTL)
              </span>
            </div>
          </div>
        </div>

        {/* Whisper AI Pipeline Config */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <Radio className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Whisper Audio Diarization & Decision Extraction</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Minimum Decision Verification Confidence Threshold</span>
                <span className="font-mono text-indigo-600 font-bold">{confidenceThreshold}%</span>
              </div>
              <input
                type="range"
                min="80"
                max="99"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Decisions synthesized with confidence below {confidenceThreshold}% are flagged for manual executive review.
              </p>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div>
                <div className="font-bold text-slate-900">Dual-Channel Voice Diarization</div>
                <div className="text-slate-500 text-[11px]">Separate overlapping speaker voices using acoustic waveform analysis</div>
              </div>
              <input
                type="checkbox"
                checked={enableDiarization}
                onChange={(e) => setEnableDiarization(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
