// import { DEFAULT_SETTINGS } from '../../constants/defaults';
import { getSettings, saveSettings } from '../storage/settingsStorage';

const MAX_HISTORY_ITEMS = 10;

export interface ImportHistoryItem {
  filename: string;
  importedAt: string;
  size: number;
}

/**
 * Adds an item to the import history.
 *
 * @param filename The name of the imported file
 * @param size The size of the imported file in bytes
 */
export async function addToImportHistory(filename: string, size: number): Promise<void> {
  try {
    const settings = await getSettings();
    const history = settings.importHistory || [];

    // Create new item
    const newItem: ImportHistoryItem = {
      filename,
      importedAt: new Date().toISOString(),
      size
    };

    // Add to beginning, filter duplicates (by filename), and limit length
    const newHistory = [
      newItem,
      ...history.filter(item => item.filename !== filename)
    ].slice(0, MAX_HISTORY_ITEMS);

    // Save updated settings
    await saveSettings({
      ...settings,
      importHistory: newHistory
    });
  } catch (error) {
    console.error('Failed to update import history:', error);
  }
}

/**
 * Retrieves the import history.
 *
 * @returns Promise resolving to the list of recent imports
 */
export async function getImportHistory(): Promise<ImportHistoryItem[]> {
  try {
    const settings = await getSettings();
    return settings.importHistory || [];
  } catch (error) {
    console.error('Failed to get import history:', error);
    return [];
  }
}

/**
 * Clears the import history.
 */
export async function clearImportHistory(): Promise<void> {
  try {
    const settings = await getSettings();
    await saveSettings({
      ...settings,
      importHistory: []
    });
  } catch (error) {
    console.error('Failed to clear import history:', error);
  }
}
