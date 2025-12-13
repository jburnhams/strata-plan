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

  it('should validate doors', () => {
      const data = {
          id: 'fp-1',
          units: 'meters',
          rooms: [{ id: 'room-1', length: 5, width: 4, height: 2.4, type: 'living', position: {x:0,z:0} }],
          doors: [
              {
                  id: 'door-1',
                  roomId: 'room-1',
                  wallSide: 'north',
                  position: 0.5,
                  width: 0.9,
                  height: 2.1,
                  type: 'single',
                  swing: 'inward',
                  handleSide: 'left',
                  isExterior: false
              },
              {
                  id: 'door-2',
                  roomId: 'room-99', // Invalid
                  wallSide: 'north',
                  position: 0.5,
                  width: 0.9,
                  height: 2.1
              }
          ],
          windows: []
      };

      const result = validateImportedFloorplan(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Door door-2: Reference to non-existent roomId room-99');
  });

  it('should validate windows', () => {
      const data = {
          id: 'fp-1',
          units: 'meters',
          rooms: [{ id: 'room-1', length: 5, width: 4, height: 2.4, type: 'living', position: {x:0,z:0} }],
          doors: [],
          windows: [
              {
                  id: 'win-1',
                  roomId: 'room-1',
                  wallSide: 'north',
                  position: 0.5,
                  width: 1.0,
                  height: 1.0,
                  sillHeight: 0.9,
                  frameType: 'single',
                  material: 'pvc',
                  openingType: 'fixed'
              },
              {
                  id: 'win-2',
                  roomId: 'room-1',
                  wallSide: 'north',
                  position: 0.5,
                  width: -1, // Invalid
                  height: 1.0,
                  sillHeight: 0.9
              }
          ]
      };

      const result = validateImportedFloorplan(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Window win-2: Window width must be between 0.3m and 3.0m');
  });
});
