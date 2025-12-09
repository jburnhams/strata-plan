/**
 * Validation utilities for floorplan data
 */

import type { Room, Floorplan } from '../types';
import {
  MIN_ROOM_DIMENSION,
  MAX_ROOM_DIMENSION,
  MIN_CEILING_HEIGHT,
  MAX_CEILING_HEIGHT,
  MAX_ROOM_NAME_LENGTH,
  MAX_PROJECT_NAME_LENGTH,
} from '../constants/limits';
import { doRoomsOverlap } from '../services/geometry';

/**
 * Validation result with error and warning messages
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
}

/**
 * Validate a room dimension (length or width)
 */
export function validateRoomDimension(value: number, fieldName: string): ValidationResult {
  if (value < MIN_ROOM_DIMENSION) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${MIN_ROOM_DIMENSION}m`,
    };
  }

  if (value > MAX_ROOM_DIMENSION) {
    return {
      valid: false,
      error: `${fieldName} cannot exceed ${MAX_ROOM_DIMENSION}m`,
    };
  }

  if (value < 1) {
    return {
      valid: true,
      warning: `${fieldName} is unusually small (less than 1m)`,
    };
  }

  if (value > 50) {
    return {
      valid: true,
      warning: `${fieldName} is unusually large (more than 50m)`,
    };
  }

  return { valid: true };
}

/**
 * Validate ceiling height
 */
export function validateCeilingHeight(value: number): ValidationResult {
  if (value < MIN_CEILING_HEIGHT) {
    return {
      valid: false,
      error: `Ceiling height must be at least ${MIN_CEILING_HEIGHT}m`,
    };
  }

  if (value > MAX_CEILING_HEIGHT) {
    return {
      valid: false,
      error: `Ceiling height cannot exceed ${MAX_CEILING_HEIGHT}m`,
    };
  }

  if (value < 2.2) {
    return {
      valid: true,
      warning: 'Ceiling height is unusually low (less than 2.2m)',
    };
  }

  if (value > 3.5) {
    return {
      valid: true,
      warning: 'Ceiling height is unusually high (more than 3.5m)',
    };
  }

  return { valid: true };
}

/**
 * Validate room name
 */
export function validateRoomName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return {
      valid: false,
      error: 'Room name cannot be empty',
    };
  }

  if (name.length > MAX_ROOM_NAME_LENGTH) {
    return {
      valid: false,
      error: `Room name cannot exceed ${MAX_ROOM_NAME_LENGTH} characters`,
    };
  }

  if (name.length > 50) {
    return {
      valid: true,
      warning: 'Room name is quite long (more than 50 characters)',
    };
  }

  return { valid: true };
}

/**
 * Validate project name
 */
export function validateProjectName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return {
      valid: false,
      error: 'Project name cannot be empty',
    };
  }

  if (name.length > MAX_PROJECT_NAME_LENGTH) {
    return {
      valid: false,
      error: `Project name cannot exceed ${MAX_PROJECT_NAME_LENGTH} characters`,
    };
  }

  if (name.length > 50) {
    return {
      valid: true,
      warning: 'Project name is quite long (more than 50 characters)',
    };
  }

  return { valid: true };
}

/**
 * Validate an entire room
 */
export function validateRoom(room: Room): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Validate name
  results.push(validateRoomName(room.name));

  // Validate dimensions
  results.push(validateRoomDimension(room.length, 'Length'));
  results.push(validateRoomDimension(room.width, 'Width'));
  results.push(validateCeilingHeight(room.height));

  return results;
}

/**
 * Validate an entire floorplan
 */
export function validateFloorplan(floorplan: Floorplan): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Validate project name
  results.push(validateProjectName(floorplan.name));

  // Validate all rooms
  for (const room of floorplan.rooms) {
    results.push(...validateRoom(room));
  }

  // Check for overlapping rooms
  for (let i = 0; i < floorplan.rooms.length; i++) {
    for (let j = i + 1; j < floorplan.rooms.length; j++) {
      const room1 = floorplan.rooms[i];
      const room2 = floorplan.rooms[j];

      if (doRoomsOverlap(room1, room2)) {
        results.push({
          valid: false,
          error: `Rooms "${room1.name}" and "${room2.name}" overlap`,
        });
      }
    }
  }

  return results;
}

/**
 * Check if validation results contain any errors
 */
export function hasErrors(results: ValidationResult[]): boolean {
  return results.some((r) => !r.valid);
}

/**
 * Get all error messages from validation results
 */
export function getErrors(results: ValidationResult[]): string[] {
  return results.filter((r) => r.error).map((r) => r.error!);
}

/**
 * Get all warning messages from validation results
 */
export function getWarnings(results: ValidationResult[]): string[] {
  return results.filter((r) => r.warning).map((r) => r.warning!);
}
