import { exportToJSON } from '../../src/services/export/jsonExport';
import { Floorplan } from '../../src/types/floorplan';
import { CURRENT_VERSION } from '../../src/services/storage/serialization';

// Helper to read blob text in JSDOM
function readBlobText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(blob);
  });
}

describe('Export Integration', () => {
  const mockDate = new Date('2024-01-01T12:00:00.000Z');

  // A realistic floorplan object
  const fullFloorplan: Floorplan = {
    id: 'project-123',
    name: 'Integration Test Project',
    units: 'meters',
    version: CURRENT_VERSION,
    createdAt: mockDate,
    updatedAt: mockDate,
    rooms: [
      {
        id: 'room-1',
        name: 'Living Room',
        type: 'living',
        x: 0,
        z: 0,
        width: 5,
        length: 4,
        rotation: 0,
        height: 2.7,
        isLocked: false
      }
    ],
    walls: [], // Walls are usually derived or simple objects
    doors: [],
    windows: [],
    connections: []
  };

  it('should generate a valid JSON export file that can be parsed back', async () => {
    // 1. Export
    const blob = await exportToJSON(fullFloorplan);
    expect(blob.size).toBeGreaterThan(0);
    expect(blob.type).toBe('application/json');

    // 2. Read "File" (Blob)
    const content = await readBlobText(blob);

    // 3. Parse
    const parsed = JSON.parse(content);

    // 4. Verify Structure
    expect(parsed).toHaveProperty('exportedAt');
    expect(parsed).toHaveProperty('schemaVersion', CURRENT_VERSION);
    expect(parsed.floorplan).toBeDefined();

    // 5. Verify Content Integrity
    expect(parsed.floorplan.id).toBe(fullFloorplan.id);
    expect(parsed.floorplan.rooms).toHaveLength(1);
    expect(parsed.floorplan.rooms[0].id).toBe('room-1');
    expect(parsed.floorplan.rooms[0].name).toBe('Living Room');
  });

  it('should handle large floorplans without crashing', async () => {
    const largeFloorplan = JSON.parse(JSON.stringify(fullFloorplan));
    // Add 100 rooms
    for (let i = 0; i < 100; i++) {
        largeFloorplan.rooms.push({
            ...fullFloorplan.rooms[0],
            id: `room-extra-${i}`,
            name: `Extra Room ${i}`
        });
    }

    const blob = await exportToJSON(largeFloorplan);
    expect(blob.size).toBeGreaterThan(10000); // Should be reasonably large

    const content = await readBlobText(blob);
    const parsed = JSON.parse(content);
    expect(parsed.floorplan.rooms).toHaveLength(101);
  });
});
