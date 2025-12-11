import { Room, RoomConnection, Door } from '../../types';
import { AdjacencyGraph } from './graph';

export interface ValidationResult {
  orphanRooms: string[];
  unreachableRooms: string[];
  invalidDoors: { doorId: string; reason: string }[];
  overlappingRooms: [string, string][];
}

/**
 * Validates room connections, adjacencies, and placements
 */
export const validateAdjacency = (
  rooms: Room[],
  connections: RoomConnection[],
  doors: Door[] = []
): ValidationResult => {
  const graph = new AdjacencyGraph();
  // We assume the graph is already built or we can rebuild it if needed.
  // Ideally, we should pass the graph instance, but the interface takes arrays.
  // Let's assume we build a graph or use the provided connections to populate it.

  // Re-populating graph manually for validation context if needed,
  // or we can change signature to accept AdjacencyGraph.
  // The task description says:
  // getOrphanRooms(rooms: Room[], graph: AdjacencyGraph): string[]
  // So I'll implement the helper functions first.

  // For the main export, I'll construct the graph from connections.
  connections.forEach(conn => graph.addConnection(conn));

  return {
    orphanRooms: getOrphanRooms(rooms, graph),
    unreachableRooms: getUnreachableRooms(rooms, graph),
    invalidDoors: getInvalidDoors(rooms, connections, doors),
    overlappingRooms: getOverlappingRooms(rooms)
  };
};

/**
 * Detects rooms with no connections
 */
export const getOrphanRooms = (rooms: Room[], graph: AdjacencyGraph): string[] => {
  return rooms
    .filter(room => graph.getConnectionsForRoom(room.id).length === 0)
    .map(room => room.id);
};

/**
 * Detects rooms not connected to the main group (largest connected component)
 */
export const getUnreachableRooms = (rooms: Room[], graph: AdjacencyGraph): string[] => {
  if (rooms.length === 0) return [];

  const visited = new Set<string>();
  const components: string[][] = [];

  // Find all connected components
  for (const room of rooms) {
    if (!visited.has(room.id)) {
      const component: string[] = [];
      const queue = [room.id];
      visited.add(room.id);

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        component.push(currentId);

        const connections = graph.getConnectionsForRoom(currentId);
        for (const conn of connections) {
          const neighborId = conn.room1Id === currentId ? conn.room2Id : conn.room1Id;
          if (!visited.has(neighborId)) {
            visited.add(neighborId);
            queue.push(neighborId);
          }
        }
      }
      components.push(component);
    }
  }

  // Identify the main group (largest component)
  if (components.length <= 1) return [];

  // Sort by size descending
  components.sort((a, b) => b.length - a.length);

  // All rooms not in the first (largest) component are considered unreachable
  const mainGroup = new Set(components[0]);
  return rooms
    .filter(room => !mainGroup.has(room.id))
    .map(room => room.id);
};

/**
 * Detects rooms that physically overlap (invalid state)
 */
export const getOverlappingRooms = (rooms: Room[]): [string, string][] => {
  const overlaps: [string, string][] = [];

  // Simple AABB check for now.
  // Room coordinates are top-left (x, z) + length (x), width (z).
  // Need to handle rotation?
  // Room definition: position: {x, z}, length, width, rotation.
  // We need to calculate bounding box based on rotation.

  for (let i = 0; i < rooms.length; i++) {
    for (let j = i + 1; j < rooms.length; j++) {
      if (checkRoomOverlap(rooms[i], rooms[j])) {
        overlaps.push([rooms[i].id, rooms[j].id]);
      }
    }
  }

  return overlaps;
};

/**
 * Helper to check if two rooms overlap
 */
const checkRoomOverlap = (r1: Room, r2: Room): boolean => {
  const box1 = getRoomBoundingBox(r1);
  const box2 = getRoomBoundingBox(r2);

  // Check for intersection
  // We use a small epsilon to avoid flagging touching rooms as overlapping
  // Adjacency tolerance is 0.01m, so overlap should be significantly more than that to be an error?
  // Or strictly check if they intersect.
  // If they touch, it's adjacency. If they intersect, it's overlap.

  const epsilon = 0.001; // Small epsilon

  const noOverlap =
    box1.maxX <= box2.minX + epsilon ||
    box1.minX >= box2.maxX - epsilon ||
    box1.maxZ <= box2.minZ + epsilon ||
    box1.minZ >= box2.maxZ - epsilon;

  return !noOverlap;
};

const getRoomBoundingBox = (room: Room) => {
  let dimX = room.length;
  let dimZ = room.width;

  if (room.rotation === 90 || room.rotation === 270) {
    dimX = room.width;
    dimZ = room.length;
  }

  return {
    minX: room.position.x,
    maxX: room.position.x + dimX,
    minZ: room.position.z,
    maxZ: room.position.z + dimZ
  };
};

/**
 * Validates door placement on connections
 */
export const getInvalidDoors = (
  rooms: Room[],
  connections: RoomConnection[],
  doors: Door[]
): { doorId: string; reason: string }[] => {
  const invalidDoors: { doorId: string; reason: string }[] = [];
  const roomsMap = new Map(rooms.map(r => [r.id, r]));

  // Check connection-associated doors
  for (const door of doors) {
    if (door.connectionId) {
      const conn = connections.find(c => c.id === door.connectionId);
      if (!conn) {
        // Door points to non-existent connection (shouldn't happen with referential integrity, but logic-wise)
        // Or maybe it's just a warning.
        continue;
      }

      // Check if door fits in shared wall
      // Door width vs Shared wall length
      // Note: Door position is 0.0-1.0 along the wall, but we need to check if the specific placement
      // within the shared segment is valid.
      //
      // This is tricky because `door.position` is along the *room's* wall, not necessarily the shared segment.
      // But for a connected door, it should probably be defined relative to the shared segment or we need to map it.
      //
      // If the door is stored as belonging to a room and a wall side, we can check if it falls within the shared segment.

      if (door.width > conn.sharedWallLength) {
        invalidDoors.push({
          doorId: door.id,
          reason: `Door width (${door.width}m) exceeds shared wall length (${conn.sharedWallLength}m)`
        });
      }
    }
  }

  return invalidDoors;
};
