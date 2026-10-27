import React, { useState } from 'react';
import { X, Lock, ShieldCheck, User, Mail, CheckCircle2, Key } from 'lucide-react';
import { UserRole, User as UserType } from '../types';
import { api, setAuthToken } from '../api/client';

interface AuthModalProps {
  currentUser: UserType;
  onClose: () => void;
  onUserChanged: (user: UserType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ currentUser, onClose, onUserChanged }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState(currentUser.email);
  const [role, setRole] = useState<UserRole>(currentUser.role);
  const [name, setName] = useState(currentUser.name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.login(email, role);
      setAuthToken(res.token);
      onUserChanged(res.user);
      onClose();
    } catch (err) {
      // Fallback update
      const updatedUser: UserType = {
        id: 'usr-' + Date.now(),
        email,
        name: name || email.split('@')[0],
        role,
        avatarInitials: (name || email).split(' ').map(n => n[0]).join('').toUpperCase()
      };
      setAuthToken('demo_jwt_token_' + role.toLowerCase());
      onUserChanged(updatedUser);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-[#f8fafc] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isLoginView ? 'JWT Authentication & Role Access' : 'Register New Account'}
              </h3>
              <p className="text-xs text-slate-500">PRD Spec Section 5: Access Control</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isLoginView && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Vance"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-indigo-600"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex.vance@meetgraph.ai"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-indigo-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Role Privilege Level</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('Admin')}
                className={`p-2.5 border rounded-lg text-xs font-bold text-center transition-all ${
                  role === 'Admin'
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Admin (Full Access)
              </button>
              <button
                type="button"
                onClick={() => setRole('Member')}
                className={`p-2.5 border rounded-lg text-xs font-bold text-center transition-all ${
                  role === 'Member'
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Member (Project Scope)
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow transition-colors"
            >
              {isLoginView ? 'Sign In & Issue JWT Token' : 'Create Account'}
            </button>
          </div>

          <div className="text-center pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsLoginView(!isLoginView)}
              className="text-xs text-indigo-600 hover:underline font-semibold"
            >
              {isLoginView ? 'Need a new account? Register here' : 'Already have an account? Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
