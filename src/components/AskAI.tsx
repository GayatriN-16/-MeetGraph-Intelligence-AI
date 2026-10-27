import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, Share2, Play, AlertTriangle, Loader2 } from 'lucide-react';
import { askExecutiveIntelligence } from '../services/aiService';

interface AskAIProps {
  initialPrompt?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AskAI: React.FC<AskAIProps> = ({ initialPrompt = '' }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: `### ðŸ‘‹ Welcome to MeetGraph Executive Intelligence
I am your connected meeting memory assistant. I am grounded in **48 uploaded executive meetings**, **142 decisions**, and **384 Neo4j graph nodes**.

Ask me about timeline schedule conflicts, speaker commitments, action items, or technical decisions!`,
      timestamp: '10:00 AM'
    }
  ]);
  const [inputQuery, setInputQuery] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    'Where is the schedule conflict detected?',
    'Summarize decisions made by Priya Sharma',
    'List high-priority action items and due dates',
    'Explain vector-hybrid indexing in Capstone v2.4'
  ];

  const handleSend = async (queryText?: string) => {
    const promptToUse = queryText || inputQuery;
    if (!promptToUse.trim() || loading) return;

    const userMsg: Message = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: promptToUse,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const responseText = await askExecutiveIntelligence(promptToUse);
      const aiMsg: Message = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Ask AI error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 font-sans text-slate-900 h-[calc(100vh-5rem)] flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Ask Executive Intelligence</h1>
            <p className="text-xs text-slate-500">Connected memory engine powered by Gemini AI & Neo4j Graph</p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Grounded Memory Active
        </span>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Quick Queries:</span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-indigo-700 rounded-full text-xs font-medium shrink-0 transition-colors shadow-sm"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-white border border-slate-200 rounded-xl shadow-inner">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 font-bold text-xs ${
              msg.sender === 'user' ? 'bg-slate-800' : 'bg-indigo-600'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
              msg.sender === 'user'
                ? 'bg-slate-900 text-white font-medium rounded-tr-none'
                : 'bg-[#f8fafc] border border-[#e2e8f0] text-slate-800 rounded-tl-none'
            }`}>
              <div className="prose prose-xs max-w-none whitespace-pre-line">
                {msg.text}
              </div>
              <div className={`text-[10px] font-mono text-right ${
                msg.sender === 'user' ? 'text-slate-400' : 'text-slate-400'
              }`}>
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-2xl px-4 py-3 text-xs font-medium animate-pulse">
              Synthesizing cross-meeting Neo4j graph citations...
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="relative shrink-0">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask anything about meetings, decisions, or timeline conflicts..."
          className="w-full pl-4 pr-12 py-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none shadow-sm"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !inputQuery.trim()}
          className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg absolute right-2 top-1/2 -translate-y-1/2 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
