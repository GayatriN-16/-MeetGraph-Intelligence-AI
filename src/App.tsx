import React, { useState } from 'react';
import { NavigationTab, Meeting, Decision, Task, User } from './types';
import {
  INITIAL_MEETINGS,
  INITIAL_DECISIONS,
  INITIAL_ACTION_ITEMS,
  TIMELINE_CONFLICT,
  EXTRACTION_PIPELINE
} from './data/mockData';

import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { Dashboard } from './components/Dashboard';
import { MeetingsLibrary } from './components/MeetingsLibrary';
import { ReactFlowKnowledgeGraph } from './components/ReactFlowKnowledgeGraph';
import { TasksAndDecisions } from './components/TasksAndDecisions';
import { AskAI } from './components/AskAI';
import { ArchitecturePipeline } from './components/ArchitecturePipeline';
import { ExternalIntegrations } from './components/ExternalIntegrations';
import { AdminAuditLogs } from './components/AdminAuditLogs';
import { ProjectsView } from './components/ProjectsView';
import { SettingsView } from './components/SettingsView';
import { NotificationsView } from './components/NotificationsView';

import { MeetingDetailModal } from './components/MeetingDetailModal';
import { ConflictEvidenceModal } from './components/ConflictEvidenceModal';
import { UploadMeetingModal } from './components/UploadMeetingModal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'usr-admin-1',
    email: 'alex.vance@meetgraph.ai',
    name: 'Alex Vance',
    role: 'Admin',
    avatarInitials: 'AV'
  });

  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [selectedProject, setSelectedProject] = useState<string>('Acme Engineering - Capstone v2.4');

  const [meetings, setMeetings] = useState<Meeting[]>(INITIAL_MEETINGS);
  const [decisions, setDecisions] = useState<Decision[]>(INITIAL_DECISIONS);
  const [actionItems, setActionItems] = useState<Task[]>(INITIAL_ACTION_ITEMS);
  const [timelineConflict, setTimelineConflict] = useState(TIMELINE_CONFLICT);

  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showConflictModal, setShowConflictModal] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const [askAIPrompt, setAskAIPrompt] = useState<string>('');

  const handleToggleActionItem = (id: string) => {
    setActionItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, completed: !item.completed };
      }
      return item;
    }));
  };

  const handleAddActionItem = (newItem: Task) => {
    setActionItems(prev => [newItem, ...prev]);
  };

  const handleMeetingUploaded = (newMtg: Meeting) => {
    setMeetings(prev => [newMtg, ...prev]);
    setShowUploadModal(false);
    setSelectedMeeting(newMtg); // Open modal for newly uploaded meeting!
  };

  const handleAskAIAboutMeeting = (meetingTitle: string) => {
    setSelectedMeeting(null);
    setAskAIPrompt(`Summarize key decisions and open questions from ${meetingTitle}`);
    setCurrentTab('ask-ai');
  };

  const handleResolveConflict = () => {
    setShowConflictModal(false);
    setActionItems(prev => prev.map(a => {
      if (a.id === 'act-4') {
        return { ...a, completed: true, taskDescription: '[RESOLVED] Synchronized Client Review target to Oct 28' };
      }
      return a;
    }));
    setCurrentTab('tasks-decisions');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-row font-sans selection:bg-indigo-100 selection:text-indigo-900">

      {/* Left Navigation Sidebar */}
      <Sidebar
  currentTab={currentTab}
  currentUser={currentUser}
        onSelectTab={setCurrentTab}
        openUploadModal={() => setShowUploadModal(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">

        {/* Top Navigation Header */}
        <TopHeader
          currentUser={currentUser}
          onOpenAuthModal={() => setShowAuthModal(true)}
          onSearch={(query) => {
            if (query.trim() && currentTab !== 'meetings') {
              setCurrentTab('meetings');
            }
          }}
          openUploadModal={() => setShowUploadModal(true)}
          onSelectTab={setCurrentTab}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
        />

        {/* Tab Route Content */}
        <main className="flex-1 overflow-y-auto pb-16">
          {currentTab === 'dashboard' && (
            <Dashboard
              meetings={meetings}
              decisions={decisions}
              actionItems={actionItems}
              timelineConflict={timelineConflict}
              extractionPipeline={EXTRACTION_PIPELINE}
              onSelectMeeting={(m) => setSelectedMeeting(m)}
              onOpenConflictModal={() => setShowConflictModal(true)}
              onToggleActionItem={handleToggleActionItem}
              onSelectTab={setCurrentTab}
              openUploadModal={() => setShowUploadModal(true)}
            />
          )}

          {currentTab === 'meetings' && (
            <MeetingsLibrary
              meetings={meetings}
              onSelectMeeting={(m) => setSelectedMeeting(m)}
              openUploadModal={() => setShowUploadModal(true)}
            />
          )}

          {currentTab === 'knowledge-graph' && (
            <ReactFlowKnowledgeGraph
              onSelectMeetingTitle={(title) => {
                const found = meetings.find(m => m.title.toLowerCase().includes(title.toLowerCase()));
                if (found) setSelectedMeeting(found);
              }}
            />
          )}

          {currentTab === 'tasks-decisions' && (
            <TasksAndDecisions
              decisions={decisions}
              actionItems={actionItems}
              meetings={meetings}
              onToggleActionItem={handleToggleActionItem}
              onAddActionItem={handleAddActionItem}
              onSelectMeeting={(m) => setSelectedMeeting(m)}
            />
          )}

          {currentTab === 'ask-ai' && (
            <AskAI initialPrompt={askAIPrompt} />
          )}

          {currentTab === 'notifications' && (
            <NotificationsView />
          )}

          {currentTab === 'architecture' && (
            <ArchitecturePipeline />
          )}

          {currentTab === 'integrations' && (
            <ExternalIntegrations />
          )}

          {currentTab === 'admin-audit' && (
            <AdminAuditLogs />
          )}

          {currentTab === 'projects' && (
            <ProjectsView />
          )}

          {currentTab === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Modals */}
      {selectedMeeting && (
        <MeetingDetailModal
          meeting={selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
          onAskAIAboutMeeting={handleAskAIAboutMeeting}
        />
      )}

      {showConflictModal && (
        <ConflictEvidenceModal
          conflict={timelineConflict}
          onClose={() => setShowConflictModal(false)}
          onResolve={handleResolveConflict}
        />
      )}

      {showUploadModal && (
        <UploadMeetingModal
          onClose={() => setShowUploadModal(false)}
          onMeetingUploaded={handleMeetingUploaded}
        />
      )}

      {showAuthModal && (
        <AuthModal
          currentUser={currentUser}
          onClose={() => setShowAuthModal(false)}
          onUserChanged={setCurrentUser}
        />
      )}
    </div>
  );
}
