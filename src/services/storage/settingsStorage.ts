import { initDatabase } from './database';

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  defaultUnits: 'meters' | 'feet';
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
  autoSaveEnabled: boolean;
  autoSaveInterval: number; // in seconds
  materialQuality: 'simple' | 'standard' | 'detailed';
  colorScheme: string;
  recentProjects: string[]; // Last 5 project IDs
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  defaultUnits: 'meters',
  showGrid: true,
  gridSize: 0.5,
  snapToGrid: true,
  autoSaveEnabled: true,
  autoSaveInterval: 30,
  materialQuality: 'standard',
  colorScheme: 'default',
  recentProjects: [],
};

const SETTINGS_KEY = 'user_settings';

/**
 * Loads user settings from IndexedDB.
 * Returns default settings if not found.
 */
export const loadSettings = async (): Promise<UserSettings> => {
  const db = await initDatabase();
  const stored = await db.get('settings', SETTINGS_KEY);

  if (!stored || !stored.value) {
    return { ...DEFAULT_SETTINGS };
  }

  // Merge stored settings with defaults to handle new fields
  return {
    ...DEFAULT_SETTINGS,
    ...(stored.value as Partial<UserSettings>),
  };
};

/**
 * Saves user settings to IndexedDB.
 * Merges with existing settings.
 */
export const saveSettings = async (settings: Partial<UserSettings>): Promise<void> => {
  const db = await initDatabase();

  // Get current settings first to ensure we merge correctly
  const current = await loadSettings();

  const updated = {
    ...current,
    ...settings,
  };

  await db.put('settings', {
    key: SETTINGS_KEY,
    value: updated,
  });
};

/**
 * Updates the list of recent projects.
 * Keeps only the last 5 unique project IDs.
 */
export const addRecentProject = async (projectId: string): Promise<void> => {
  const settings = await loadSettings();
  let recent = settings.recentProjects || [];

  // Remove if exists (to move to top)
  recent = recent.filter(id => id !== projectId);

  // Add to front
  recent.unshift(projectId);

  // Limit to 5
  if (recent.length > 5) {
    recent = recent.slice(0, 5);
  }

  await saveSettings({ recentProjects: recent });
};

/**
 * Removes a project from recent list (e.g. on delete)
 */
export const removeRecentProject = async (projectId: string): Promise<void> => {
    const settings = await loadSettings();
    const recent = (settings.recentProjects || []).filter(id => id !== projectId);

    // Only save if changed to avoid unnecessary writes
    if (recent.length !== settings.recentProjects.length) {
        await saveSettings({ recentProjects: recent });
    }
};
