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
        checked ? 'bg-[#269BA5]' : 'bg-[#D8D3D9]'
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
    <div className="flex items-center justify-between gap-5 border-b border-[#C6E5E6] py-4 last:border-b-0">
      <div>
        <p className="text-sm font-semibold text-[#34303A]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[#89818B]">
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
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#187D87]">
            Workspace configuration
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[#34303A]">
            Settings
          </h1>
          <p className="mt-1 text-sm text-[#89818B]">
            Manage your MeetGraph AI workspace preferences.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={resetPreferences}
            className="inline-flex items-center gap-2 rounded-xl border border-[#C6E5E6] bg-white px-4 py-2.5 text-sm font-semibold text-[#187D87] hover:bg-[#F3FAFA]"
          >
            <RotateCcw size={16} />
            Reset
          </button>

          <button
            type="button"
            onClick={savePreferences}
            disabled={saved}
            className="inline-flex items-center gap-2 rounded-xl bg-[#269BA5] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#187D87] disabled:cursor-not-allowed disabled:bg-[#DDF3F3] disabled:text-[#187D87] disabled:opacity-100"
          >
            <Save size={16} />
            Save changes
          </button>
        </div>
      </header>

      {!saved && (
        <div className="flex items-center gap-2 rounded-xl border border-[#C6E5E6] bg-[#DDF3F3] px-4 py-3 text-sm text-[#187D87]">
          <Info size={17} />
          You have unsaved changes.
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-[#BCE8D0] bg-[#EFFAF3] px-4 py-3 text-sm text-[#37845C]">
          <Check size={17} />
          Your preferences are saved on this browser.
        </div>
      )}

      <section className="rounded-2xl border border-[#C6E5E6] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3 border-b border-[#C6E5E6] pb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DDF3F3] text-[#187D87]">
            <Globe2 size={21} />
          </div>
          <div>
            <h2 className="font-semibold text-[#34303A]">
              Workspace information
            </h2>
            <p className="mt-1 text-xs text-[#89818B]">
              Current project context
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-[#89818B]">
              Workspace name
            </p>
            <p className="mt-2 font-semibold text-[#34303A]">
              MeetGraph AI
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#89818B]">
              Project ID
            </p>
            <p className="mt-2 font-semibold text-[#34303A]">
              {projectId}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#89818B]">
              Application
            </p>
            <p className="mt-2 font-semibold text-[#34303A]">
              MeetGraph Intelligence AI
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#89818B]">
              Environment
            </p>
            <p className="mt-2 font-semibold text-[#34303A]">
              Development workspace
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#C6E5E6] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3 border-b border-[#C6E5E6] pb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DDF3F3] text-[#187D87]">
            <Languages size={21} />
          </div>
          <div>
            <h2 className="font-semibold text-[#34303A]">
              Language preferences
            </h2>
            <p className="mt-1 text-xs text-[#89818B]">
              Preferred transcription language
            </p>
          </div>
        </div>

        <div className="mt-5 max-w-md">
          <label
            htmlFor="transcription-language"
            className="text-sm font-semibold text-[#34303A]"
          >
            Default language
          </label>
          <select
            id="transcription-language"
            value={preferences.language}
            onChange={(event) =>
              updatePreference('language', event.target.value)
            }
            className="mt-2 w-full rounded-xl border border-[#C6E5E6] bg-white px-4 py-3 text-sm text-[#34303A] outline-none focus:border-[#269BA5] focus:ring-2 focus:ring-[#DDF3F3]"
          >
            <option value="auto">Automatic detection</option>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="mr">Marathi</option>
          </select>
          <p className="mt-2 text-xs leading-5 text-[#89818B]">
            This preference is stored locally. It does not automatically
            change the language sent to the transcription API.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-[#C6E5E6] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3 border-b border-[#C6E5E6] pb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DDF3F3] text-[#187D87]">
            <Bell size={21} />
          </div>
          <div>
            <h2 className="font-semibold text-[#34303A]">
              Notification preferences
            </h2>
            <p className="mt-1 text-xs text-[#89818B]">
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

      <section className="rounded-2xl border border-[#C6E5E6] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3 border-b border-[#C6E5E6] pb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DDF3F3] text-[#187D87]">
            <SlidersHorizontal size={21} />
          </div>
          <div>
            <h2 className="font-semibold text-[#34303A]">
              Application preferences
            </h2>
            <p className="mt-1 text-xs text-[#89818B]">
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

      <section className="rounded-2xl border border-[#C6E5E6] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DDF3F3] text-[#187D87]">
            <Monitor size={21} />
          </div>
          <div>
            <h2 className="font-semibold text-[#34303A]">
              About MeetGraph AI
            </h2>
            <p className="mt-1 text-xs text-[#89818B]">
              Application information
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#89818B]">Product</span>
            <strong className="text-[#34303A]">
              MeetGraph Intelligence AI
            </strong>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#89818B]">Version</span>
            <strong className="text-[#34303A]">Development build</strong>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#89818B]">Workspace ID</span>
            <strong className="text-[#34303A]">{projectId}</strong>
          </div>
        </div>

        <div className="mt-5 flex items-start gap-2 rounded-xl bg-[#F3FAFA] p-3 text-xs leading-5 text-[#89818B]">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#187D87]" />
          <p>
            These preferences are stored in this browser for the selected
            project. They are not account-wide or synchronized with the server.
          </p>
        </div>
      </section>
    </div>
  );
}