import { loadSampleProject } from '../../../../src/services/import/samples';

// Mock global fetch
global.fetch = jest.fn();

describe('Sample Projects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load sample project', async () => {
    const mockSample = {
      id: 'sample-1',
      name: 'Sample',
      units: 'meters',
      rooms: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockSample
    });

    const result = await loadSampleProject('sample.json');
    expect(result.id).toBe('sample-1');
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it('should handle fetch errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      statusText: 'Not Found'
    });

    await expect(loadSampleProject('missing.json')).rejects.toThrow('Failed to load sample project');
  });

  it('should validate sample structure', async () => {
    const invalidSample = {
      // Missing fields
      name: 'Invalid'
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => invalidSample
    });

    await expect(loadSampleProject('invalid.json')).rejects.toThrow('Sample project validation failed');
  });
});
