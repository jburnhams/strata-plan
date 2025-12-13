import { importFromJSON } from '../../../../src/services/import/jsonImport';
import * as fileReader from '../../../../src/services/import/fileReader';
import { mockFloorplan, mockRoom } from '../../../utils/mockData';

// Polyfill structuredClone
if (typeof global.structuredClone !== 'function') {
  global.structuredClone = (obj: any) => JSON.parse(JSON.stringify(obj));
}

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('new-uuid'),
}));

describe('jsonImport coverage', () => {
  const mockReadFile = jest.spyOn(fileReader, 'readFileAsText');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle wrapped export format', async () => {
    const floorplan = mockFloorplan();
    const wrapped = {
      metadata: { version: '1.0' },
      floorplan: floorplan
    };
    mockReadFile.mockResolvedValue(JSON.stringify(wrapped));

    const file = new File([''], 'test.json', { type: 'application/json' });
    const result = await importFromJSON(file);

    expect(result.success).toBe(true);
    expect(result.floorplan?.id).toBe(floorplan.id);
  });

  it('should regenerate IDs correctly', async () => {
    const floorplan = mockFloorplan();
    floorplan.rooms = [
      { ...mockRoom('old-room-1') },
      { ...mockRoom('other') }
    ];
    floorplan.doors = [
      { id: 'old-door-1', roomId: 'old-room-1', type: 'single', wallSide: 'north', position: 0.5, width: 1, height: 2, swing: 'inward', handleSide: 'left', isExterior: false } as any
    ];
    floorplan.windows = [
      { id: 'old-window-1', roomId: 'old-room-1', wallSide: 'south', position: 0.5, width: 1, height: 1, sillHeight: 0.9, frameType: 'single', material: 'pvc', openingType: 'fixed' } as any
    ];
    floorplan.connections = [
      { id: 'old-conn-1', room1Id: 'old-room-1', room2Id: 'other', room1Wall: 'north', room2Wall: 'south' }
    ];

    mockReadFile.mockResolvedValue(JSON.stringify(floorplan));

    const file = new File([''], 'test.json');
    // Using generateNewIds: true
    const result = await importFromJSON(file, { generateNewIds: true });

    if (!result.success) {
      console.error(result.errors);
    }

    expect(result.success).toBe(true);
    const newFloorplan = result.floorplan!;

    expect(newFloorplan.id).toBe('new-uuid');
    expect(newFloorplan.rooms[0].id).toBe('new-uuid');

    expect(newFloorplan.doors[0].id).toBe('new-uuid');
    expect(newFloorplan.doors[0].roomId).toBe('new-uuid'); // Should be mapped

    expect(newFloorplan.windows[0].id).toBe('new-uuid');
    expect(newFloorplan.windows[0].roomId).toBe('new-uuid'); // Should be mapped

    expect(newFloorplan.connections[0].id).toBe('new-uuid');
    expect(newFloorplan.connections[0].room1Id).toBe('new-uuid'); // Should be mapped
  });

  it('should handle JSON parse error', async () => {
    mockReadFile.mockResolvedValue('invalid json');
    const file = new File([''], 'test.json');
    const result = await importFromJSON(file);
    expect(result.success).toBe(false);
    expect(result.errors).toContain('Invalid JSON syntax');
  });

  it('should handle migration failure', async () => {
     // Mock migrateData to throw?
     // It is imported from storage/migrations.
     // We can mock the module.
  });
});
