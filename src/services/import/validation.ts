import { Floorplan, Room, RoomType } from '../../types';
import { ValidationResult } from './index';
import { validateDoor, Door } from '../../types/door';
import { validateWindow, Window } from '../../types/window';

/**
 * Validates an imported floorplan object structure and data integrity.
 *
 * @param data The unknown data to validate
 * @returns ValidationResult with errors and warnings
 */
export function validateImportedFloorplan(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic type check
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      errors: ['Imported data must be an object'],
      warnings: []
    };
  }

  const floorplan = data as Partial<Floorplan>;

  // Check required fields
  if (!floorplan.id || typeof floorplan.id !== 'string') {
    errors.push('Missing or invalid floorplan ID');
  }

  if (!floorplan.rooms || !Array.isArray(floorplan.rooms)) {
    errors.push('Missing or invalid rooms array');
  }

  if (!floorplan.units || (floorplan.units !== 'meters' && floorplan.units !== 'feet')) {
    errors.push('Missing or invalid units (must be "meters" or "feet")');
  }

  // If we already have critical structure errors, stop here
  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  // Validate rooms
  const roomIds = new Set<string>();

  floorplan.rooms!.forEach((room: any, index: number) => {
    // Check room ID
    if (!room.id || typeof room.id !== 'string') {
      errors.push(`Room at index ${index} missing ID`);
    } else {
      if (roomIds.has(room.id)) {
        errors.push(`Duplicate room ID: ${room.id}`);
      }
      roomIds.add(room.id);
    }

    // Check dimensions
    if (typeof room.length !== 'number' || room.length <= 0) {
      errors.push(`Room ${room.id || index}: Invalid length`);
    }
    if (typeof room.width !== 'number' || room.width <= 0) {
      errors.push(`Room ${room.id || index}: Invalid width`);
    }
    if (typeof room.height !== 'number' || room.height <= 0) {
      errors.push(`Room ${room.id || index}: Invalid height`);
    }

    // Check type
    if (!isValidRoomType(room.type)) {
      warnings.push(`Room ${room.id || index}: Unknown room type "${room.type}", defaulting to "generic"`);
    }

    // Check position
    if (!room.position || typeof room.position.x !== 'number' || typeof room.position.z !== 'number') {
      errors.push(`Room ${room.id || index}: Invalid position`);
    }
  });

  // Validate doors
  if (floorplan.doors && Array.isArray(floorplan.doors)) {
    floorplan.doors.forEach((door: any, index: number) => {
      if (!door.id || typeof door.id !== 'string') {
        errors.push(`Door at index ${index} missing ID`);
      } else if (!door.roomId || !roomIds.has(door.roomId)) {
        errors.push(`Door ${door.id}: Reference to non-existent roomId ${door.roomId}`);
      } else {
        // Check dimensions and position existence before calling validator
        if (typeof door.width !== 'number' || typeof door.height !== 'number' || typeof door.position !== 'number') {
          errors.push(`Door ${door.id}: Missing or invalid dimensions/position`);
        } else {
          const validation = validateDoor(door as Door);
          if (!validation.isValid) {
            validation.errors.forEach(err => errors.push(`Door ${door.id}: ${err}`));
          }
        }
      }
    });
  } else if (!floorplan.doors) {
    warnings.push('Missing doors array, defaulting to empty');
  }

  // Validate windows
  if (floorplan.windows && Array.isArray(floorplan.windows)) {
    floorplan.windows.forEach((win: any, index: number) => {
      if (!win.id || typeof win.id !== 'string') {
        errors.push(`Window at index ${index} missing ID`);
      } else if (!win.roomId || !roomIds.has(win.roomId)) {
        errors.push(`Window ${win.id}: Reference to non-existent roomId ${win.roomId}`);
      } else {
        if (typeof win.width !== 'number' || typeof win.height !== 'number' || typeof win.sillHeight !== 'number') {
          errors.push(`Window ${win.id}: Missing or invalid dimensions`);
        } else {
          const validation = validateWindow(win as Window);
          if (!validation.isValid) {
            validation.errors.forEach(err => errors.push(`Window ${win.id}: ${err}`));
          }
        }
      }
    });
  } else if (!floorplan.windows) {
    warnings.push('Missing windows array, defaulting to empty');
  }

  // Validate connections (if present)
  if (floorplan.connections && Array.isArray(floorplan.connections)) {
    floorplan.connections.forEach((conn: any, index: number) => {
      if (!conn.room1Id || !conn.room2Id) {
        errors.push(`Connection at index ${index}: Missing room IDs`);
      } else {
        if (!roomIds.has(conn.room1Id)) {
          errors.push(`Connection at index ${index}: Reference to non-existent room1Id ${conn.room1Id}`);
        }
        if (!roomIds.has(conn.room2Id)) {
          errors.push(`Connection at index ${index}: Reference to non-existent room2Id ${conn.room2Id}`);
        }
      }
    });
  }

  // Overlap detection could go here (as warning)

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

function isValidRoomType(type: string): boolean {
  const validTypes: RoomType[] = [
    'living', 'kitchen', 'bedroom', 'bathroom', 'dining',
    'office', 'hallway', 'garage', 'generic'
  ];
  return validTypes.includes(type as RoomType) || type === 'generic';
}
