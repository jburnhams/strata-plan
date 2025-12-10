import { findPath, calculatePathDistance } from '../../../../src/services/adjacency/pathfinding';
import { Room } from '../../../../src/types/room';
import { RoomConnection } from '../../../../src/types/floorplan';
import { v4 as uuidv4 } from 'uuid';

// Helper to create basic rooms
const createRoom = (id: string, x: number, z: number): Room => ({
  id,
  name: `Room ${id}`,
  length: 4,
  width: 4,
  height: 2.4,
  type: 'bedroom',
  position: { x, z },
  rotation: 0,
  doors: [],
  windows: [],
});

const createConnection = (room1Id: string, room2Id: string): RoomConnection => ({
  id: uuidv4(),
  room1Id,
  room2Id,
  room1Wall: 'east',
  room2Wall: 'west',
  sharedWallLength: 4,
  doors: [],
});

describe('Pathfinding Service', () => {
  describe('findPath', () => {
    // A -- B -- C
    // |
    // D
    const connections: RoomConnection[] = [
      createConnection('A', 'B'),
      createConnection('B', 'C'),
      createConnection('A', 'D'),
    ];

    it('should find direct path between adjacent rooms', () => {
      const path = findPath('A', 'B', connections);
      expect(path).toEqual(['A', 'B']);
    });

    it('should find path between indirectly connected rooms', () => {
      const path = findPath('A', 'C', connections);
      expect(path).toEqual(['A', 'B', 'C']);
    });

    it('should find shortest path when multiple exist', () => {
      // A -- B -- C
      // |         |
      // D -- E -- F -- C (longer path via D-E-F)
      // Actually let's just make a cycle
      // A -- B -- C
      // |         |
      // + -- D -- +
      // Path via B is length 2. Path via D is length 2.
      // Let's make via D longer.
      // A -- B -- C
      // A -- D -- E -- C

      const complexConnections: RoomConnection[] = [
        createConnection('A', 'B'),
        createConnection('B', 'C'),
        createConnection('A', 'D'),
        createConnection('D', 'E'),
        createConnection('E', 'C'),
      ];

      const path = findPath('A', 'C', complexConnections);
      expect(path).toEqual(['A', 'B', 'C']); // Length 3 vs 4
    });

    it('should return single room for start=end', () => {
      const path = findPath('A', 'A', connections);
      expect(path).toEqual(['A']);
    });

    it('should return empty array if no path exists', () => {
      const path = findPath('A', 'Z', connections); // Z doesn't exist
      expect(path).toEqual([]);
    });

    it('should return empty array for disconnected subgraphs', () => {
      // A -- B    X -- Y
      const disconnectedConnections: RoomConnection[] = [
        createConnection('A', 'B'),
        createConnection('X', 'Y'),
      ];
      const path = findPath('A', 'X', disconnectedConnections);
      expect(path).toEqual([]);
    });
  });

  describe('calculatePathDistance', () => {
    it('should calculate distance correctly for a path', () => {
      // R1 (0,0) -- R2 (4,0) -- R3 (8,0)
      const rooms: Room[] = [
        createRoom('R1', 0, 0),
        createRoom('R2', 4, 0),
        createRoom('R3', 8, 0),
      ];
      // Center of R1 is 2,2. Center of R2 is 6,2. Distance = 4.
      // Center of R2 is 6,2. Center of R3 is 10,2. Distance = 4.
      // Total = 8.

      const path = ['R1', 'R2', 'R3'];
      const distance = calculatePathDistance(path, rooms);
      expect(distance).toBeCloseTo(8);
    });

    it('should return 0 for single room path', () => {
      const rooms = [createRoom('A', 0, 0)];
      expect(calculatePathDistance(['A'], rooms)).toBe(0);
    });

    it('should return 0 for empty path', () => {
      expect(calculatePathDistance([], [])).toBe(0);
    });

    it('should throw error if room in path is missing', () => {
      const rooms = [createRoom('A', 0, 0)];
      expect(() => calculatePathDistance(['A', 'B'], rooms)).toThrow();
    });
  });
});
