
import { useEffect, useState } from 'react';
import {
  Bell,
  Check,
  Globe2,
  Info,
  Languages,
  Monitor,
  RotateCcw,
  Save,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Volume2,
} from 'lucide-react';

interface SettingsProps {
  projectId: number;
}

interface WorkspacePreferences {
  language: string;
  notifications: boolean;
  processingNotifications: boolean;
  decisionNotifications: boolean;
  soundEffects: boolean;
  autoRefresh: boolean;
}

const DEFAULT_PREFERENCES: WorkspacePreferences = {
  language: 'auto',
  notifications: true,
  processingNotifications: true,
  decisionNotifications: true,
  soundEffects: false,
  autoRefresh: true,
};

function getStorageKey(projectId: number) {
  return `meetgraph-settings-${projectId}`;
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-[#6810D9]' : 'bg-[#D8D2E8]'
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function SettingRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-[#E2DDF5] py-4 last:border-b-0">
      <div>
        <p className="text-sm font-semibold text-[#17152B]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[#625D7A]">
          {description}
        </p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

export default function Settings({ projectId }: SettingsProps) {
  const [preferences, setPreferences] =
    useState<WorkspacePreferences>(DEFAULT_PREFERENCES);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(getStorageKey(projectId));

      if (stored) {
        const parsed = JSON.parse(stored) as Partial<WorkspacePreferences>;

        setPreferences({
          ...DEFAULT_PREFERENCES,
          ...parsed,
        });
      } else {
        setPreferences(DEFAULT_PREFERENCES);
      }

      setSaved(true);
    } catch {
      setPreferences(DEFAULT_PREFERENCES);
      setSaved(true);
    }
  }, [projectId]);

  function updatePreference<K extends keyof WorkspacePreferences>(
    key: K,
    value: WorkspacePreferences[K],
  ) {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));
    setSaved(false);
  }

  function savePreferences() {
    try {
      localStorage.setItem(
        getStorageKey(projectId),
        JSON.stringify(preferences),
      );
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }

  function resetPreferences() {
    setPreferences(DEFAULT_PREFERENCES);
    setSaved(false);
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-7">
      {/* Page Header */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6810D9]">
            Workspace configuration
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[#17152B]">
            Settings
          </h1>
          <p className="mt-1 text-sm text-[#625D7A]">
            Manage your MeetGraph AI workspace preferences.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={resetPreferences}
            className="inline-flex items-center gap-2 rounded-xl border border-[#E2DDF5] bg-[#FFFFFF] px-4 py-2.5 text-sm font-semibold text-[#17152B] transition hover:border-[#6810D9] hover:bg-[#F8F5FF]"
          >
            <RotateCcw size={16} />
            Reset
          </button>

          <button
            type="button"
            onClick={savePreferences}
            disabled={saved}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              saved
                ? 'cursor-not-allowed border border-[#E2DDF5] bg-[#E8E1F5] text-[#625D7A]'
                : 'bg-gradient-to-r from-[#7412D8] to-[#5135E8] text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#6810D9]/20'
            }`}
          >
            <Save size={16} />
            Save changes
          </button>
        </div>
      </header>

      {/* Unsaved Changes */}
      {!saved && (
        <div className="flex items-center gap-2 rounded-xl border border-[#E2DDF5] bg-[#F0E9FF] px-4 py-3 text-sm text-[#6810D9]">
          <Info size={17} />
          You have unsaved changes.
        </div>
      )}

      {/* Saved Confirmation */}
      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-[#BCE8D0] bg-[#EFFAF3] px-4 py-3 text-sm text-[#37845C]">
          <Check size={17} />
          Your preferences are saved on this browser.
        </div>
      )}

      {/* Workspace Information */}
      <section className="rounded-2xl border border-[#E2DDF5] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3 border-b border-[#E2DDF5] pb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0E9FF] text-[#6810D9]">
            <Globe2 size={21} />
          </div>
          <div>
            <h2 className="font-semibold text-[#17152B]">
              Workspace information
            </h2>
            <p className="mt-1 text-xs text-[#625D7A]">
              Current project context
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-[#625D7A]">
              Workspace name
            </p>
            <p className="mt-2 font-semibold text-[#17152B]">
              MeetGraph AI
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#625D7A]">
              Project ID
            </p>
            <p className="mt-2 font-semibold text-[#17152B]">
              {projectId}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#625D7A]">
              Application
            </p>
            <p className="mt-2 font-semibold text-[#17152B]">
              MeetGraph Intelligence AI
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#625D7A]">
              Environment
            </p>
            <p className="mt-2 font-semibold text-[#17152B]">
              Development workspace
            </p>
          </div>
        </div>
      </section>

      {/* Language Preferences */}
      <section className="rounded-2xl border border-[#E2DDF5] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3 border-b border-[#E2DDF5] pb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0E9FF] text-[#6810D9]">
            <Languages size={21} />
          </div>
          <div>
            <h2 className="font-semibold text-[#17152B]">
              Language preferences
            </h2>
            <p className="mt-1 text-xs text-[#625D7A]">
              Preferred transcription language
            </p>
          </div>
        </div>

        <div className="mt-5 max-w-md">
          <label
            htmlFor="transcription-language"
            className="text-sm font-semibold text-[#17152B]"
          >
            Default language
          </label>
          <select
            id="transcription-language"
            value={preferences.language}
            onChange={(event) =>
              updatePreference('language', event.target.value)
            }
            className="mt-2 w-full rounded-xl border border-[#E2DDF5] bg-[#F8F5FF] px-4 py-3 text-sm text-[#17152B] outline-none focus:border-[#6810D9] focus:ring-2 focus:ring-[#F0E9FF]"
          >
            <option value="auto">Automatic detection</option>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="mr">Marathi</option>
          </select>
          <p className="mt-2 text-xs leading-5 text-[#625D7A]">
            This preference is stored locally. It does not automatically
            change the language sent to the transcription API.
          </p>
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="rounded-2xl border border-[#E2DDF5] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3 border-b border-[#E2DDF5] pb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0E9FF] text-[#6810D9]">
            <Bell size={21} />
          </div>
          <div>
            <h2 className="font-semibold text-[#17152B]">
              Notification preferences
            </h2>
            <p className="mt-1 text-xs text-[#625D7A]">
              Configure local application notification preferences
            </p>
          </div>
        </div>

        <div className="mt-2">
          <SettingRow
            title="Enable notifications"
            description="Master preference for application notifications."
            checked={preferences.notifications}
            onChange={(value) => updatePreference('notifications', value)}
          />
          <SettingRow
            title="Meeting processing updates"
            description="Preference for transcription and processing updates."
            checked={preferences.processingNotifications}
            onChange={(value) =>
              updatePreference('processingNotifications', value)
            }
          />
          <SettingRow
            title="Decision updates"
            description="Preference for updates related to extracted decisions."
            checked={preferences.decisionNotifications}
            onChange={(value) =>
              updatePreference('decisionNotifications', value)
            }
          />
        </div>
      </section>

      {/* Application Preferences */}
      <section className="rounded-2xl border border-[#E2DDF5] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3 border-b border-[#E2DDF5] pb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0E9FF] text-[#6810D9]">
            <SlidersHorizontal size={21} />
          </div>
          <div>
            <h2 className="font-semibold text-[#17152B]">
              Application preferences
            </h2>
            <p className="mt-1 text-xs text-[#625D7A]">
              Customize local application behavior
            </p>
          </div>
        </div>

        <div className="mt-2">
          <SettingRow
            title="Sound effects"
            description="Preference for application sound effects."
            checked={preferences.soundEffects}
            onChange={(value) => updatePreference('soundEffects', value)}
          />
          <SettingRow
            title="Automatic refresh"
            description="Preference for automatically refreshing displayed information."
            checked={preferences.autoRefresh}
            onChange={(value) => updatePreference('autoRefresh', value)}
          />
        </div>
      </section>

      {/* About MeetGraph AI */}
      <section className="rounded-2xl border border-[#E2DDF5] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0E9FF] text-[#6810D9]">
            <Monitor size={21} />
          </div>
          <div>
            <h2 className="font-semibold text-[#17152B]">
              About MeetGraph AI
            </h2>
            <p className="mt-1 text-xs text-[#625D7A]">
              Application information
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#625D7A]">Product</span>
            <strong className="text-[#17152B]">
              MeetGraph Intelligence AI
            </strong>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#625D7A]">Version</span>
            <strong className="text-[#17152B]">Development build</strong>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#625D7A]">Workspace ID</span>
            <strong className="text-[#17152B]">{projectId}</strong>
          </div>
        </div>

        <div className="mt-5 flex items-start gap-2 rounded-xl bg-[#F8F5FF] p-3 text-xs leading-5 text-[#625D7A]">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#6810D9]" />
          <p>
            These preferences are stored in this browser for the selected
            project. They are not account-wide or synchronized with the server.
          </p>
        </div>
      </section>
    </div>
  );
}
