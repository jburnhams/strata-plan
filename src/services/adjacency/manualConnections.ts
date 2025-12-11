import { RoomConnection } from '../../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a manual connection between two rooms.
 * Useful for rooms that are logically connected but not spatially adjacent (e.g. hallway, different floors).
 */
export function createManualConnection(room1Id: string, room2Id: string): RoomConnection {
  return {
    id: uuidv4(),
    room1Id,
    room2Id,
    // For manual connections, we don't strictly have wall sides or shared length.
    // We can use special values or optional fields.
    room1Wall: 'north', // Placeholder, required by type but meaningless for manual
    room2Wall: 'south', // Placeholder
    sharedWallLength: 0,
    doors: [],
    isManual: true,
  };
}

/**
 * Filter to remove manual connections that are no longer valid (e.g. room deleted).
 */
export function validateManualConnections(connections: RoomConnection[], existingRoomIds: string[]): RoomConnection[] {
  return connections.filter(c =>
    existingRoomIds.includes(c.room1Id) && existingRoomIds.includes(c.room2Id)
  );
}
