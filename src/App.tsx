import { useEffect, useState } from 'react';

import {
  api,
  authStorage,
  type Project,
  type AuthUser,
} from './api/client';

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

import Login from './pages/Login';
import Register from './pages/Register';

import {
  FolderOpen,
  RefreshCw,
  AlertCircle,
  Plus,
  X,
} from 'lucide-react';

type AuthPage = 'login' | 'register';

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authPage, setAuthPage] = useState<AuthPage>('login');
  const [authLoading, setAuthLoading] = useState(true);

  const [projects, setProjects] = useState<Project[]>([]);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [selectedProjectId, setSelectedProjectId] =
    useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);
  const [workspaceError, setWorkspaceError] = useState('');

  // Restore authenticated session

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const token = authStorage.getToken();

      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const currentUser = await api.getCurrentUser();

        if (!cancelled) {
          setUser(currentUser);
        }
      } catch {
        authStorage.clearToken();

        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load authenticated user's projects

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function loadProjects() {
      try {
        setLoading(true);
        setError('');

        const data = await api.getProjects();

        if (cancelled) return;

        setProjects(data);

        setSelectedProjectId((previousId) => {
          if (
            previousId !== null &&
            data.some((project) => project.id === previousId)
          ) {
            return previousId;
          }

          return data.length > 0 ? data[0].id : null;
        });
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load projects.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProjects();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Login

  async function handleLogin(email: string, password: string) {
    const result = await api.login(email, password);

    setUser(result.user);
    setProjects([]);
    setSelectedProjectId(null);
    setActivePage('dashboard');
    setError('');
  }

  // Registration followed by login

  async function handleRegister(
    name: string,
    email: string,
    password: string,
  ) {
    await api.register(name, email, password);
    await handleLogin(email, password);
  }

  // Logout

  function handleLogout() {
    api.logout();

    setUser(null);
    setProjects([]);
    setSelectedProjectId(null);
    setShowUploadModal(false);
    setShowCreateWorkspace(false);
    setMobileMenuOpen(false);
    setActivePage('dashboard');
    setError('');
    setAuthPage('login');
  }

  // Create workspace

  async function handleCreateWorkspace(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setWorkspaceError('');

    if (workspaceName.trim().length < 2) {
      setWorkspaceError('Workspace name must contain at least 2 characters.');
      return;
    }

    try {
      setCreatingWorkspace(true);

      const project = await api.createProject(
        workspaceName.trim(),
        workspaceDescription.trim(),
      );

      setProjects((previous) => [
        project,
        ...previous.filter((item) => item.id !== project.id),
      ]);

      setSelectedProjectId(project.id);
      setActivePage('dashboard');

      setWorkspaceName('');
      setWorkspaceDescription('');
      setShowCreateWorkspace(false);
    } catch (err) {
      setWorkspaceError(
        err instanceof Error
          ? err.message
          : 'Unable to create workspace.',
      );
    } finally {
      setCreatingWorkspace(false);
    }
  }

  // Mobile navigation

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

  // Navigation

  function handleNavigate(page: Page) {
    setActivePage(page);
    setMobileMenuOpen(false);
  }

  // Render existing dashboard pages

  function renderPage() {
    if (selectedProjectId === null) {
      return (
        <section className="mx-auto mt-10 w-full max-w-xl rounded-2xl border border-[#E2DDF5] bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0E9FF] text-[#6810D9]">
            <FolderOpen size={30} strokeWidth={1.7} />
          </div>

          <h2 className="mt-5 text-xl font-semibold text-[#17152B]">
            No workspace found
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#625D7A]">
            Create your first workspace to start uploading and analysing meetings.
          </p>

          <button
            type="button"
            onClick={() => setShowCreateWorkspace(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#6810D9] to-[#5135E8] px-5 py-3 text-sm font-semibold text-white transition hover:shadow-md hover:shadow-[#6810D9]/20"
          >
            <Plus size={17} />
            Create Workspace
          </button>
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

  // Authentication loading

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#E8E8FA]">
        <div className="text-center">
          <RefreshCw
            size={28}
            className="mx-auto animate-spin text-[#6810D9]"
          />

          <p className="mt-4 text-sm text-[#625D7A]">
            Verifying your account...
          </p>
        </div>
      </div>
    );
  }

  // Login and registration

  if (!user) {
    if (authPage === 'register') {
      return (
        <Register
          onRegister={handleRegister}
          onNavigateLogin={() => setAuthPage('login')}
        />
      );
    }

    return (
      <Login
        onLogin={handleLogin}
        onNavigateRegister={() => setAuthPage('register')}
      />
    );
  }

  // Main application

  return (
    <div className="flex min-h-screen w-full overflow-x-clip bg-[#E8E8FA] text-[#17152B]">

      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        isMobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] md:hidden"
        />
      )}

      <div className="flex min-h-screen min-w-0 w-full flex-1 flex-col md:w-[calc(100%-238px)]">

        <TopHeader
          projects={projects}
          selectedProjectId={selectedProjectId}
          user={user}
          onProjectChange={setSelectedProjectId}
          onNavigate={handleNavigate}
          onUploadMeeting={() => {
            if (selectedProjectId !== null) {
              setShowUploadModal(true);
            }
          }}
          onCreateWorkspace={() => {
            setWorkspaceError('');
            setShowCreateWorkspace(true);
          }}
          onLogout={handleLogout}
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        <main className="min-h-0 min-w-0 w-full flex-1 overflow-x-clip bg-[#E8E8FA] p-3 sm:p-4 md:overflow-y-auto md:p-7 xl:p-8">

          {loading ? (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
              <RefreshCw
                size={24}
                className="animate-spin text-[#6810D9]"
              />

              <p className="mt-4 text-sm text-[#625D7A]">
                Loading MeetGraph AI workspace...
              </p>
            </div>
          ) : error ? (
            <div className="mx-auto mt-6 w-full max-w-2xl rounded-2xl border border-[#E2DDF5] bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={21}
                  className="mt-0.5 shrink-0 text-red-500"
                />

                <div className="min-w-0">
                  <h2 className="font-semibold text-[#17152B]">
                    Unable to load workspace
                  </h2>

                  <p className="mt-2 break-words text-sm text-[#625D7A]">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-4 rounded-lg bg-gradient-to-r from-[#6810D9] to-[#5135E8] px-4 py-2.5 text-sm font-semibold text-white hover:shadow-md"
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

        <footer className="w-full border-t border-[#E2DDF5] bg-white px-3 py-3 sm:px-6">
          <p className="text-center text-[10px] text-[#89849F] sm:text-left sm:text-xs">
            MeetGraph AI <span className="mx-1">·</span> Meeting Intelligence Workspace
          </p>
        </footer>
      </div>

      {/* Create workspace dialog */}

      {showCreateWorkspace && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#17152B]/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#E2DDF5] bg-white p-6 shadow-2xl">

            <div className="flex items-start justify-between">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0E9FF] text-[#6810D9]">
                  <FolderOpen size={22} />
                </div>

                <h2 className="mt-4 text-xl font-bold text-[#17152B]">
                  Create Workspace
                </h2>

                <p className="mt-1 text-sm text-[#625D7A]">
                  Set up a workspace for your meetings.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateWorkspace(false)}
                disabled={creatingWorkspace}
                aria-label="Close dialog"
                className="rounded-lg p-2 text-[#89849F] hover:bg-[#F0E9FF] hover:text-[#6810D9]"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleCreateWorkspace}
              className="mt-6 space-y-4"
            >
              <div>
                <label
                  htmlFor="workspace-name"
                  className="mb-2 block text-sm font-medium text-[#17152B]"
                >
                  Workspace name
                </label>

                <input
                  id="workspace-name"
                  type="text"
                  value={workspaceName}
                  onChange={(event) =>
                    setWorkspaceName(event.target.value)
                  }
                  placeholder="e.g. MeetGraph AI Development"
                  minLength={2}
                  maxLength={200}
                  required
                  className="w-full rounded-xl border border-[#E2DDF5] bg-[#F8F5FF] px-4 py-3 text-sm text-[#17152B] outline-none transition placeholder:text-[#89849F] focus:border-[#6810D9] focus:ring-2 focus:ring-[#F0E9FF]"
                />
              </div>

              <div>
                <label
                  htmlFor="workspace-description"
                  className="mb-2 block text-sm font-medium text-[#17152B]"
                >
                  Description (optional)
                </label>

                <textarea
                  id="workspace-description"
                  value={workspaceDescription}
                  onChange={(event) =>
                    setWorkspaceDescription(event.target.value)
                  }
                  placeholder="Describe your workspace..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-[#E2DDF5] bg-[#F8F5FF] px-4 py-3 text-sm text-[#17152B] outline-none transition placeholder:text-[#89849F] focus:border-[#6810D9] focus:ring-2 focus:ring-[#F0E9FF]"
                />
              </div>

              {workspaceError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {workspaceError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateWorkspace(false)}
                  disabled={creatingWorkspace}
                  className="rounded-lg border border-[#E2DDF5] px-4 py-2.5 text-sm font-medium text-[#625D7A] hover:bg-[#F8F5FF]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingWorkspace}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#6810D9] to-[#5135E8] px-5 py-2.5 text-sm font-semibold text-white transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus size={16} />
                  {creatingWorkspace ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload meeting modal */}

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