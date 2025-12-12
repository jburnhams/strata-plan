import { saveProject, loadProject, updateProject, deleteProject, listProjects, projectExists } from '@/services/storage/projectStorage';
import { initDatabase, StoredProject } from '@/services/storage/database';
import { serializeFloorplan, deserializeFloorplan } from '@/services/storage/serialization';
import { migrateData } from '@/services/storage/migrations';
import { Floorplan } from '@/types/floorplan';

// Mock dependencies
jest.mock('@/services/storage/database');
jest.mock('@/services/storage/serialization', () => ({
    serializeFloorplan: jest.fn(),
    deserializeFloorplan: jest.fn(),
    CURRENT_VERSION: '1.0.0', // Ensure this is exported for the mock
}));
jest.mock('@/services/storage/migrations');

// Need to import CURRENT_VERSION to use it in tests, but we mocked it.
// However, since we defined the mock factory above, we can assume '1.0.0' is used internally by the SUT if it imports it.
// To use it here, we can just use the literal '1.0.0'.
const MOCK_CURRENT_VERSION = '1.0.0';

describe('Project Storage Service', () => {
  const mockDb = {
    put: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
    getKey: jest.fn(),
    getAllFromIndex: jest.fn(),
  };

  const mockDate = new Date('2023-01-01T12:00:00.000Z');
  const mockFloorplan: Floorplan = {
    id: 'p1',
    name: 'Test Project',
    createdAt: mockDate,
    updatedAt: mockDate,
    rooms: [],
  } as unknown as Floorplan;

  const mockSerialized = {
    id: 'p1',
    name: 'Test Project',
    version: '1.0.0',
    rooms: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (initDatabase as jest.Mock).mockResolvedValue(mockDb);
    // Re-setup the mocks because jest.resetModules() or similar might clear them,
    // but mainly to be explicit about return values.
    const { serializeFloorplan, deserializeFloorplan } = require('@/services/storage/serialization');
    (serializeFloorplan as jest.Mock).mockReturnValue(mockSerialized);
    (deserializeFloorplan as jest.Mock).mockReturnValue(mockFloorplan);
    (migrateData as jest.Mock).mockImplementation((data) => data);
  });

  describe('saveProject', () => {
    it('serializes and stores the project', async () => {
      await saveProject(mockFloorplan, 'thumb-data');

      expect(serializeFloorplan).toHaveBeenCalledWith(mockFloorplan);
      expect(mockDb.put).toHaveBeenCalledWith('projects', expect.objectContaining({
        id: 'p1',
        name: 'Test Project',
        data: mockSerialized,
        thumbnail: 'thumb-data',
        version: '1.0.0',
      }));
    });

    it('throws error if floorplan is null', async () => {
      await expect(saveProject(null as unknown as Floorplan)).rejects.toThrow();
    });
  });

  describe('loadProject', () => {
    it('retrieves and deserializes the project', async () => {
      const storedProject = { data: { ...mockSerialized, version: MOCK_CURRENT_VERSION } };
      mockDb.get.mockResolvedValue(storedProject);

      const result = await loadProject('p1');

      expect(mockDb.get).toHaveBeenCalledWith('projects', 'p1');
      expect(migrateData).not.toHaveBeenCalled();
      expect(deserializeFloorplan).toHaveBeenCalledWith(storedProject.data);
      expect(result).toBe(mockFloorplan);
    });

    it('returns null if project not found', async () => {
      mockDb.get.mockResolvedValue(undefined);
      const result = await loadProject('p1');
      expect(result).toBeNull();
    });

    it('triggers migration for old versions and saves back', async () => {
       const oldData = { ...mockSerialized, version: '0.9.0' };
       const storedProject = { id: 'p1', data: oldData };
       const migratedData = { ...oldData, version: MOCK_CURRENT_VERSION, migrated: true };

       mockDb.get.mockResolvedValue(storedProject);
       (migrateData as jest.Mock).mockReturnValue(migratedData);
       (deserializeFloorplan as jest.Mock).mockReturnValue(mockFloorplan);

       await loadProject('p1');

       expect(migrateData).toHaveBeenCalledWith(oldData, MOCK_CURRENT_VERSION);
       expect(mockDb.put).toHaveBeenCalledWith('projects', expect.objectContaining({
           data: migratedData,
           version: MOCK_CURRENT_VERSION
       }));
       expect(deserializeFloorplan).toHaveBeenCalledWith(migratedData);
    });

    it('throws error if deserialization fails', async () => {
        mockDb.get.mockResolvedValue({ data: mockSerialized });
        const { deserializeFloorplan } = require('@/services/storage/serialization');
        (deserializeFloorplan as jest.Mock).mockImplementation(() => {
            throw new Error('Deserialization error');
        });

        await expect(loadProject('p1')).rejects.toThrow('Failed to load project');
    });
  });

  describe('updateProject', () => {
      it('updates the project if IDs match', async () => {
          await updateProject('p1', mockFloorplan);
          expect(mockDb.put).toHaveBeenCalled();
      });

      it('throws error if IDs mismatch', async () => {
          await expect(updateProject('wrong-id', mockFloorplan)).rejects.toThrow('ID mismatch');
      });
  });

  describe('deleteProject', () => {
    it('removes the project from DB', async () => {
      await deleteProject('p1');
      expect(mockDb.delete).toHaveBeenCalledWith('projects', 'p1');
    });
  });

  describe('projectExists', () => {
      it('returns true if key exists', async () => {
          mockDb.getKey.mockResolvedValue('p1');
          const exists = await projectExists('p1');
          expect(exists).toBe(true);
      });

      it('returns false if key is undefined', async () => {
          mockDb.getKey.mockResolvedValue(undefined);
          const exists = await projectExists('p1');
          expect(exists).toBe(false);
      });
  });

  describe('listProjects', () => {
    it('returns a list of project metadata sorted by newness', async () => {
      const storedProjects = [
        { id: 'p1', name: 'Old', updatedAt: new Date('2022-01-01'), data: { rooms: [] } },
        { id: 'p2', name: 'New', updatedAt: new Date('2023-01-01'), data: { rooms: [{}, {}] } },
      ];
      // mock getAllFromIndex returns oldest first usually (ascending)
      mockDb.getAllFromIndex.mockResolvedValue(storedProjects);

      const result = await listProjects();

      expect(mockDb.getAllFromIndex).toHaveBeenCalledWith('projects', 'by-updated');
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('p2'); // Newest first
      expect(result[0].roomCount).toBe(2);
      expect(result[1].id).toBe('p1');
      expect(result[1].roomCount).toBe(0);
    });
  });
});
