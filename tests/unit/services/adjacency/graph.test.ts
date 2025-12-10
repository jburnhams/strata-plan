import { AdjacencyGraph, buildGraph, calculateAllConnections } from '../../../../src/services/adjacency/graph';
import { detectAdjacency } from '../../../../src/services/adjacency/detection';
import { Room } from '../../../../src/types/room';
import { RoomConnection } from '../../../../src/types/floorplan';
import { v4 as uuidv4 } from 'uuid';

// Mock dependencies
jest.mock('../../../../src/services/adjacency/detection');
jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

// Mock detectAdjacency to return consistent results based on input
// We'll control its behavior in tests
const mockDetectAdjacency = detectAdjacency as jest.Mock;
const mockUuid = uuidv4 as jest.Mock;

describe('AdjacencyGraph', () => {
  let graph: AdjacencyGraph;

  const mockConnection1: RoomConnection = {
    id: 'conn-1',
    room1Id: 'room-1',
    room2Id: 'room-2',
    room1Wall: 'east',
    room2Wall: 'west',
    sharedWallLength: 3.0,
    doors: [],
  };

  const mockConnection2: RoomConnection = {
    id: 'conn-2',
    room1Id: 'room-2',
    room2Id: 'room-3',
    room1Wall: 'north',
    room2Wall: 'south',
    sharedWallLength: 2.5,
    doors: [],
  };

  beforeEach(() => {
    graph = new AdjacencyGraph();
    mockDetectAdjacency.mockReset();
    mockUuid.mockReset();
  });

  describe('Basic Graph Operations', () => {
    it('should add connections correctly', () => {
      graph.addConnection(mockConnection1);

      expect(graph.getConnectionsForRoom('room-1')).toContain(mockConnection1);
      expect(graph.getConnectionsForRoom('room-2')).toContain(mockConnection1);
      expect(graph.getConnectionsForRoom('room-3')).toEqual([]);
    });

    it('should retrieve a specific connection', () => {
      graph.addConnection(mockConnection1);
      graph.addConnection(mockConnection2);

      expect(graph.getConnection('room-1', 'room-2')).toBe(mockConnection1);
      expect(graph.getConnection('room-2', 'room-1')).toBe(mockConnection1);
      expect(graph.getConnection('room-2', 'room-3')).toBe(mockConnection2);
      expect(graph.getConnection('room-1', 'room-3')).toBeNull();
    });

    it('should return all unique connections', () => {
      graph.addConnection(mockConnection1);
      graph.addConnection(mockConnection2);

      const all = graph.getAllConnections();
      expect(all).toHaveLength(2);
      expect(all).toContain(mockConnection1);
      expect(all).toContain(mockConnection2);
    });

    it('should return adjacent room IDs', () => {
      graph.addConnection(mockConnection1);
      graph.addConnection(mockConnection2);

      expect(graph.getAdjacentRoomIds('room-2')).toEqual(expect.arrayContaining(['room-1', 'room-3']));
      expect(graph.getAdjacentRoomIds('room-1')).toEqual(['room-2']);
    });

    it('should remove connections', () => {
      graph.addConnection(mockConnection1);
      graph.addConnection(mockConnection2);

      graph.removeConnection('conn-1');

      expect(graph.getConnection('room-1', 'room-2')).toBeNull();
      expect(graph.getConnection('room-2', 'room-3')).toBe(mockConnection2);
      expect(graph.getAllConnections()).toHaveLength(1);
    });

    it('should clear all connections', () => {
      graph.addConnection(mockConnection1);
      graph.addConnection(mockConnection2);

      graph.clear();

      expect(graph.getAllConnections()).toHaveLength(0);
      expect(graph.getConnectionsForRoom('room-2')).toEqual([]);
    });
  });

  describe('buildGraph', () => {
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

    it('should build graph from room list using adjacency detection', () => {
      const room1 = createRoom('1', 0, 0);
      const room2 = createRoom('2', 4, 0); // Adjacent to east
      const room3 = createRoom('3', 8, 0); // Far away

      // Setup mocks
      mockUuid.mockReturnValue('new-conn-id');
      mockDetectAdjacency.mockImplementation((r1, r2) => {
        if ((r1.id === '1' && r2.id === '2') || (r1.id === '2' && r2.id === '1')) {
          return {
            room1Id: r1.id,
            room2Id: r2.id,
            sharedWall: {
              room1Wall: 'east',
              room2Wall: 'west',
              length: 4,
              startPosition: 0,
              endPosition: 1,
            },
          };
        }
        return null;
      });

      const resultGraph = buildGraph([room1, room2, room3]);

      expect(resultGraph.getAllConnections()).toHaveLength(1);
      const conn = resultGraph.getConnection('1', '2');
      expect(conn).not.toBeNull();
      expect(conn?.id).toBe('new-conn-id');

      // Verification that detectAdjacency was called
      expect(mockDetectAdjacency).toHaveBeenCalledWith(room1, room2);
      // The optimization might prevent this call if bounding boxes don't overlap
      // Room 1 (0-4) and Room 3 (8-12) are far apart, so detectAdjacency should NOT be called
      expect(mockDetectAdjacency).not.toHaveBeenCalledWith(room1, room3);
    });

    it('should handle multiple connections', () => {
      const room1 = createRoom('1', 0, 0);
      const room2 = createRoom('2', 4, 0);
      const room3 = createRoom('3', 0, 4);

      let callCount = 0;
      mockUuid.mockImplementation(() => `conn-${++callCount}`);

      mockDetectAdjacency.mockImplementation((r1, r2) => {
        // Just return something if they are adjacent in our setup
        const ids = [r1.id, r2.id].sort().join('-');
        if (ids === '1-2' || ids === '1-3') {
           return {
            room1Id: r1.id,
            room2Id: r2.id,
            sharedWall: { length: 4, room1Wall: 'x', room2Wall: 'y', startPosition: 0, endPosition: 1 },
          };
        }
        return null;
      });

      const resultGraph = buildGraph([room1, room2, room3]);

      expect(resultGraph.getAllConnections()).toHaveLength(2);
      expect(resultGraph.getAdjacentRoomIds('1')).toEqual(expect.arrayContaining(['2', '3']));
    });

    it('should optimize checks by skipping distant rooms', () => {
      // Room 1 at (0,0) size 4x4 -> Bounds (0,0) to (4,4)
      const room1 = createRoom('1', 0, 0);

      // Room 2 at (10,10) size 4x4 -> Bounds (10,10) to (14,14)
      // Gap is huge (> tolerance), so bounding boxes do not overlap
      const room2 = createRoom('2', 10, 10);

      buildGraph([room1, room2]);

      // detectAdjacency should NOT be called because of bounding box optimization
      expect(mockDetectAdjacency).not.toHaveBeenCalled();
    });

    it('should check rooms that are close enough (within tolerance)', () => {
        // Room 1 at (0,0) size 4x4 -> Bounds (0,0) to (4,4)
        const room1 = createRoom('1', 0, 0);

        // Room 2 at (4.005, 0) size 4x4 -> Bounds (4.005, 0) to (8.005, 4)
        // Gap is 0.005, which is < ADJACENCY_TOLERANCE (0.01)
        // So bounding boxes "overlap" with tolerance
        const room2 = createRoom('2', 4.005, 0);

        buildGraph([room1, room2]);

        // detectAdjacency SHOULD be called
        expect(mockDetectAdjacency).toHaveBeenCalledWith(room1, room2);
    });
  });

  describe('calculateAllConnections', () => {
     it('should return list of connections for given rooms', () => {
        const room1 = { id: 'r1' } as Room;
        const room2 = { id: 'r2' } as Room;
        const rooms = [room1, room2];

        // Mock buildGraph internals by mocking the dependency or checking result
        // Since we are testing the exported function which calls buildGraph, we rely on the same mocks
        mockDetectAdjacency.mockReturnValue({
            room1Id: 'r1',
            room2Id: 'r2',
            sharedWall: {
              room1Wall: 'north',
              room2Wall: 'south',
              length: 2,
              startPosition: 0,
              endPosition: 1
            }
        });
        mockUuid.mockReturnValue('test-uuid');

        // Need to ensure bounding boxes overlap for detection to run
        // We will mock getRoomBounds implicitly by passing rooms with positions if we didn't mock getRoomBounds
        // But getRoomBounds is imported. We didn't mock it. So we need real room data or mock it.
        // Let's use real room data structure like in previous tests
        const r1 = {
             id: 'r1', position: { x: 0, z: 0 }, length: 4, width: 4, rotation: 0
        } as Room;
        const r2 = {
             id: 'r2', position: { x: 4, z: 0 }, length: 4, width: 4, rotation: 0
        } as Room;

        const connections = calculateAllConnections([r1, r2]);

        expect(connections).toHaveLength(1);
        expect(connections[0].id).toBe('test-uuid');
     });
  });
});
