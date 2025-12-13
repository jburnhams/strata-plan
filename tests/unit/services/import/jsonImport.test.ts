import { importFromJSON } from '../../../../src/services/import/jsonImport';
import * as FileReaderService from '../../../../src/services/import/fileReader';
import { migrateData } from '../../../../src/services/storage/migrations';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../../../../src/services/import/fileReader');
jest.mock('../../../../src/services/storage/migrations');
jest.mock('uuid');

describe('jsonImport', () => {
  const mockFile = new File(['{}'], 'test.json', { type: 'application/json' });

  beforeAll(() => {
    global.structuredClone = (val) => JSON.parse(JSON.stringify(val));
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (uuidv4 as jest.Mock).mockReturnValue('new-uuid');
    (migrateData as jest.Mock).mockImplementation((data) => data);
  });

  it('should return error for invalid JSON', async () => {
    (FileReaderService.readFileAsText as jest.Mock).mockResolvedValue('invalid json');

    const result = await importFromJSON(mockFile);

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Invalid JSON syntax');
  });

  it('should validate imported structure', async () => {
    (FileReaderService.readFileAsText as jest.Mock).mockResolvedValue(JSON.stringify({}));

    const result = await importFromJSON(mockFile);

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Missing or invalid floorplan ID');
  });

  it('should handle wrapped format', async () => {
      const wrappedData = {
          floorplan: {
              id: 'p1',
              name: 'Test',
              units: 'meters',
              rooms: [],
              createdAt: '2023-01-01T00:00:00.000Z',
              updatedAt: '2023-01-01T00:00:00.000Z'
          },
          metadata: {}
      };
      (FileReaderService.readFileAsText as jest.Mock).mockResolvedValue(JSON.stringify(wrappedData));

      const result = await importFromJSON(mockFile);

      expect(result.success).toBe(true);
      expect(result.floorplan?.id).toBe('p1');
  });

  it('should regenerate IDs when requested', async () => {
      const data = {
          id: 'old-id',
          name: 'Test',
          units: 'meters',
          rooms: [
              { id: 'room-1', name: 'Room 1', type: 'bedroom', length: 4, width: 4, height: 2.7, position: {x:0,z:0} }
          ],
          doors: [
              { id: 'door-1', roomId: 'room-1', width: 0.9, height: 2.1, position: 0.5, type: 'single', swing: 'inward', handleSide: 'left', isExterior: false, wallSide: 'north' }
          ],
          windows: [],
          connections: [],
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z'
      };
      (FileReaderService.readFileAsText as jest.Mock).mockResolvedValue(JSON.stringify(data));

      const result = await importFromJSON(mockFile, { generateNewIds: true });

      if (!result.success) {
        console.log('Validation errors:', result.errors);
      }
      expect(result.success).toBe(true);
      expect(result.floorplan?.id).toBe('new-uuid');
      expect(result.floorplan?.rooms[0].id).toBe('new-uuid');
      expect(result.floorplan?.doors[0].id).toBe('new-uuid');
      // Ensure door's roomId reference is updated
      expect(result.floorplan?.doors[0].roomId).toBe(result.floorplan?.rooms[0].id);
  });

  it('should call migrateData during import', async () => {
      const data = { floorplan: { id: 'fp1' } };
      (FileReaderService.readFileAsText as jest.Mock).mockResolvedValue(JSON.stringify(data));
      (migrateData as jest.Mock).mockReturnValue({
          id: 'fp1',
          name: 'Migrated',
          units: 'meters',
          rooms: [],
          doors: [],
          windows: [],
          connections: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
      });

      await importFromJSON(mockFile);

      expect(migrateData).toHaveBeenCalled();
  });
});
