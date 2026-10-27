import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Activity, Search, Lock, Key, Terminal } from 'lucide-react';
import { AUDIT_LOGS } from '../data/mockData';

export const AdminAuditLogs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const users = [
    { id: 'u-1', name: 'Alex Vance', role: 'Admin', email: 'alex.vance@meetgraph.ai', status: 'Active', permissions: 'Full Access' },
    { id: 'u-2', name: 'Priya Sharma', role: 'End User', email: 'priya.sharma@meetgraph.ai', status: 'Active', permissions: 'Upload & Query' },
    { id: 'u-3', name: 'Arjun Mehta', role: 'End User', email: 'arjun.mehta@meetgraph.ai', status: 'Active', permissions: 'Upload & Query' },
    { id: 'u-4', name: 'David Chen', role: 'Security Admin', email: 'david.chen@meetgraph.ai', status: 'Active', permissions: 'Audit & Roles' }
  ];

  const filteredLogs = AUDIT_LOGS.filter(l =>
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.module.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans text-slate-900">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600">
            <span className="bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded">SLIDE 7 USE-CASE SPEC</span>
            <span>â— Admin Privileges & System Audit</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Access Control (RBAC) & Audit Logging
          </h1>
        </div>

        <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          SOC2 Type II Audit Active
        </span>
      </div>

      {/* Users & Roles Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Workspace User Management & Roles</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">JWT Authentication Enforced</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {users.map((u) => (
            <div key={u.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{u.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  u.role.includes('Admin') ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  {u.role}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono truncate">{u.email}</p>
              <div className="text-[10px] text-slate-600 flex justify-between pt-1 border-t border-slate-200">
                <span>Permissions:</span>
                <strong className="text-indigo-700">{u.permissions}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Audit Logs Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden space-y-3 p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900">System Activity & Audit Logs</h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search audit trail..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">TIMESTAMP</th>
                <th className="p-3">USER</th>
                <th className="p-3">ACTION PERFORMED</th>
                <th className="p-3">MODULE</th>
                <th className="p-3">IP ADDRESS</th>
                <th className="p-3 pr-4 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 font-mono text-[11px]">
                  <td className="p-3 text-slate-500">{log.timestamp}</td>
                  <td className="p-3 font-sans font-bold text-slate-800">{log.user}</td>
                  <td className="p-3 font-sans text-slate-700">{log.action}</td>
                  <td className="p-3 font-sans">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {log.module}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500">{log.ipAddress}</td>
                  <td className="p-3 pr-4 text-right">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-sans font-bold text-[10px]">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
