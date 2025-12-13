import { addToImportHistory, getImportHistory, clearImportHistory } from '../../../../src/services/import/history';
import * as settingsStorage from '../../../../src/services/storage/settingsStorage';

jest.mock('../../../../src/services/storage/settingsStorage');

describe('history coverage', () => {
  const mockGetSettings = settingsStorage.getSettings as jest.Mock;
  const mockSaveSettings = settingsStorage.saveSettings as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSettings.mockResolvedValue({ importHistory: [] });
  });

  it('should add to history', async () => {
    await addToImportHistory('test.json', 123);
    expect(mockSaveSettings).toHaveBeenCalledWith(expect.objectContaining({
      importHistory: expect.arrayContaining([
        expect.objectContaining({ filename: 'test.json', size: 123 })
      ])
    }));
  });

  it('should handle duplicate history items', async () => {
    mockGetSettings.mockResolvedValue({
      importHistory: [{ filename: 'test.json', importedAt: 'old', size: 100 }]
    });

    await addToImportHistory('test.json', 200);

    expect(mockSaveSettings).toHaveBeenCalledWith(expect.objectContaining({
      importHistory: expect.arrayContaining([
        expect.objectContaining({ filename: 'test.json', size: 200 })
      ])
    }));

    // Check length is 1 (duplicate removed)
    const callArgs = mockSaveSettings.mock.calls[0][0];
    expect(callArgs.importHistory).toHaveLength(1);
  });

  it('should limit history size', async () => {
    const history = Array(10).fill(0).map((_, i) => ({ filename: `file${i}.json`, size: 100 }));
    mockGetSettings.mockResolvedValue({ importHistory: history });

    await addToImportHistory('new.json', 200);

    const callArgs = mockSaveSettings.mock.calls[0][0];
    expect(callArgs.importHistory).toHaveLength(10);
    expect(callArgs.importHistory[0].filename).toBe('new.json');
  });

  it('should get history', async () => {
    const history = [{ filename: 'test.json', size: 100 }];
    mockGetSettings.mockResolvedValue({ importHistory: history });
    const result = await getImportHistory();
    expect(result).toEqual(history);
  });

  it('should clear history', async () => {
    await clearImportHistory();
    expect(mockSaveSettings).toHaveBeenCalledWith(expect.objectContaining({
      importHistory: []
    }));
  });

  it('should handle errors in addToImportHistory', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetSettings.mockRejectedValue(new Error('Fail'));
    await addToImportHistory('test.json', 123);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should handle errors in getImportHistory', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetSettings.mockRejectedValue(new Error('Fail'));
    const result = await getImportHistory();
    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should handle errors in clearImportHistory', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetSettings.mockRejectedValue(new Error('Fail'));
    await clearImportHistory();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
