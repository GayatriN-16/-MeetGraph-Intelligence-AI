import React from 'react';
import { Bell, AlertTriangle, CheckCircle2, Info, Clock, ExternalLink } from 'lucide-react';
import { NotificationItem } from '../types';

export const NotificationsView: React.FC = () => {
  const notifications: NotificationItem[] = [
    {
      id: 'n-1',
      title: 'Cross-Meeting Timeline Conflict Detected',
      message: '14-day delivery timeline mismatch synthesized between Q3 Product Roadmap Planning (Oct 28 target) and Client Review (Oct 14 commit).',
      timestamp: '10 mins ago',
      type: 'alert',
      read: false
    },
    {
      id: 'n-2',
      title: 'Whisper Audio Diarization Complete',
      message: 'Successfully processed dual-channel stream for Q3 Product Roadmap Planning. Extracted 384 Neo4j graph entities.',
      timestamp: '25 mins ago',
      type: 'success',
      read: true
    },
    {
      id: 'n-3',
      title: 'Jira Software Task Sync Dispatch',
      message: '4 action items synchronized with project MEET-104 REST endpoint.',
      timestamp: '1 hour ago',
      type: 'info',
      read: true
    }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 font-sans text-slate-900">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Notifications & Alerts</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time notifications for task deadline reminders, processing events, and timeline conflicts.
          </p>
        </div>

        <span className="text-xs font-mono font-bold bg-rose-100 text-rose-800 px-3 py-1 rounded-full">
          1 Unread Alert
        </span>
      </div>

      {/* Notifications Feed */}
      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-xl border transition-all ${
              n.type === 'alert'
                ? 'bg-rose-50/70 border-rose-200'
                : n.type === 'success'
                ? 'bg-emerald-50/70 border-emerald-200'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  n.type === 'alert' ? 'bg-rose-100 text-rose-600' :
                  n.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                  'bg-indigo-100 text-indigo-600'
                }`}>
                  {n.type === 'alert' ? <AlertTriangle className="w-4 h-4" /> :
                   n.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                   <Info className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400 shrink-0">{n.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
