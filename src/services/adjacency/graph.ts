import { Room } from '../../types/room';
import { RoomConnection } from '../../types/floorplan';
import { detectAdjacency } from './detection';
import { getRoomBounds } from '../geometry/room';
import { v4 as uuidv4 } from 'uuid';

// Tolerance for bounding box check (must be >= detection tolerance)
const ADJACENCY_TOLERANCE = 0.01;

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

      // Optimization: Quick bounding box check
      // We check if bounding boxes are within tolerance of each other
      const b1 = getRoomBounds(room1);
      const b2 = getRoomBounds(room2);

      // Check for overlap in X and Z axes with tolerance
      // If min1 > max2 or max1 < min2, then NO overlap
      // We want to continue if there IS potential overlap (or touching)
      // NOTE: We use < and > for "strictly no overlap", so >= and <= allow touching
      const noOverlapX = (b1.minX > b2.maxX + ADJACENCY_TOLERANCE) || (b1.maxX < b2.minX - ADJACENCY_TOLERANCE);
      const noOverlapZ = (b1.minZ > b2.maxZ + ADJACENCY_TOLERANCE) || (b1.maxZ < b2.minZ - ADJACENCY_TOLERANCE);

      if (noOverlapX || noOverlapZ) {
        continue;
      }

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

/**
 * Rebuilds connections for a set of rooms, returning the new list of connections.
 * This helper is used to update the store when room geometry changes.
 */
/**
 * Merges newly detected connections with existing ones to preserve IDs and properties.
 */
export function mergeConnections(newConnections: RoomConnection[], oldConnections: RoomConnection[], rooms: Room[]): RoomConnection[] {
  // 1. Process new (auto-detected) connections
  const merged = newConnections.map(newConn => {
    // Find matching existing connection (order-insensitive)
    const existing = oldConnections.find(oldConn =>
      (oldConn.room1Id === newConn.room1Id && oldConn.room2Id === newConn.room2Id) ||
      (oldConn.room1Id === newConn.room2Id && oldConn.room2Id === newConn.room1Id)
    );

    if (existing) {
      // Keep existing ID and doors. If existing was manual, it is now confirmed by auto-detection.
      // We should probably keep the auto-detected geometry but preserve ID and metadata.
      // However, if it was manual, maybe we should unset the manual flag?
      // Generally, if geometry now supports it, it's just a regular connection.
      const { isManual, ...rest } = existing;
      return {
        ...newConn,
        id: existing.id,
        doors: existing.doors,
        // We do NOT copy isManual. If it's auto-detected now, it's no longer manual-only.
      };
    }

    return newConn;
  });

  // 2. Preserve manual connections that were NOT auto-detected
  // Filter for manual connections in old list
  const manualConnections = oldConnections.filter(c => c.isManual);

  manualConnections.forEach(manualConn => {
    // Check if this manual connection is already covered by an auto-detected one in the merged list
    const isCovered = merged.some(m =>
       (m.room1Id === manualConn.room1Id && m.room2Id === manualConn.room2Id) ||
       (m.room1Id === manualConn.room2Id && m.room2Id === manualConn.room1Id)
    );

    // Also check if the rooms still exist. If a room was deleted, the manual connection should go.
    // The 'rooms' array passed to calculateAllConnections represents the CURRENT valid rooms.
    const room1Exists = rooms.some(r => r.id === manualConn.room1Id);
    const room2Exists = rooms.some(r => r.id === manualConn.room2Id);

    if (!isCovered && room1Exists && room2Exists) {
      merged.push(manualConn);
    }
  });

  return merged;
}

/**
 * Rebuilds connections for a set of rooms, returning the new list of connections.
 * This helper is used to update the store when room geometry changes.
 */
export function calculateAllConnections(rooms: Room[], oldConnections: RoomConnection[] = []): RoomConnection[] {
  const graph = buildGraph(rooms);
  const newConnections = graph.getAllConnections();
  return mergeConnections(newConnections, oldConnections, rooms);
}
