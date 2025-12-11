import { RoomConnection } from '../../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a manual connection between two rooms.
 *
 * @param room1Id ID of the first room
 * @param room2Id ID of the second room
 * @returns A new RoomConnection object representing a manual link
 */
export const createManualConnection = (room1Id: string, room2Id: string): RoomConnection => {
  return {
    id: uuidv4(),
    room1Id,
    room2Id,
    sharedWall: 'manual', // Special indicator for manual connections
    overlapStart: 0,
    overlapEnd: 0,
    doors: [],
    isManual: true, // Flag to distinguish from auto-detected
  };
};

/**
 * Checks if a connection is a manual connection.
 *
 * @param connection The connection to check
 * @returns True if manual, false otherwise
 */
export const isManualConnection = (connection: RoomConnection): boolean => {
  return connection.isManual === true;
};
