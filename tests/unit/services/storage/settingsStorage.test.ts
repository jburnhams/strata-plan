import { loadSettings, saveSettings, addRecentProject, removeRecentProject, DEFAULT_SETTINGS } from '@/services/storage/settingsStorage';
import { initDatabase } from '@/services/storage/database';

jest.mock('@/services/storage/database');

describe('Settings Storage Service', () => {
  const mockDb = {
    put: jest.fn(),
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (initDatabase as jest.Mock).mockResolvedValue(mockDb);
  });

  describe('loadSettings', () => {
    it('returns default settings if nothing stored', async () => {
      mockDb.get.mockResolvedValue(undefined);

      const settings = await loadSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
      expect(mockDb.get).toHaveBeenCalledWith('settings', 'user_settings');
    });

    it('returns stored settings merged with defaults', async () => {
      const stored = {
        value: {
          theme: 'dark',
          // missing other fields
        }
      };
      mockDb.get.mockResolvedValue(stored);

      const settings = await loadSettings();
      expect(settings.theme).toBe('dark');
      expect(settings.defaultUnits).toBe('meters'); // Default
    });
  });

  describe('saveSettings', () => {
    it('merges and saves settings', async () => {
      // Mock existing
      mockDb.get.mockResolvedValue({ value: DEFAULT_SETTINGS });

      await saveSettings({ theme: 'dark' });

      expect(mockDb.put).toHaveBeenCalledWith('settings', {
        key: 'user_settings',
        value: expect.objectContaining({
          ...DEFAULT_SETTINGS,
          theme: 'dark'
        })
      });
    });
  });

  describe('addRecentProject', () => {
    it('adds new project to top of list', async () => {
      mockDb.get.mockResolvedValue({ value: { ...DEFAULT_SETTINGS, recentProjects: ['p2', 'p3'] } });

      await addRecentProject('p1');

      expect(mockDb.put).toHaveBeenCalledWith('settings', expect.objectContaining({
        value: expect.objectContaining({
          recentProjects: ['p1', 'p2', 'p3']
        })
      }));
    });

    it('moves existing project to top', async () => {
      mockDb.get.mockResolvedValue({ value: { ...DEFAULT_SETTINGS, recentProjects: ['p2', 'p1', 'p3'] } });

      await addRecentProject('p1');

      expect(mockDb.put).toHaveBeenCalledWith('settings', expect.objectContaining({
        value: expect.objectContaining({
          recentProjects: ['p1', 'p2', 'p3']
        })
      }));
    });

    it('limits list to 5 items', async () => {
      mockDb.get.mockResolvedValue({ value: { ...DEFAULT_SETTINGS, recentProjects: ['1', '2', '3', '4', '5'] } });

      await addRecentProject('6');

      expect(mockDb.put).toHaveBeenCalledWith('settings', expect.objectContaining({
        value: expect.objectContaining({
          recentProjects: ['6', '1', '2', '3', '4']
        })
      }));
    });
  });

  describe('removeRecentProject', () => {
      it('removes project if in list', async () => {
          mockDb.get.mockResolvedValue({ value: { ...DEFAULT_SETTINGS, recentProjects: ['p1', 'p2'] } });

          await removeRecentProject('p1');

          expect(mockDb.put).toHaveBeenCalledWith('settings', expect.objectContaining({
              value: expect.objectContaining({
                  recentProjects: ['p2']
              })
          }));
      });

      it('does nothing if not in list', async () => {
          mockDb.get.mockResolvedValue({ value: { ...DEFAULT_SETTINGS, recentProjects: ['p2'] } });

          await removeRecentProject('p1');

          expect(mockDb.put).not.toHaveBeenCalled();
      });
  });
});
