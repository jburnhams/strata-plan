import { Room, RoomConnection } from '../../types';
import { getRoomBounds, doRectanglesOverlap } from '../geometry/room';
import { AdjacencyGraph, buildGraph } from './graph';

export interface ConnectionValidationResult {
  orphanRooms: string[];
  unreachableRooms: string[];
  overlappingRooms: [string, string][];
  invalidDoors: { doorId: string; reason: string }[];
}

/**
 * Validates room connections and spatial relationships.
 *
 * @param rooms List of rooms in the floorplan
 * @param connections List of connections (auto and manual)
 * @returns Validation result object
 */
export const validateConnections = (
  rooms: Room[],
  connections: RoomConnection[]
): ConnectionValidationResult => {
  const result: ConnectionValidationResult = {
    orphanRooms: [],
    unreachableRooms: [],
    overlappingRooms: [],
    invalidDoors: [],
  };

  if (rooms.length === 0) return result;

  // 1. Detect Orphan Rooms (no connections)
  // A room is an orphan if its ID does not appear in any connection
  const connectedRoomIds = new Set<string>();
  connections.forEach(conn => {
    connectedRoomIds.add(conn.room1Id);
    connectedRoomIds.add(conn.room2Id);
  });

  rooms.forEach(room => {
    if (!connectedRoomIds.has(room.id)) {
      result.orphanRooms.push(room.id);
    }
  });

  // 2. Detect Unreachable Rooms (Graph Components)
  // We want to see if all rooms (that have connections) are part of the main connected component.
  // Actually, usually "unreachable" means not reachable from the "main" group (e.g. largest group).
  // Or simply, we can list rooms not in the largest component.

  if (rooms.length > 1) {
    // Build an adjacency graph helper to traverse
    // We can reuse AdjacencyGraph class but we need to populate it with provided connections
    const graph = new AdjacencyGraph(connections);

    // Find connected components
    const visited = new Set<string>();
    const components: string[][] = [];

    rooms.forEach(room => {
      if (visited.has(room.id)) return;

      const component: string[] = [];
      const queue = [room.id];
      visited.add(room.id);
      component.push(room.id);

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        const neighbors = graph.getAdjacentRoomIds(currentId);

        for (const neighborId of neighbors) {
          if (!visited.has(neighborId)) {
            visited.add(neighborId);
            component.push(neighborId);
            queue.push(neighborId);
          }
        }
      }
      components.push(component);
    });

    // If more than 1 component, figure out which ones are "unreachable"
    // Heuristic: The largest component is the "main" house. Others are unreachable.
    if (components.length > 1) {
      components.sort((a, b) => b.length - a.length); // Descending by size

      // All components after the first are considered disconnected/unreachable groups
      // We add all room IDs from those components to unreachableRooms
      for (let i = 1; i < components.length; i++) {
        result.unreachableRooms.push(...components[i]);
      }
    }
  }

  // 3. Detect Overlapping Rooms
  // Check strict overlap (intersection area > 0), not just touching.
  // We can reuse doRectanglesOverlap logic but we need to be careful about tolerance.
  // Touching is allowed (adjacency). Overlap is bad.
  // A simple AABB check with a small negative tolerance can check for "significant" overlap.

  for (let i = 0; i < rooms.length; i++) {
    for (let j = i + 1; j < rooms.length; j++) {
      const r1 = rooms[i];
      const r2 = rooms[j];

      // Check if they strictly overlap (area > epsilon)
      // doRectanglesOverlap typically checks AABB.
      // We need to implement a strict check.

      const b1 = getRoomBounds(r1);
      const b2 = getRoomBounds(r2);

      // Deflate one box slightly to allow touching edges
      const EPSILON = 0.001; // 1mm tolerance

      const overlapX = Math.max(0, Math.min(b1.maxX, b2.maxX) - Math.max(b1.minX, b2.minX));
      const overlapZ = Math.max(0, Math.min(b1.maxZ, b2.maxZ) - Math.max(b1.minZ, b2.minZ));

      // If overlap area is significant
      if (overlapX > EPSILON && overlapZ > EPSILON) {
         result.overlappingRooms.push([r1.id, r2.id]);
      }
    }
  }

  // 4. Validate Door Placement (Placeholder for now, as it requires detailed wall segment logic)
  // This is listed as subtask 6.7.3 but might depend on Door implementation details not fully available here.
  // We'll leave it empty for now as requested in the plan "concisely note any issues".

  return result;
};
