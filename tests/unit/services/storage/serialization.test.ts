import { serializeFloorplan, deserializeFloorplan, SerializedFloorplan, CURRENT_VERSION } from '@/services/storage/serialization';
import { Floorplan } from '@/types/floorplan';

describe('Serialization Service', () => {
  const mockDate = new Date('2023-01-01T12:00:00.000Z');

  const mockFloorplan: Floorplan = {
    id: 'test-id',
    name: 'Test Plan',
    units: 'meters',
    rooms: [
      { id: 'r1', name: 'Living Room', width: 5, length: 4, height: 2.4, type: 'living_room', position: { x: 0, z: 0 } },
    ],
    walls: [],
    doors: [],
    windows: [],
    connections: [],
    createdAt: mockDate,
    updatedAt: mockDate,
    version: '1.0.0',
  };

  describe('serializeFloorplan', () => {
    it('correctly serializes a floorplan', () => {
      const serialized = serializeFloorplan(mockFloorplan);

      expect(serialized.id).toBe(mockFloorplan.id);
      expect(serialized.name).toBe(mockFloorplan.name);
      expect(serialized.createdAt).toBe(mockDate.toISOString());
      expect(serialized.updatedAt).toBe(mockDate.toISOString());
      expect(serialized.version).toBe(mockFloorplan.version);
      expect(serialized.rooms).toHaveLength(1);
    });

    it('handles missing version by adding current version', () => {
        const noVersion = { ...mockFloorplan, version: undefined } as unknown as Floorplan;
        const serialized = serializeFloorplan(noVersion);
        expect(serialized.version).toBe(CURRENT_VERSION);
    });

    it('throws error for null/undefined input', () => {
        expect(() => serializeFloorplan(null as unknown as Floorplan)).toThrow();
        expect(() => serializeFloorplan(undefined as unknown as Floorplan)).toThrow();
    });

    it('handles Date objects that are already strings (robustness)', () => {
        // Sometimes state might be messy, ensure we handle string dates gracefully if passed in Floorplan type
        const mixed = { ...mockFloorplan, createdAt: mockDate.toISOString() } as unknown as Floorplan;
        const serialized = serializeFloorplan(mixed);
        expect(serialized.createdAt).toBe(mockDate.toISOString());
    });
  });

  describe('deserializeFloorplan', () => {
    const validSerialized: SerializedFloorplan = {
      id: 'test-id',
      name: 'Test Plan',
      units: 'meters',
      rooms: [],
      walls: [],
      doors: [],
      windows: [],
      connections: [],
      createdAt: mockDate.toISOString(),
      updatedAt: mockDate.toISOString(),
      version: '1.0.0',
    };

    it('correctly deserializes a valid serialized floorplan', () => {
      const result = deserializeFloorplan(validSerialized);

      expect(result.id).toBe(validSerialized.id);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.createdAt.toISOString()).toBe(validSerialized.createdAt);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('throws error for invalid date strings', () => {
      const invalidDates = { ...validSerialized, createdAt: 'not-a-date' };
      expect(() => deserializeFloorplan(invalidDates)).toThrow('Invalid createdAt date');
    });

    it('throws error for missing required fields', () => {
        const missingId = { ...validSerialized, id: undefined } as unknown as SerializedFloorplan;
        expect(() => deserializeFloorplan(missingId)).toThrow('missing required fields');
    });

    it('initializes missing arrays as empty', () => {
        const noArrays = {
            id: 'test',
            createdAt: mockDate.toISOString(),
            updatedAt: mockDate.toISOString()
        } as unknown as SerializedFloorplan;

        // It will fail basic validation if I don't provide at least rooms, as per my implementation
        // Let's adjust input to pass basic validation but miss other arrays
        const partial = {
             id: 'test',
             rooms: [],
             createdAt: mockDate.toISOString(),
             updatedAt: mockDate.toISOString()
         } as unknown as SerializedFloorplan;

        const result = deserializeFloorplan(partial);
        expect(result.walls).toEqual([]);
        expect(result.doors).toEqual([]);
        expect(result.windows).toEqual([]);
    });
  });
});
