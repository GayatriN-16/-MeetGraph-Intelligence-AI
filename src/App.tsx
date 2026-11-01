
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

import {
  FolderOpen,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

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
        <section className="mx-auto mt-12 max-w-xl rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
            <FolderOpen size={32} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            No project found
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
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
    <div className="flex min-h-screen bg-[#F5F6FC] text-slate-900">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader
          projectName={selectedProject?.name ?? 'No project selected'}
          onUploadMeeting={() => setShowUploadModal(true)}
        />

        <main className="min-h-0 flex-1 overflow-y-auto bg-[#F5F6FC] p-4 md:p-7">
          {loading ? (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100">
                <RefreshCw
                  size={26}
                  className="animate-spin text-violet-700"
                />
              </div>

              <p className="mt-4 text-sm font-medium text-slate-600">
                Loading MeetGraph AI workspace...
              </p>
            </div>
          ) : error ? (
            <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={21}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div>
                  <h2 className="font-semibold text-red-800">
                    Unable to load workspace
                  </h2>

                  <p className="mt-2 text-sm text-red-700">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-4 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          ) : (
            renderPage()
          )}
        </main>

        <footer className="border-t border-slate-200 bg-white px-6 py-3">
          <p className="text-xs text-slate-500">
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
