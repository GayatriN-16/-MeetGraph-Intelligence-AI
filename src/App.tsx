
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
import LiveMeeting from './pages/LiveMeeting';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

import {
  FolderOpen,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
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

  function renderPage() {
    if (selectedProjectId === null) {
      return (
        <section className="mx-auto mt-10 max-w-xl rounded-2xl border border-[var(--mg-border)] bg-white p-10 text-center shadow-[var(--mg-shadow-sm)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--mg-primary-soft)] text-[var(--mg-navy)]">
            <FolderOpen size={30} strokeWidth={1.7} />
          </div>

          <h2 className="mt-5 text-xl font-semibold text-[var(--mg-navy)]">
            No workspace found
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--mg-text-secondary)]">
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

      case 'live':
        return <LiveMeeting projectId={selectedProjectId} />;

      case 'analytics':
        return <Analytics projectId={selectedProjectId} />;

      case 'settings':
        return <Settings projectId={selectedProjectId} />;

      default:
        return <Dashboard projectId={selectedProjectId} />;
    }
  }

  return (
    <div className="flex min-h-screen bg-[var(--mg-background)] text-[var(--mg-text)]">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader
          projects={projects}
          selectedProjectId={selectedProjectId}
          onProjectChange={setSelectedProjectId}
          onNavigate={setActivePage}
          onUploadMeeting={() => setShowUploadModal(true)}
        />

        <main className="min-h-0 flex-1 overflow-y-auto bg-[var(--mg-background)] p-4 md:p-7 xl:p-8">
          {loading ? (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--mg-border)] bg-white text-[var(--mg-primary-strong)]">
                <RefreshCw size={24} className="animate-spin" />
              </div>

              <p className="mt-4 text-sm font-medium text-[var(--mg-text-secondary)]">
                Loading MeetGraph AI workspace...
              </p>
            </div>
          ) : error ? (
            <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-[var(--mg-border)] bg-white p-6 shadow-[var(--mg-shadow-sm)]">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={21}
                  className="mt-0.5 shrink-0 text-[var(--mg-danger)]"
                />

                <div>
                  <h2 className="font-semibold text-[var(--mg-navy)]">
                    Unable to load workspace
                  </h2>

                  <p className="mt-2 text-sm text-[var(--mg-text-secondary)]">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-4 rounded-lg bg-[var(--mg-navy)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#25436F]"
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

        <footer className="border-t border-[var(--mg-border)] bg-white px-6 py-3">
          <p className="text-xs text-[var(--mg-muted)]">
            MeetGraph AI <span className="mx-1">·</span> Meeting Intelligence Workspace
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
