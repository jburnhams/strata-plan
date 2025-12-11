import { validateConnections } from '../../../../src/services/adjacency/validation';
import { Room, RoomConnection } from '../../../../src/types';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

// Mock geometry
jest.mock('../../../../src/services/geometry/room', () => ({
  ...jest.requireActual('../../../../src/services/geometry/room'),
  getRoomBounds: (room: Room) => {
    // Simple AABB logic for tests assuming 0 rotation
    // If rotation logic is needed, we should use the actual implementation or mock it accordingly
    // The actual getRoomBounds is clean logic, we can probably use it if we import it,
    // but here we are mocking the module.
    // Let's use a simplified version:
    const width = room.rotation % 180 === 0 ? room.width : room.length;
    const length = room.rotation % 180 === 0 ? room.length : room.width;
    return {
        minX: room.position.x,
        maxX: room.position.x + length,
        minZ: room.position.z,
        maxZ: room.position.z + width,
    };
  }
}));

describe('Connection Validation', () => {
  const createRoom = (id: string, x: number, z: number): Room => ({
    id,
    name: `Room ${id}`,
    length: 5,
    width: 4,
    height: 3,
    position: { x, z },
    rotation: 0,
    type: 'bedroom',
    doors: [],
    windows: [],
    walls: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  describe('validateConnections', () => {
    it('detects orphan rooms (no connections)', () => {
      const rooms = [
        createRoom('r1', 0, 0),
        createRoom('r2', 10, 0), // Far away
      ];
      const connections: RoomConnection[] = []; // No connections

      const result = validateConnections(rooms, connections);

      expect(result.orphanRooms).toContain('r1');
      expect(result.orphanRooms).toContain('r2');
      expect(result.orphanRooms.length).toBe(2);
    });

    it('identifies connected rooms as non-orphan', () => {
      const rooms = [
        createRoom('r1', 0, 0),
        createRoom('r2', 5, 0), // Adjacent
      ];
      const connections: RoomConnection[] = [{
        id: 'c1',
        room1Id: 'r1',
        room2Id: 'r2',
        room1Wall: 'east',
        room2Wall: 'west',
        sharedWallLength: 4,
        doors: [],
      }];

      const result = validateConnections(rooms, connections);

      expect(result.orphanRooms).toHaveLength(0);
    });

    it('detects unreachable rooms (isolated clusters)', () => {
      // Cluster 1: r1-r2
      // Cluster 2: r3-r4 (Unreachable from r1-r2)
      // r3-r4 is smaller cluster, so it should be "unreachable" if r1-r2 is "main"
      // Wait, validation logic sorts by size. If sizes equal? order matters or arbitrary.

      const rooms = [
        createRoom('r1', 0, 0),
        createRoom('r2', 5, 0),
        createRoom('r3', 20, 0),
        createRoom('r4', 25, 0),
        createRoom('r5', 30, 0), // r3-r4-r5 is larger cluster
      ];

      const connections: RoomConnection[] = [
        { id: 'c1', room1Id: 'r1', room2Id: 'r2', doors: [] } as any,
        { id: 'c2', room1Id: 'r3', room2Id: 'r4', doors: [] } as any,
        { id: 'c3', room1Id: 'r4', room2Id: 'r5', doors: [] } as any,
      ];

      const result = validateConnections(rooms, connections);

      // r3, r4, r5 form a cluster of 3.
      // r1, r2 form a cluster of 2.
      // Larger cluster is main. Smaller is unreachable.

      expect(result.unreachableRooms).toContain('r1');
      expect(result.unreachableRooms).toContain('r2');
      expect(result.unreachableRooms).not.toContain('r3');
    });

    it('detects overlapping rooms', () => {
      const rooms = [
        createRoom('r1', 0, 0), // 0 to 5 (x), 0 to 4 (z)
        createRoom('r2', 2, 2), // 2 to 7 (x), 2 to 6 (z) -> Overlaps
      ];

      const result = validateConnections(rooms, []);

      expect(result.overlappingRooms).toHaveLength(1);
      expect(result.overlappingRooms[0]).toContain('r1');
      expect(result.overlappingRooms[0]).toContain('r2');
    });

    it('ignores touching rooms (no overlap)', () => {
      const rooms = [
        createRoom('r1', 0, 0), // 0 to 5
        createRoom('r2', 5, 0), // 5 to 10 -> Touches at x=5
      ];

      const result = validateConnections(rooms, []);

      expect(result.overlappingRooms).toHaveLength(0);
    });

    it('detects multiple overlap pairs', () => {
      const rooms = [
        createRoom('r1', 0, 0),
        createRoom('r2', 1, 1), // Overlaps r1
        createRoom('r3', 0.5, 0.5), // Overlaps r1 and r2
      ];

      const result = validateConnections(rooms, []);

      // Pairs: r1-r2, r1-r3, r2-r3
      expect(result.overlappingRooms.length).toBe(3);
    });
  });
});
