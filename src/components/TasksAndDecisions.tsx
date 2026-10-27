import React, { useState } from 'react';
import { CheckSquare, CheckCircle2, Clock, Plus, Filter, Play, User, AlertCircle, Copy, Check } from 'lucide-react';
import { Decision, ActionItem, Meeting } from '../types';

interface TasksAndDecisionsProps {
  decisions: Decision[];
  actionItems: ActionItem[];
  meetings: Meeting[];
  onToggleActionItem: (id: string) => void;
  onAddActionItem: (newItem: ActionItem) => void;
  onSelectMeeting: (m: Meeting) => void;
}

export const TasksAndDecisions: React.FC<TasksAndDecisionsProps> = ({
  decisions,
  actionItems,
  meetings,
  onToggleActionItem,
  onAddActionItem,
  onSelectMeeting
}) => {
  const [activeTab, setActiveTab] = useState<'decisions' | 'actions'>('actions');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [copied, setCopied] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newAssignee, setNewAssignee] = useState('Priya Sharma');
  const [newDueDate, setNewDueDate] = useState('Nov 02, 2026');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('High');

  const filteredActionItems = actionItems.filter(item => {
    if (priorityFilter === 'all') return true;
    return item.priority === priorityFilter;
  });

  const handleCopySummary = () => {
    const text = actionItems.map(a => `[${a.completed ? 'X' : ' '}] ${a.taskDescription} - ${a.assignee.name} (Due: ${a.dueDate}, Priority: ${a.priority})`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskDesc.trim()) return;

    const created: ActionItem = {
      id: 'act-' + Date.now(),
      taskDescription: newTaskDesc,
      assignee: {
        id: 'sp_new',
        name: newAssignee,
        role: 'Team Member',
        avatarInitials: newAssignee.split(' ').map(n => n[0]).join(''),
        colorBg: 'bg-indigo-600 text-white'
      },
      dueDate: newDueDate,
      priority: newPriority,
      completed: false,
      sourceMeetingId: 'mtg-1',
      sourceMeetingTitle: 'Q3 Product Roadmap Planning',
      timecode: '10:00'
    };

    onAddActionItem(created);
    setNewTaskDesc('');
    setShowAddModal(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans text-slate-900">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks & Decisions Hub</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track multi-stakeholder consensus decisions and assigned action items.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopySummary}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-xs shadow-sm flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'Copied Task Report!' : 'Export Tasks Report'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs shadow-sm flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Action Item</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="bg-white border border-slate-200 rounded-xl p-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('actions')}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'actions'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Action Items ({actionItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('decisions')}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'decisions'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Verified Decisions ({decisions.length})</span>
          </button>
        </div>

        {activeTab === 'actions' && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        )}
      </div>

      {/* Body Content */}
      {activeTab === 'actions' ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5 pl-5 w-10">STATUS</th>
                <th className="p-3.5">TASK DESCRIPTION</th>
                <th className="p-3.5">ASSIGNEE</th>
                <th className="p-3.5">DUE DATE</th>
                <th className="p-3.5">SOURCE MEETING</th>
                <th className="p-3.5 pr-5 text-right">PRIORITY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredActionItems.map((act) => (
                <tr key={act.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 pl-5">
                    <input
                      type="checkbox"
                      checked={act.completed}
                      onChange={() => onToggleActionItem(act.id)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    />
                  </td>
                  <td className={`p-3.5 font-semibold ${act.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {act.taskDescription}
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full ${act.assignee.colorBg} font-bold text-[10px] flex items-center justify-center`}>
                        {act.assignee.avatarInitials}
                      </span>
                      <span className="font-medium text-slate-800">{act.assignee.name}</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-slate-600">{act.dueDate}</td>
                  <td className="p-3.5">
                    <button
                      onClick={() => {
                        const m = meetings.find(item => item.id === act.sourceMeetingId) || meetings[0];
                        onSelectMeeting(m);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-indigo-600" />
                      {act.sourceMeetingTitle} [{act.timecode}]
                    </button>
                  </td>
                  <td className="p-3.5 pr-5 text-right">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                      act.priority === 'High' ? 'bg-rose-100 text-rose-800' :
                      act.priority === 'Medium' ? 'bg-amber-100 text-amber-800' :
                      'bg-indigo-100 text-indigo-800'
                    }`}>
                      {act.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-4">
          {decisions.map((dec) => (
            <div key={dec.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{dec.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Category: {dec.category}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded">
                  {dec.confidence}% Verified
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full ${dec.speaker.colorBg} font-bold text-[9px] flex items-center justify-center`}>
                    {dec.speaker.avatarInitials}
                  </span>
                  <span>Captured from {dec.speaker.name} ({dec.speaker.role})</span>
                </div>
                <button
                  onClick={() => {
                    const m = meetings.find(item => item.id === dec.sourceMeetingId) || meetings[0];
                    onSelectMeeting(m);
                  }}
                  className="font-mono font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-indigo-600" />
                  {dec.sourceMeetingTitle} [{dec.timecode}]
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Action Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateTask} className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Create New Action Item</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Task Description</label>
              <textarea
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                placeholder="e.g. Conduct security test on Whisper audio stream sockets..."
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg outline-none focus:border-indigo-600"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assignee</label>
                <select
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg outline-none"
                >
                  <option value="Priya Sharma">Priya Sharma</option>
                  <option value="Arjun Mehta">Arjun Mehta</option>
                  <option value="Alex Vance">Alex Vance</option>
                  <option value="David Chen">David Chen</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as 'High' | 'Medium' | 'Low')}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg outline-none"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
              <input
                type="text"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
