import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { AdjacencyGraph, buildGraph } from '../../../../src/services/adjacency/graph';
import { Room } from '../../../../src/types/room';
import { RoomConnection } from '../../../../src/types/floorplan';

// Mock uuid to return unique values
const mockUuidV4 = jest.fn();
let uuidCounter = 0;

jest.mock('uuid', () => ({
  v4: () => mockUuidV4()
}));

describe('AdjacencyGraph', () => {
  beforeEach(() => {
    uuidCounter = 0;
    mockUuidV4.mockImplementation(() => `mock-uuid-${++uuidCounter}`);
  });

  const createRoom = (
    id: string,
    x: number,
    z: number,
    length: number,
    width: number
  ): Room => ({
    id,
    name: `Room ${id}`,
    type: 'bedroom',
    position: { x, z },
    length,
    width,
    height: 2.4,
    rotation: 0,
    doors: [],
    windows: [],
  });

  const createConnection = (id: string, room1Id: string, room2Id: string): RoomConnection => ({
    id,
    room1Id,
    room2Id,
    room1Wall: 'north',
    room2Wall: 'south',
    sharedWallLength: 4,
    doors: [],
  });

  describe('buildGraph', () => {
    it('should build a graph from a list of rooms', () => {
      // A-B-C chain
      const r1 = createRoom('1', 0, 0, 4, 4);
      const r2 = createRoom('2', 4, 0, 4, 4);
      const r3 = createRoom('3', 8, 0, 4, 4);

      const graph = buildGraph([r1, r2, r3]);

      expect(graph.getAdjacentRoomIds('1')).toEqual(['2']);
      expect(graph.getAdjacentRoomIds('2').sort()).toEqual(['1', '3'].sort());
      expect(graph.getAdjacentRoomIds('3')).toEqual(['2']);
    });

    it('should handle a loop of rooms', () => {
      // 2x2 grid of rooms
      // 1 2
      // 4 3
      const r1 = createRoom('1', 0, 0, 4, 4);
      const r2 = createRoom('2', 4, 0, 4, 4);
      const r3 = createRoom('3', 4, 4, 4, 4);
      const r4 = createRoom('4', 0, 4, 4, 4);

      const graph = buildGraph([r1, r2, r3, r4]);

      expect(graph.getAdjacentRoomIds('1').sort()).toEqual(['2', '4'].sort());
      expect(graph.getAdjacentRoomIds('2').sort()).toEqual(['1', '3'].sort());
      expect(graph.getAdjacentRoomIds('3').sort()).toEqual(['2', '4'].sort());
      expect(graph.getAdjacentRoomIds('4').sort()).toEqual(['1', '3'].sort());
    });

    it('should return null for non-existent shared wall', () => {
      const r1 = createRoom('1', 0, 0, 4, 4);
      const r2 = createRoom('2', 10, 0, 4, 4); // Far away

      const graph = buildGraph([r1, r2]);

      expect(graph.getConnection('1', '2')).toBeNull();
    });

    it('should retrieve shared wall details correctly', () => {
      const r1 = createRoom('1', 0, 0, 4, 4);
      const r2 = createRoom('2', 4, 0, 4, 4);

      const graph = buildGraph([r1, r2]);
      const connection = graph.getConnection('1', '2');

      expect(connection).toBeDefined();
      expect(connection?.room1Id).toBe('1');
      expect(connection?.room2Id).toBe('2');
      expect(connection?.sharedWallLength).toBe(4);
    });

    it('should handle disjoint sets of rooms', () => {
        // 1-2   3-4
        const r1 = createRoom('1', 0, 0, 4, 4);
        const r2 = createRoom('2', 4, 0, 4, 4);
        const r3 = createRoom('3', 10, 0, 4, 4);
        const r4 = createRoom('4', 14, 0, 4, 4);

        const graph = buildGraph([r1, r2, r3, r4]);

        expect(graph.getAdjacentRoomIds('1')).toEqual(['2']);
        expect(graph.getAdjacentRoomIds('3')).toEqual(['4']);
        expect(graph.getConnection('2', '3')).toBeNull();
    });
  });

  describe('Graph Management', () => {
    let graph: AdjacencyGraph;

    beforeEach(() => {
      graph = new AdjacencyGraph();
    });

    it('should add connections correctly', () => {
      const conn = createConnection('c1', '1', '2');
      graph.addConnection(conn);

      expect(graph.getConnection('1', '2')).toEqual(conn);
      expect(graph.getAdjacentRoomIds('1')).toContain('2');
      expect(graph.getAdjacentRoomIds('2')).toContain('1');
    });

    it('should not add duplicate connections', () => {
      const conn = createConnection('c1', '1', '2');
      graph.addConnection(conn);
      graph.addConnection(conn); // Add again

      expect(graph.getAllConnections()).toHaveLength(1);
      expect(graph.getConnectionsForRoom('1')).toHaveLength(1);
    });

    it('should remove connections correctly', () => {
      const conn1 = createConnection('c1', '1', '2');
      const conn2 = createConnection('c2', '2', '3');
      graph.addConnection(conn1);
      graph.addConnection(conn2);

      expect(graph.getAllConnections()).toHaveLength(2);

      graph.removeConnection('c1');

      expect(graph.getAllConnections()).toHaveLength(1);
      expect(graph.getConnection('1', '2')).toBeNull();
      expect(graph.getConnection('2', '3')).toEqual(conn2);

      // Check room mappings are cleaned up
      expect(graph.getConnectionsForRoom('1')).toHaveLength(0);
      expect(graph.getConnectionsForRoom('2')).toHaveLength(1);
    });

    it('should clear all connections', () => {
      graph.addConnection(createConnection('c1', '1', '2'));
      graph.addConnection(createConnection('c2', '3', '4'));

      expect(graph.getAllConnections()).toHaveLength(2);

      graph.clear();

      expect(graph.getAllConnections()).toHaveLength(0);
      expect(graph.getConnectionsForRoom('1')).toHaveLength(0);
    });

    it('should get all unique connections', () => {
      const conn1 = createConnection('c1', '1', '2');
      const conn2 = createConnection('c2', '2', '3');
      graph.addConnection(conn1);
      graph.addConnection(conn2);

      const all = graph.getAllConnections();
      expect(all).toHaveLength(2);
      expect(all).toContainEqual(conn1);
      expect(all).toContainEqual(conn2);
    });
  });
});
