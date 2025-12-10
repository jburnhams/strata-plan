import { Room } from '../../types/room';
import { RoomConnection } from '../../types/floorplan';
import { detectAdjacency } from './detection';
import { v4 as uuidv4 } from 'uuid';

export class AdjacencyGraph {
  // Map roomId -> list of connections involving this room
  private connections: Map<string, RoomConnection[]> = new Map();

  constructor(initialConnections: RoomConnection[] = []) {
    initialConnections.forEach((conn) => this.addConnection(conn));
  }

  addConnection(connection: RoomConnection): void {
    this.addToMap(connection.room1Id, connection);
    this.addToMap(connection.room2Id, connection);
  }

  private addToMap(roomId: string, connection: RoomConnection) {
    const list = this.connections.get(roomId) || [];
    // Prevent duplicates by ID
    if (!list.some((c) => c.id === connection.id)) {
      list.push(connection);
      this.connections.set(roomId, list);
    }
  }

  removeConnection(connectionId: string): void {
    for (const [roomId, list] of this.connections.entries()) {
      const newList = list.filter((c) => c.id !== connectionId);
      if (newList.length < list.length) {
        if (newList.length === 0) {
          this.connections.delete(roomId);
        } else {
          this.connections.set(roomId, newList);
        }
      }
    }
  }

  getConnectionsForRoom(roomId: string): RoomConnection[] {
    return this.connections.get(roomId) || [];
  }

  getConnection(room1Id: string, room2Id: string): RoomConnection | null {
    const list = this.connections.get(room1Id);
    if (!list) return null;
    return (
      list.find(
        (c) =>
          (c.room1Id === room1Id && c.room2Id === room2Id) ||
          (c.room1Id === room2Id && c.room2Id === room1Id)
      ) || null
    );
  }

  getAllConnections(): RoomConnection[] {
    // Dedup connections since they are stored twice (once per room)
    const seen = new Set<string>();
    const result: RoomConnection[] = [];
    for (const list of this.connections.values()) {
      for (const conn of list) {
        if (!seen.has(conn.id)) {
          seen.add(conn.id);
          result.push(conn);
        }
      }
    }
    return result;
  }

  getAdjacentRoomIds(roomId: string): string[] {
    const list = this.getConnectionsForRoom(roomId);
    return list.map((c) => (c.room1Id === roomId ? c.room2Id : c.room1Id));
  }

  clear(): void {
    this.connections.clear();
  }
}

/**
 * Builds an adjacency graph from a list of rooms by detecting overlapping walls
 */
export function buildGraph(rooms: Room[]): AdjacencyGraph {
  const graph = new AdjacencyGraph();

  // Iterate all unique pairs
  for (let i = 0; i < rooms.length; i++) {
    for (let j = i + 1; j < rooms.length; j++) {
      const room1 = rooms[i];
      const room2 = rooms[j];

      const info = detectAdjacency(room1, room2);
      if (info) {
        const connection: RoomConnection = {
          id: uuidv4(),
          room1Id: room1.id,
          room2Id: room2.id,
          room1Wall: info.sharedWall.room1Wall,
          room2Wall: info.sharedWall.room2Wall,
          sharedWallLength: info.sharedWall.length,
          doors: [],
        };
        graph.addConnection(connection);
      }
    }
  }

  return graph;
}
