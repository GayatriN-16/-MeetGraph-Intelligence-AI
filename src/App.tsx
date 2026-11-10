
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Close the mobile drawer when the screen changes to desktop size.
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');

    function handleScreenChange(event: MediaQueryListEvent) {
      if (event.matches) {
        setMobileMenuOpen(false);
      }
    }

    mediaQuery.addEventListener('change', handleScreenChange);

    return () => {
      mediaQuery.removeEventListener('change', handleScreenChange);
    };
  }, []);

  // Prevent background scrolling while the mobile drawer is open.
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    }

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [mobileMenuOpen]);

  function handleNavigate(page: Page) {
    setActivePage(page);
    setMobileMenuOpen(false);
  }

  function renderPage() {
    if (selectedProjectId === null) {
      return (
        <section className="mx-auto mt-6 w-full max-w-xl rounded-2xl border border-[var(--mg-border)] bg-white p-5 text-center shadow-[var(--mg-shadow-sm)] sm:mt-10 sm:p-10">
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
    <div className="flex min-h-screen w-full overflow-x-clip bg-[var(--mg-background)] text-[var(--mg-text)]">
      {/* Desktop sidebar and mobile navigation drawer */}
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        isMobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Mobile drawer backdrop */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] md:hidden"
        />
      )}

      {/* Main application */}
      <div className="flex min-h-screen min-w-0 w-full flex-1 flex-col md:w-[calc(100%-238px)]">
        <TopHeader
          projects={projects}
          selectedProjectId={selectedProjectId}
          onProjectChange={setSelectedProjectId}
          onNavigate={(page) => handleNavigate(page)}
          onUploadMeeting={() => setShowUploadModal(true)}
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        <main className="min-h-0 min-w-0 w-full flex-1 overflow-x-clip bg-[var(--mg-background)] p-3 sm:p-4 md:overflow-y-auto md:p-7 xl:p-8">
          {loading ? (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--mg-border)] bg-white text-[var(--mg-primary-strong)]">
                <RefreshCw size={24} className="animate-spin" />
              </div>

              <p className="mt-4 text-center text-sm font-medium text-[var(--mg-text-secondary)]">
                Loading MeetGraph AI workspace...
              </p>
            </div>
          ) : error ? (
            <div className="mx-auto mt-6 w-full max-w-2xl rounded-2xl border border-[var(--mg-border)] bg-white p-5 shadow-[var(--mg-shadow-sm)] sm:mt-10 sm:p-6">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={21}
                  className="mt-0.5 shrink-0 text-[var(--mg-danger)]"
                />

                <div className="min-w-0">
                  <h2 className="font-semibold text-[var(--mg-navy)]">
                    Unable to load workspace
                  </h2>

                  <p className="mt-2 break-words text-sm text-[var(--mg-text-secondary)]">
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

        <footer className="w-full border-t border-[var(--mg-border)] bg-white px-3 py-3 sm:px-6">
          <p className="text-center text-[10px] text-[var(--mg-muted)] sm:text-left sm:text-xs">
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
