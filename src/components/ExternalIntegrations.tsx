import React, { useState } from 'react';
import { Layers, Video, Users, Calendar, CheckSquare, MessageSquare, RefreshCw, CheckCircle2, Zap } from 'lucide-react';
import { INTEGRATIONS } from '../data/mockData';

export const ExternalIntegrations: React.FC = () => {
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleTriggerSync = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setIntegrations(prev => prev.map(item => {
        if (item.id === id) {
          return { ...item, lastSynced: 'Just now', meetingsSyncedCount: item.meetingsSyncedCount + 1 };
        }
        return item;
      }));
      setSyncingId(null);
    }, 1200);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans text-slate-900">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">External Ecosystem Integrations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Connect live meeting platforms, Google Calendar, Jira Software, and Slack channels.
          </p>
        </div>

        <button
          onClick={() => handleTriggerSync('int-1')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs shadow-sm flex items-center gap-2 transition-colors shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${syncingId ? 'animate-spin' : ''}`} />
          <span>Sync All Webhooks</span>
        </button>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 hover:border-indigo-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded">
                  {item.category}
                </span>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {item.status}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  {item.icon === 'video' ? <Video className="w-5 h-5" /> :
                   item.icon === 'users' ? <Users className="w-5 h-5" /> :
                   item.icon === 'calendar' ? <Calendar className="w-5 h-5" /> :
                   item.icon === 'check-square' ? <CheckSquare className="w-5 h-5" /> :
                   <MessageSquare className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
                  <p className="text-xs text-slate-500">Last Synced: {item.lastSynced}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">
                <strong>{item.meetingsSyncedCount}</strong> events/tasks synced
              </span>

              <button
                onClick={() => handleTriggerSync(item.id)}
                disabled={syncingId === item.id}
                className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                <span>{syncingId === item.id ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
