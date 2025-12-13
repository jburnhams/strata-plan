import { getSettings, saveSettings, DEFAULT_SETTINGS } from '../../../../src/services/storage/settingsStorage';
import { initDatabase } from '../../../../src/services/storage/database';

jest.mock('../../../../src/services/storage/database');

describe('settingsStorage', () => {
  const mockDb = {
    get: jest.fn(),
    put: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (initDatabase as jest.Mock).mockResolvedValue(mockDb);
  });

  describe('getSettings', () => {
    it('should return default settings if none stored', async () => {
      mockDb.get.mockResolvedValue(undefined);
      const settings = await getSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it('should return stored settings merged with defaults', async () => {
      const stored = { value: { theme: 'dark' } };
      mockDb.get.mockResolvedValue(stored);
      const settings = await getSettings();
      expect(settings).toEqual({ ...DEFAULT_SETTINGS, theme: 'dark' });
    });
  });

  describe('saveSettings', () => {
    it('should save settings to idb', async () => {
      mockDb.get.mockResolvedValue(undefined); // Load defaults first
      const newSettings = { theme: 'light' as const };
      await saveSettings(newSettings);

      expect(mockDb.put).toHaveBeenCalledWith('settings', expect.objectContaining({
        key: 'user_settings',
        value: expect.objectContaining({ theme: 'light' })
      }));
    });
  });

  describe('recentProjects', () => {
      it('should add recent project', async () => {
          // Assume existing settings with empty recent projects
          mockDb.get.mockResolvedValue({ value: { recentProjects: [] } });
          const { addRecentProject } = require('../../../../src/services/storage/settingsStorage');

          await addRecentProject('p1');

          expect(mockDb.put).toHaveBeenCalledWith('settings', expect.objectContaining({
              value: expect.objectContaining({ recentProjects: ['p1'] })
          }));
      });

      it('should remove recent project', async () => {
          mockDb.get.mockResolvedValue({ value: { recentProjects: ['p1', 'p2'] } });
          const { removeRecentProject } = require('../../../../src/services/storage/settingsStorage');

          await removeRecentProject('p1');

          expect(mockDb.put).toHaveBeenCalledWith('settings', expect.objectContaining({
              value: expect.objectContaining({ recentProjects: ['p2'] })
          }));
      });
  });
});
