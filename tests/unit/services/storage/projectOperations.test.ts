import { duplicateProject, updateProject, deleteProject } from '../../../../src/services/storage/projectOperations';
import * as ProjectStorage from '../../../../src/services/storage/projectStorage';
import { v4 as uuidv4 } from 'uuid';
import { Floorplan } from '../../../../src/types';

// Mock dependencies
jest.mock('../../../../src/services/storage/projectStorage');
jest.mock('uuid');

describe('projectOperations', () => {
  const mockDate = new Date('2023-01-01');
  const mockFloorplan: Floorplan = {
    id: 'p1',
    name: 'Test Project',
    units: 'meters',
    rooms: [],
    walls: [],
    doors: [],
    windows: [],
    connections: [],
    createdAt: mockDate,
    updatedAt: mockDate,
    version: '1.0.0'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (uuidv4 as jest.Mock).mockReturnValue('new-uuid');
    jest.useFakeTimers().setSystemTime(new Date('2023-02-01'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('duplicateProject', () => {
    it('should duplicate an existing project', async () => {
      (ProjectStorage.loadProject as jest.Mock).mockResolvedValue(mockFloorplan);

      const newId = await duplicateProject('p1');

      expect(ProjectStorage.loadProject).toHaveBeenCalledWith('p1');
      expect(newId).toBe('new-uuid');
      expect(ProjectStorage.saveProject).toHaveBeenCalledWith(expect.objectContaining({
        id: 'new-uuid',
        name: 'Test Project (copy)',
        createdAt: new Date('2023-02-01'),
        updatedAt: new Date('2023-02-01'),
        units: 'meters' // Preserved
      }));
    });

    it('should throw error if project not found', async () => {
      (ProjectStorage.loadProject as jest.Mock).mockResolvedValue(null);

      await expect(duplicateProject('non-existent')).rejects.toThrow('Project non-existent not found');
      expect(ProjectStorage.saveProject).not.toHaveBeenCalled();
    });
  });

  describe('updateProject', () => {
    it('should call saveProject', async () => {
      await updateProject(mockFloorplan);
      expect(ProjectStorage.saveProject).toHaveBeenCalledWith(mockFloorplan);
    });
  });

  describe('deleteProject', () => {
    it('should call deleteProject in storage', async () => {
      await deleteProject('p1');
      expect(ProjectStorage.deleteProject).toHaveBeenCalledWith('p1');
    });
  });
});
