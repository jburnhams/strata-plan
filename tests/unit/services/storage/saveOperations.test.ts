import { saveNow, saveAs, revertToSaved } from '@/services/storage/saveOperations';
import { saveProject, loadProject } from '@/services/storage/projectStorage';
import { Floorplan } from '@/types/floorplan';

// Mock dependencies
jest.mock('@/services/storage/projectStorage', () => ({
  saveProject: jest.fn(),
  loadProject: jest.fn(),
}));

describe('Save Operations', () => {
  const mockFloorplan = {
    id: 'p1',
    name: 'Original',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  } as Floorplan;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveNow', () => {
    it('calls saveProject immediately', async () => {
      await saveNow(mockFloorplan);
      expect(saveProject).toHaveBeenCalledWith(mockFloorplan);
    });
  });

  describe('saveAs', () => {
    it('creates a new project with new ID and name', async () => {
      const newName = 'Copy';
      const newId = await saveAs(mockFloorplan, newName);

      expect(newId).not.toBe(mockFloorplan.id);
      expect(saveProject).toHaveBeenCalledWith(expect.objectContaining({
        id: newId,
        name: newName,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }));
    });
  });

  describe('revertToSaved', () => {
    it('loads the project from storage', async () => {
      (loadProject as jest.Mock).mockResolvedValue(mockFloorplan);

      const result = await revertToSaved('p1');

      expect(loadProject).toHaveBeenCalledWith('p1');
      expect(result).toBe(mockFloorplan);
    });

    it('throws if no saved version exists', async () => {
      (loadProject as jest.Mock).mockResolvedValue(null);

      await expect(revertToSaved('p1')).rejects.toThrow('No saved version found');
    });
  });
});
