import { initDatabase, _resetDatabaseInstance } from '@/services/storage/database';
import { openDB } from 'idb';

// Mock idb
jest.mock('idb', () => ({
  openDB: jest.fn(),
}));

describe('Database Service', () => {
  const mockCreateObjectStore = jest.fn();
  const mockCreateIndex = jest.fn();
  const mockDb = {
    objectStoreNames: {
      contains: jest.fn(),
    },
    createObjectStore: mockCreateObjectStore,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    _resetDatabaseInstance();
    mockCreateObjectStore.mockReturnValue({
      createIndex: mockCreateIndex,
    });
  });

  it('initializes the database and creates stores if they do not exist', async () => {
    (openDB as jest.Mock).mockImplementation((name, version, { upgrade }) => {
      // Simulate upgrade callback
      upgrade(mockDb);
      return Promise.resolve(mockDb);
    });

    // Mock objectStoreNames.contains to return false so stores are created
    mockDb.objectStoreNames.contains.mockReturnValue(false);

    await initDatabase();

    expect(openDB).toHaveBeenCalledWith('strataplan-db', 1, expect.any(Object));
    expect(mockDb.createObjectStore).toHaveBeenCalledWith('projects', { keyPath: 'id' });
    expect(mockCreateIndex).toHaveBeenCalledWith('by-updated', 'updatedAt');
    expect(mockCreateIndex).toHaveBeenCalledWith('by-name', 'name');
    expect(mockDb.createObjectStore).toHaveBeenCalledWith('settings', { keyPath: 'key' });
  });

  it('does not create stores if they already exist', async () => {
    (openDB as jest.Mock).mockImplementation((name, version, { upgrade }) => {
      upgrade(mockDb);
      return Promise.resolve(mockDb);
    });

    // Mock objectStoreNames.contains to return true
    mockDb.objectStoreNames.contains.mockReturnValue(true);

    await initDatabase();

    expect(mockDb.createObjectStore).not.toHaveBeenCalled();
  });

  it('returns the same promise on subsequent calls (Singleton)', async () => {
    (openDB as jest.Mock).mockResolvedValue(mockDb);

    const firstCall = initDatabase();
    const secondCall = initDatabase();

    expect(firstCall).toBe(secondCall);
    expect(openDB).toHaveBeenCalledTimes(1);
  });
});
