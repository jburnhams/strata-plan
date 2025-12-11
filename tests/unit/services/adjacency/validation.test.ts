import { Room, RoomConnection, Door } from '../../../../src/types';
import { AdjacencyGraph } from '../../../../src/services/adjacency/graph';
import {
  getOrphanRooms,
  getUnreachableRooms,
  getOverlappingRooms,
  getInvalidDoors
} from '../../../../src/services/adjacency/validation';

describe('Adjacency Validation', () => {
  let graph: AdjacencyGraph;

  // Helper to create a basic room
  const createRoom = (id: string, x: number, z: number, length: number, width: number): Room => ({
    id,
    name: `Room ${id}`,
    length,
    width,
    height: 2.4,
    type: 'bedroom',
    position: { x, z },
    rotation: 0,
    doors: [],
    windows: []
  });

  // Mock AdjacencyGraph
  class MockAdjacencyGraph extends AdjacencyGraph {
    constructor() {
      super();
      // @ts-ignore - accessing private property for test setup or just using public methods
    }
  }

  beforeEach(() => {
    graph = new AdjacencyGraph();
  });

  describe('getOrphanRooms', () => {
    it('should identify rooms with no connections', () => {
      const room1 = createRoom('1', 0, 0, 5, 5);
      const room2 = createRoom('2', 10, 0, 5, 5); // Far away
      const rooms = [room1, room2];

      // No connections added to graph

      const orphans = getOrphanRooms(rooms, graph);
      expect(orphans).toContain('1');
      expect(orphans).toContain('2');
      expect(orphans.length).toBe(2);
    });

    it('should not identify connected rooms as orphans', () => {
      const room1 = createRoom('1', 0, 0, 5, 5);
      const room2 = createRoom('2', 5, 0, 5, 5); // Adjacent
      const rooms = [room1, room2];

      const connection: RoomConnection = {
        id: 'c1',
        room1Id: '1',
        room2Id: '2',
        room1Wall: 'east',
        room2Wall: 'west',
        sharedWallLength: 5,
        doors: []
      };

      graph.addConnection(connection);

      const orphans = getOrphanRooms(rooms, graph);
      expect(orphans).toEqual([]);
    });

    it('should identify mixed connected and orphan rooms', () => {
      const room1 = createRoom('1', 0, 0, 5, 5);
      const room2 = createRoom('2', 5, 0, 5, 5);
      const room3 = createRoom('3', 20, 0, 5, 5); // Orphan
      const rooms = [room1, room2, room3];

      const connection: RoomConnection = {
        id: 'c1',
        room1Id: '1',
        room2Id: '2',
        room1Wall: 'east',
        room2Wall: 'west',
        sharedWallLength: 5,
        doors: []
      };

      graph.addConnection(connection);

      const orphans = getOrphanRooms(rooms, graph);
      expect(orphans).toEqual(['3']);
    });
  });

  describe('getUnreachableRooms', () => {
    it('should return empty list for single connected group', () => {
      const room1 = createRoom('1', 0, 0, 5, 5);
      const room2 = createRoom('2', 5, 0, 5, 5);
      const room3 = createRoom('3', 10, 0, 5, 5);

      // 1-2-3 chain
      graph.addConnection({ id: 'c1', room1Id: '1', room2Id: '2', room1Wall: 'east', room2Wall: 'west', sharedWallLength: 5, doors: [] });
      graph.addConnection({ id: 'c2', room1Id: '2', room2Id: '3', room1Wall: 'east', room2Wall: 'west', sharedWallLength: 5, doors: [] });

      const unreachable = getUnreachableRooms([room1, room2, room3], graph);
      expect(unreachable).toEqual([]);
    });

    it('should identify smaller group as unreachable', () => {
      // Group A: 1-2 (size 2)
      // Group B: 3-4-5 (size 3) -> Main group
      const room1 = createRoom('1', 0, 0, 5, 5);
      const room2 = createRoom('2', 5, 0, 5, 5);

      const room3 = createRoom('3', 20, 0, 5, 5);
      const room4 = createRoom('4', 25, 0, 5, 5);
      const room5 = createRoom('5', 30, 0, 5, 5);

      graph.addConnection({ id: 'c1', room1Id: '1', room2Id: '2', room1Wall: 'east', room2Wall: 'west', sharedWallLength: 5, doors: [] });

      graph.addConnection({ id: 'c2', room1Id: '3', room2Id: '4', room1Wall: 'east', room2Wall: 'west', sharedWallLength: 5, doors: [] });
      graph.addConnection({ id: 'c3', room1Id: '4', room2Id: '5', room1Wall: 'east', room2Wall: 'west', sharedWallLength: 5, doors: [] });

      const rooms = [room1, room2, room3, room4, room5];
      const unreachable = getUnreachableRooms(rooms, graph);

      // 1 and 2 are in the smaller group
      expect(unreachable).toContain('1');
      expect(unreachable).toContain('2');
      expect(unreachable).not.toContain('3');
      expect(unreachable).not.toContain('4');
      expect(unreachable).not.toContain('5');
    });

    it('should handle completely disconnected rooms', () => {
      // 1-2 (Main)
      // 3 (Isolated)
      const room1 = createRoom('1', 0, 0, 5, 5);
      const room2 = createRoom('2', 5, 0, 5, 5);
      const room3 = createRoom('3', 20, 0, 5, 5);

      graph.addConnection({ id: 'c1', room1Id: '1', room2Id: '2', room1Wall: 'east', room2Wall: 'west', sharedWallLength: 5, doors: [] });

      const unreachable = getUnreachableRooms([room1, room2, room3], graph);
      expect(unreachable).toEqual(['3']);
    });
  });

  describe('getOverlappingRooms', () => {
    it('should detect simple overlap', () => {
      const room1 = createRoom('1', 0, 0, 5, 5);
      const room2 = createRoom('2', 2, 2, 5, 5); // Overlaps

      const overlaps = getOverlappingRooms([room1, room2]);
      expect(overlaps).toHaveLength(1);
      expect(overlaps[0]).toContain('1');
      expect(overlaps[0]).toContain('2');
    });

    it('should not flag touching rooms as overlapping', () => {
      const room1 = createRoom('1', 0, 0, 5, 5);
      const room2 = createRoom('2', 5, 0, 5, 5); // Touching at x=5

      const overlaps = getOverlappingRooms([room1, room2]);
      expect(overlaps).toHaveLength(0);
    });

    it('should handle rotated rooms', () => {
      // Room 1: 5x2 at 0,0 (extends x:0-5, z:0-2)
      const room1 = createRoom('1', 0, 0, 5, 2);

      // Room 2: 5x2 rotated 90 at 2,0 (extends x:2-4, z:0-5)
      // Overlap region: x:2-4, z:0-2
      const room2 = createRoom('2', 2, 0, 5, 2);
      room2.rotation = 90;

      const overlaps = getOverlappingRooms([room1, room2]);
      expect(overlaps).toHaveLength(1);
    });

    it('should not flag separated rooms', () => {
      const room1 = createRoom('1', 0, 0, 5, 5);
      const room2 = createRoom('2', 6, 0, 5, 5);

      const overlaps = getOverlappingRooms([room1, room2]);
      expect(overlaps).toHaveLength(0);
    });
  });

  describe('getInvalidDoors', () => {
    it('should flag doors wider than shared wall', () => {
      const rooms = [createRoom('1', 0, 0, 5, 5), createRoom('2', 5, 0, 5, 5)];
      const connections: RoomConnection[] = [{
        id: 'c1',
        room1Id: '1',
        room2Id: '2',
        room1Wall: 'east',
        room2Wall: 'west',
        sharedWallLength: 0.8, // Small shared wall
        doors: []
      }];

      const door: Door = {
        id: 'd1',
        roomId: '1',
        wallSide: 'east',
        position: 0.5,
        width: 1.0, // Wider than 0.8
        height: 2.1,
        type: 'single',
        swing: 'inward',
        handleSide: 'left',
        connectionId: 'c1'
      };

      const invalid = getInvalidDoors(rooms, connections, [door]);
      expect(invalid).toHaveLength(1);
      expect(invalid[0].doorId).toBe('d1');
    });

    it('should not flag valid doors', () => {
      const rooms = [createRoom('1', 0, 0, 5, 5), createRoom('2', 5, 0, 5, 5)];
      const connections: RoomConnection[] = [{
        id: 'c1',
        room1Id: '1',
        room2Id: '2',
        room1Wall: 'east',
        room2Wall: 'west',
        sharedWallLength: 2.0,
        doors: []
      }];

      const door: Door = {
        id: 'd1',
        roomId: '1',
        wallSide: 'east',
        position: 0.5,
        width: 1.0,
        height: 2.1,
        type: 'single',
        swing: 'inward',
        handleSide: 'left',
        connectionId: 'c1'
      };

      const invalid = getInvalidDoors(rooms, connections, [door]);
      expect(invalid).toHaveLength(0);
    });
  });
});
