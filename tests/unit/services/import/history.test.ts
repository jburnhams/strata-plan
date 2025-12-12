import { renderHook, act } from '@testing-library/react';
import * as HistoryService from '../../../../src/services/import/history';
import { getSettings, saveSettings } from '../../../../src/services/storage/settingsStorage';

// Mock storage
jest.mock('../../../../src/services/storage/settingsStorage');

describe('Import History', () => {
  const mockSettings = {
    importHistory: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getSettings as jest.Mock).mockResolvedValue(mockSettings);
  });

  it('should add item to history', async () => {
    await HistoryService.addToImportHistory('test.json', 1024);

    expect(saveSettings).toHaveBeenCalledWith(expect.objectContaining({
      importHistory: expect.arrayContaining([
        expect.objectContaining({
          filename: 'test.json',
          size: 1024
        })
      ])
    }));
  });

  it('should get import history', async () => {
    const history = [
      { filename: 'test.json', size: 1024, importedAt: new Date().toISOString() }
    ];
    (getSettings as jest.Mock).mockResolvedValue({ importHistory: history });

    const result = await HistoryService.getImportHistory();
    expect(result).toEqual(history);
  });

  it('should limit history to 10 items', async () => {
    const existing = Array.from({ length: 10 }, (_, i) => ({
      filename: `file${i}.json`,
      size: 100,
      importedAt: new Date().toISOString()
    }));

    (getSettings as jest.Mock).mockResolvedValue({ importHistory: existing });

    await HistoryService.addToImportHistory('new.json', 200);

    expect(saveSettings).toHaveBeenCalledWith(expect.objectContaining({
      importHistory: expect.arrayContaining([
        expect.objectContaining({ filename: 'new.json' })
      ])
    }));

    const savedHistory = (saveSettings as jest.Mock).mock.calls[0][0].importHistory;
    expect(savedHistory.length).toBe(10);
    expect(savedHistory[0].filename).toBe('new.json');
  });

  it('should clear history', async () => {
    await HistoryService.clearImportHistory();

    expect(saveSettings).toHaveBeenCalledWith(expect.objectContaining({
      importHistory: []
    }));
  });
});
