import { importFromJSON } from '../../../../src/services/import/jsonImport';
import * as FileReader from '../../../../src/services/import/fileReader';
import { v4 as uuidv4 } from 'uuid';

// Mock dependencies
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'new-uuid')
}));

// Mock structuredClone if not available in test env
if (!global.structuredClone) {
  global.structuredClone = (val: any) => JSON.parse(JSON.stringify(val));
}

describe('JSON Import', () => {
  const validFloorplan = {
    id: 'fp-1',
    name: 'Test Plan',
    units: 'meters',
    rooms: [
      {
        id: 'room-1',
        name: 'Living',
        type: 'living',
        length: 5, width: 4, height: 2.4,
        position: { x: 0, z: 0 },
        doors: [],
        windows: []
      }
    ],
    connections: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should import valid JSON successfully', async () => {
    const file = new File([JSON.stringify(validFloorplan)], 'test.json', { type: 'application/json' });

    // We need to spy on readFileAsText to ensure it returns our string
    // But since we're using the real implementation which uses FileReader (mocked in setup),
    // we can rely on that or spy on the exported function.
    // However, since we are testing importFromJSON which calls readFileAsText from the same module (if it was defined there)
    // or imported. Here it is imported from index.ts.

    // Since we can't easily spy on the imported function inside the module under test without
    // module mocking, let's trust the real readFileAsText works (it's tested separately)
    // providing our setup.ts mocks FileReader correctly.

    // Actually, our setup.ts doesn't mock FileReader fully logic-wise for reading.
    // We mocked FileReader in the unit test file for index.test.ts? No, we didn't.
    // We relied on the fact that JSDOM or setup might have it?
    // Wait, index.test.ts passed. That means FileReader exists.
    // Let's verify if we need to mock readFileAsText.

    // To be safe and isolate, let's mock readFileAsText
    jest.spyOn(FileReader, 'readFileAsText').mockResolvedValue(JSON.stringify(validFloorplan));

    const result = await importFromJSON(file);

    expect(result.success).toBe(true);
    expect(result.floorplan).toBeDefined();
    expect(result.floorplan?.id).toBe('fp-1');
    expect(result.floorplan?.rooms).toHaveLength(1);
  });

  it('should handle wrapped export format', async () => {
    const wrapped = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      floorplan: validFloorplan
    };

    jest.spyOn(FileReader, 'readFileAsText').mockResolvedValue(JSON.stringify(wrapped));

    const file = new File([''], 'test.json');
    const result = await importFromJSON(file);

    expect(result.success).toBe(true);
    expect(result.floorplan?.id).toBe('fp-1');
  });

  it('should fail on invalid JSON syntax', async () => {
    jest.spyOn(FileReader, 'readFileAsText').mockResolvedValue('{ invalid json');

    const file = new File([''], 'test.json');
    const result = await importFromJSON(file);

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Invalid JSON syntax');
  });

  it('should fail on validation errors', async () => {
    const invalidData = { ...validFloorplan, units: 'invalid' };
    jest.spyOn(FileReader, 'readFileAsText').mockResolvedValue(JSON.stringify(invalidData));

    const file = new File([''], 'test.json');
    const result = await importFromJSON(file);

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Missing or invalid units (must be "meters" or "feet")');
  });

  it('should regenerate IDs when requested', async () => {
    jest.spyOn(FileReader, 'readFileAsText').mockResolvedValue(JSON.stringify(validFloorplan));

    // Mock uuid to return specific sequence if needed, or just check they changed
    (uuidv4 as jest.Mock)
      .mockReturnValueOnce('new-fp-id')
      .mockReturnValueOnce('new-room-id');

    const file = new File([''], 'test.json');
    const result = await importFromJSON(file, { generateNewIds: true });

    expect(result.success).toBe(true);
    expect(result.floorplan?.id).toBe('new-fp-id');
    expect(result.floorplan?.rooms[0].id).toBe('new-room-id');
    expect(result.floorplan?.rooms[0].id).not.toBe('room-1');
  });

  it('should update connection references when regenerating IDs', async () => {
    const dataWithConn = {
      ...validFloorplan,
      rooms: [
        { ...validFloorplan.rooms[0], id: 'r1' },
        { ...validFloorplan.rooms[0], id: 'r2', position: { x: 5, z: 0 } }
      ],
      connections: [
        { id: 'c1', room1Id: 'r1', room2Id: 'r2', sharedWall: 'north', doors: [] }
      ]
    };

    jest.spyOn(FileReader, 'readFileAsText').mockResolvedValue(JSON.stringify(dataWithConn));

    let uuidCounter = 0;
    (uuidv4 as jest.Mock).mockImplementation(() => `new-uuid-${uuidCounter++}`);

    const file = new File([''], 'test.json');
    const result = await importFromJSON(file, { generateNewIds: true });

    const fp = result.floorplan!;
    const newR1Id = fp.rooms[0].id;
    const newR2Id = fp.rooms[1].id;
    const conn = fp.connections[0];

    expect(conn.room1Id).toBe(newR1Id);
    expect(conn.room2Id).toBe(newR2Id);
    expect(conn.room1Id).not.toBe('r1');
    expect(conn.room2Id).not.toBe('r2');
  });
});
