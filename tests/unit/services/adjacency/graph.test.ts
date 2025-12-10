import { AdjacencyGraph, buildGraph } from '@/services/adjacency/graph';
import { detectAdjacency } from '@/services/adjacency/detection';
import { Room } from '@/types/room';
import { RoomConnection } from '@/types/floorplan';
import { v4 as uuidv4 } from 'uuid';

jest.mock('@/services/adjacency/detection');
jest.mock('uuid');

const mockedDetectAdjacency = jest.mocked(detectAdjacency);
const mockedUuid = jest.mocked(uuidv4);

describe('AdjacencyGraph', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    let uuidCounter = 0;
    mockedUuid.mockImplementation(() => `conn-${++uuidCounter}`);
  });

  const createConnection = (id: string, r1: string, r2: string): RoomConnection => ({
    id,
    room1Id: r1,
    room2Id: r2,
    room1Wall: 'north',
    room2Wall: 'south',
    sharedWallLength: 5,
    doors: [],
  });

  describe('AdjacencyGraph class', () => {
    it('stores connections correctly', () => {
      const graph = new AdjacencyGraph();
      const conn1 = createConnection('c1', 'r1', 'r2');

      graph.addConnection(conn1);

      expect(graph.getConnectionsForRoom('r1')).toContain(conn1);
      expect(graph.getConnectionsForRoom('r2')).toContain(conn1);
      expect(graph.getAllConnections()).toHaveLength(1);
    });

    it('implements bidirectional lookup', () => {
      const graph = new AdjacencyGraph();
      const conn1 = createConnection('c1', 'r1', 'r2');
      graph.addConnection(conn1);

      expect(graph.getConnection('r1', 'r2')).toBe(conn1);
      expect(graph.getConnection('r2', 'r1')).toBe(conn1);
    });

    it('returns null if connection not found', () => {
      const graph = new AdjacencyGraph();
      expect(graph.getConnection('r1', 'r2')).toBeNull();
    });

    it('removes connections', () => {
      const graph = new AdjacencyGraph();
      const conn1 = createConnection('c1', 'r1', 'r2');
      graph.addConnection(conn1);

      graph.removeConnection('c1');

      expect(graph.getConnectionsForRoom('r1')).toHaveLength(0);
      expect(graph.getConnectionsForRoom('r2')).toHaveLength(0);
      expect(graph.getAllConnections()).toHaveLength(0);
    });

    it('getAdjacentRoomIds returns correct rooms', () => {
      const graph = new AdjacencyGraph();
      const conn1 = createConnection('c1', 'r1', 'r2');
      const conn2 = createConnection('c2', 'r1', 'r3');

      graph.addConnection(conn1);
      graph.addConnection(conn2);

      const adj = graph.getAdjacentRoomIds('r1');
      expect(adj).toContain('r2');
      expect(adj).toContain('r3');
      expect(adj).toHaveLength(2);

      expect(graph.getAdjacentRoomIds('r2')).toEqual(['r1']);
    });
  });

  describe('buildGraph', () => {
    it('builds graph from rooms by detecting adjacencies', () => {
      const rooms = [
        { id: 'r1' } as Room,
        { id: 'r2' } as Room,
        { id: 'r3' } as Room,
      ];

      // Setup mock: r1-r2 adjacent, r2-r3 adjacent, r1-r3 not adjacent
      mockedDetectAdjacency.mockImplementation((r1, r2) => {
        const pair = [r1.id, r2.id].sort().join('-');
        if (pair === 'r1-r2') {
          return {
            room1Id: 'r1',
            room2Id: 'r2',
            sharedWall: {
              room1Wall: 'east',
              room2Wall: 'west',
              length: 3,
              startPosition: 0,
              endPosition: 1,
            }
          };
        }
        if (pair === 'r2-r3') {
           return {
            room1Id: 'r2',
            room2Id: 'r3',
            sharedWall: {
              room1Wall: 'south',
              room2Wall: 'north',
              length: 3,
              startPosition: 0,
              endPosition: 1,
            }
          };
        }
        return null;
      });

      const graph = buildGraph(rooms);

      expect(mockedDetectAdjacency).toHaveBeenCalledTimes(3); // r1-r2, r1-r3, r2-r3

      expect(graph.getAllConnections()).toHaveLength(2);
      expect(graph.getConnection('r1', 'r2')).not.toBeNull();
      expect(graph.getConnection('r2', 'r3')).not.toBeNull();
      expect(graph.getConnection('r1', 'r3')).toBeNull();

      const conn12 = graph.getConnection('r1', 'r2');
      expect(conn12?.room1Wall).toBe('east');
      expect(conn12?.room2Wall).toBe('west');
    });
  });
});
