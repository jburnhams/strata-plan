import { Room } from '../../types/room';
import { RoomConnection } from '../../types/floorplan';
import { AdjacencyGraph } from './graph';
import { getRoomCenter } from '../geometry';
import { distance } from '../geometry/bounds';

/**
 * Finds the shortest path between two rooms using BFS
 * Returns an array of room IDs representing the path (including start and end)
 * Returns empty array if no path exists
 */
export function findPath(
  startRoomId: string,
  endRoomId: string,
  connections: RoomConnection[]
): string[] {
  if (startRoomId === endRoomId) return [startRoomId];

  const graph = new AdjacencyGraph(connections);
  const queue: string[][] = [[startRoomId]];
  const visited = new Set<string>([startRoomId]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const currentRoomId = path[path.length - 1];

    if (currentRoomId === endRoomId) {
      return path;
    }

    const neighbors = graph.getAdjacentRoomIds(currentRoomId);
    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push([...path, neighborId]);
      }
    }
  }

  return [];
}

/**
 * Calculates the total physical distance of a path
 * Distance is measured between room centers
 */
export function calculatePathDistance(
  path: string[],
  rooms: Room[]
): number {
  if (path.length < 2) return 0;

  let totalDistance = 0;
  const roomMap = new Map(rooms.map(r => [r.id, r]));

  for (let i = 0; i < path.length - 1; i++) {
    const r1 = roomMap.get(path[i]);
    const r2 = roomMap.get(path[i + 1]);

    if (!r1 || !r2) {
      // If a room is missing (e.g., deleted), we can't calculate full distance.
      // Depending on requirements, we might throw or return partial or 0.
      // For robustness, let's just warn and skip or throw.
      // Given this is a utility, throwing is appropriate to signal error.
      throw new Error(`Room not found in path calculation: ${path[i]} or ${path[i+1]}`);
    }

    const c1 = getRoomCenter(r1);
    const c2 = getRoomCenter(r2);

    const dist = distance(c1.x, c1.z, c2.x, c2.z);
    totalDistance += dist;
  }

  return totalDistance;
}
