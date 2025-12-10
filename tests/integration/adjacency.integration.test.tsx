import { buildGraph, calculateAllConnections } from '../../src/services/adjacency/graph';
import { Room } from '../../src/types/room';

// Helper to create basic rooms
const createRoom = (id: string, x: number, z: number, length = 4, width = 4): Room => ({
  id,
  name: `Room ${id}`,
  length,
  width,
  height: 2.4,
  type: 'bedroom',
  position: { x, z },
  rotation: 0,
  doors: [],
  windows: [],
});

describe('Adjacency System Integration', () => {
  describe('Auto-detection and Graph Building', () => {
    it('should automatically detect adjacent rooms and build connections', () => {
      // Create two rooms touching at (4,0)
      const room1 = createRoom('1', 0, 0); // 0-4
      const room2 = createRoom('2', 4, 0); // 4-8

      const connections = calculateAllConnections([room1, room2]);

      expect(connections).toHaveLength(1);
      const conn = connections[0];
      expect(conn.room1Id).toBe('1');
      expect(conn.room2Id).toBe('2');
      expect(conn.sharedWallLength).toBeCloseTo(4);
    });

    it('should remove connections when rooms are moved apart', () => {
      // Step 1: Rooms are adjacent
      const room1 = createRoom('1', 0, 0);
      const room2 = createRoom('2', 4, 0);

      let connections = calculateAllConnections([room1, room2]);
      expect(connections).toHaveLength(1);

      // Step 2: Move room2 away
      room2.position.x = 4.2; // > 0.1 gap (assuming tolerance is small)

      connections = calculateAllConnections([room1, room2]);
      expect(connections).toHaveLength(0);
    });

    it('should handle complex multi-room layouts', () => {
      // Layout:
      // [R1][R2]
      // [R3]
      // R1 touches R2 (East) and R3 (South)
      // R2 touches R1 (West)
      // R3 touches R1 (North)

      const room1 = createRoom('1', 0, 0); // 0,0 to 4,4
      const room2 = createRoom('2', 4, 0); // 4,0 to 8,4
      const room3 = createRoom('3', 0, 4); // 0,4 to 4,8

      const connections = calculateAllConnections([room1, room2, room3]);

      // Expect 2 connections: R1-R2, R1-R3. R2 and R3 touch only at corner (0 length shared) so no connection
      expect(connections).toHaveLength(2);

      const graph = buildGraph([room1, room2, room3]);
      expect(graph.getAdjacentRoomIds('1')).toEqual(expect.arrayContaining(['2', '3']));
      expect(graph.getAdjacentRoomIds('2')).toEqual(['1']);
      expect(graph.getAdjacentRoomIds('3')).toEqual(['1']);
    });

    it('should correctly handle rotated rooms adjacency', () => {
      // R1: 0,0 4x4
      const room1 = createRoom('1', 0, 0);

      // R2: 4,0 4x4 rotated 90deg
      // 90deg: width is along X, length along Z
      // Effectively 4x4 box at 4,0
      const room2 = createRoom('2', 4, 0);
      room2.rotation = 90;

      const connections = calculateAllConnections([room1, room2]);
      expect(connections).toHaveLength(1);

      // Verify wall sides
      // R1 East wall touches R2's...
      // R2 is rotated 90 (CCW). North becomes West in world space?
      // Let's rely on detection logic which is tested in unit tests.
      // Here we just ensure connection exists.
      expect(connections[0].room1Id).toBe('1');
      expect(connections[0].room2Id).toBe('2');
    });
  });
});
