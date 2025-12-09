import { Floorplan } from '@/types/floorplan';
import { Room, Wall, Door, Window } from '@/types/room';

// Current schema version
export const CURRENT_VERSION = '1.0.0';

/**
 * Serialized version of Floorplan type where Dates are strings.
 * This is safe to store in IndexedDB or JSON files.
 */
export interface SerializedFloorplan extends Omit<Floorplan, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
  version: string;
}

/**
 * Serialize a Floorplan object for storage
 */
export const serializeFloorplan = (floorplan: Floorplan): SerializedFloorplan => {
  if (!floorplan) {
      throw new Error('Cannot serialize null or undefined floorplan');
  }

  // Deep clone to avoid mutating original
  const serialized = JSON.parse(JSON.stringify(floorplan));

  // Ensure dates are ISO strings
  serialized.createdAt = floorplan.createdAt instanceof Date
    ? floorplan.createdAt.toISOString()
    : new Date(floorplan.createdAt).toISOString();

  serialized.updatedAt = floorplan.updatedAt instanceof Date
    ? floorplan.updatedAt.toISOString()
    : new Date(floorplan.updatedAt).toISOString();

  // Ensure version is set
  serialized.version = floorplan.version || CURRENT_VERSION;

  return serialized;
};

/**
 * Deserialize a stored object back into a Floorplan
 */
export const deserializeFloorplan = (data: SerializedFloorplan): Floorplan => {
  if (!data) {
    throw new Error('Cannot deserialize null or undefined data');
  }

  // Basic validation of required fields
  if (!data.id || !data.rooms) {
    throw new Error('Invalid floorplan data: missing required fields');
  }

  const floorplan = { ...data } as unknown as Floorplan;

  // Restore Date objects
  floorplan.createdAt = new Date(data.createdAt);
  floorplan.updatedAt = new Date(data.updatedAt);

  if (isNaN(floorplan.createdAt.getTime())) {
      throw new Error('Invalid createdAt date');
  }
  if (isNaN(floorplan.updatedAt.getTime())) {
      throw new Error('Invalid updatedAt date');
  }

  // Ensure arrays exist (migrations might handle this better, but good for safety)
  floorplan.rooms = floorplan.rooms || [];
  floorplan.walls = floorplan.walls || [];
  floorplan.doors = floorplan.doors || [];
  floorplan.windows = floorplan.windows || [];
  floorplan.connections = floorplan.connections || [];

  return floorplan;
};
