
import { useEffect, useState } from 'react';

import { api, type Project } from './api/client';
import type { Page } from './types/index';

import Sidebar from './components/layout/Sidebar';
import TopHeader from './components/layout/TopHeader';
import UploadMeetingModal from './components/layout/UploadMeetingModal';

import Dashboard from './pages/Dashboard';
import Meetings from './pages/Meetings';
import AskAI from './pages/AskAI';
import TasksAndDecisions from './pages/TasksAndDecisions';
import KnowledgeGraph from './pages/KnowledgeGraph';

import { FolderOpen, RefreshCw } from 'lucide-react';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [selectedProjectId, setSelectedProjectId] =
    useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        setError('');

        const data = await api.getProjects();
        setProjects(data);

        if (data.length > 0) {
          setSelectedProjectId(data[0].id);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load projects.',
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProjects();
  }, []);

  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId,
  );

  function renderPage() {
    if (!selectedProjectId) {
      return (
        <section className="rounded-xl border border-[#DED3C3] bg-[#FFFDF9] p-10 text-center">
          <FolderOpen
            size={36}
            className="mx-auto text-[#B58B3F]"
          />
          <h2 className="mt-4 text-xl font-bold text-[#3F3022]">
            No project found
          </h2>
          <p className="mt-2 text-sm text-[#766654]">
            Create a project before uploading and analysing meetings.
          </p>
        </section>
      );
    }

    switch (activePage) {
      case 'dashboard':
        return <Dashboard projectId={selectedProjectId} />;

      case 'meetings':
        return <Meetings projectId={selectedProjectId} />;

      case 'assistant':
        return <AskAI projectId={selectedProjectId} />;

      case 'tasks':
        return <TasksAndDecisions projectId={selectedProjectId} />;

      case 'knowledge':
        return <KnowledgeGraph projectId={selectedProjectId} />;

      default:
        return <Dashboard projectId={selectedProjectId} />;
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F3EEE5] text-[#3F3022]">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader
          projectName={selectedProject?.name ?? 'No project selected'}
          onUploadMeeting={() => setShowUploadModal(true)}
        />

        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          {loading ? (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
              <RefreshCw
                size={28}
                className="animate-spin text-[#B58B3F]"
              />
              <p className="mt-4 text-sm font-medium text-[#766654]">
                Loading MeetGraph AI workspace...
              </p>
            </div>
          ) : error ? (
            <div className="mx-auto mt-10 max-w-2xl rounded-xl border border-red-200 bg-red-50 p-6">
              <h2 className="font-semibold text-red-800">
                Unable to load workspace
              </h2>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 rounded-lg bg-[#3F3022] px-4 py-2 text-sm font-semibold text-white hover:bg-[#57432F]"
              >
                Retry
              </button>
            </div>
          ) : (
            renderPage()
          )}
        </main>

        <footer className="border-t border-[#DED3C3] bg-[#FFFDF9] px-6 py-3">
          <p className="text-xs text-[#766654]">
            MeetGraph AI · Meeting Intelligence Workspace
          </p>
        </footer>
      </div>

      {showUploadModal && selectedProjectId !== null && (
        <UploadMeetingModal
          projectId={selectedProjectId}
          onClose={() => setShowUploadModal(false)}
          onUploaded={() => {
            setShowUploadModal(false);
            setActivePage('meetings');
          }}
        />
      )}
    </div>
  );
}
