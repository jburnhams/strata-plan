import { validateImportedFloorplan } from '../../../../src/services/import/validation';

describe('Import Validation', () => {
  it('should validate a correct floorplan', () => {
    const validData = {
      id: 'fp-1',
      name: 'Test Plan',
      units: 'meters',
      rooms: [
        {
          id: 'room-1',
          name: 'Living Room',
          type: 'living',
          length: 5,
          width: 4,
          height: 2.4,
          position: { x: 0, z: 0 },
          doors: [],
          windows: []
        }
      ],
      connections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = validateImportedFloorplan(validData);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail if required fields are missing', () => {
    const invalidData = {
      // missing id
      name: 'Test Plan',
      // missing units
      rooms: []
    };

    const result = validateImportedFloorplan(invalidData);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing or invalid floorplan ID');
    expect(result.errors).toContain('Missing or invalid units (must be "meters" or "feet")');
  });

  it('should validate room structure', () => {
    const dataWithBadRoom = {
      id: 'fp-1',
      units: 'meters',
      rooms: [
        {
          id: 'room-1',
          // missing dimensions
          position: { x: 0, z: 0 }
        }
      ]
    };

    const result = validateImportedFloorplan(dataWithBadRoom);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Room room-1: Invalid length');
  });

  it('should detect duplicate room IDs', () => {
    const dataWithDupes = {
      id: 'fp-1',
      units: 'meters',
      rooms: [
        {
          id: 'room-1',
          length: 4, width: 4, height: 2.4,
          type: 'generic',
          position: { x: 0, z: 0 }
        },
        {
          id: 'room-1', // Duplicate
          length: 3, width: 3, height: 2.4,
          type: 'generic',
          position: { x: 5, z: 0 }
        }
      ]
    };

    const result = validateImportedFloorplan(dataWithDupes);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Duplicate room ID: room-1');
  });

  it('should warn on invalid room type', () => {
    const dataWithBadType = {
      id: 'fp-1',
      units: 'meters',
      rooms: [
        {
          id: 'room-1',
          length: 4, width: 4, height: 2.4,
          type: 'invalid-type', // Invalid
          position: { x: 0, z: 0 }
        }
      ]
    };

    const result = validateImportedFloorplan(dataWithBadType);
    expect(result.valid).toBe(true); // Still valid, just a warning
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('Unknown room type');
  });

  it('should validate connection references', () => {
    const dataWithBadConn = {
      id: 'fp-1',
      units: 'meters',
      rooms: [
        {
          id: 'room-1',
          length: 4, width: 4, height: 2.4,
          type: 'generic',
          position: { x: 0, z: 0 }
        }
      ],
      connections: [
        {
          id: 'conn-1',
          room1Id: 'room-1',
          room2Id: 'room-99' // Non-existent
        }
      ]
    };

    const result = validateImportedFloorplan(dataWithBadConn);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Connection at index 0: Reference to non-existent room2Id room-99');
  });
});
