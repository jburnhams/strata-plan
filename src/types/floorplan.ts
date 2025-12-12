/**
 * Floorplan and project-level types
 */

import { Room, Wall } from './room';
import { Door } from './door';
import { Window } from './window';
import { WallSide } from './geometry';

/**
 * Measurement unit system
 */
export type MeasurementUnit = 'meters' | 'feet';

/**
 * Editor mode for UI state
 */
export type EditorMode = 'table' | 'canvas' | 'view3d';

/**
 * Connection between two adjacent rooms
 */
export interface RoomConnection {
  id: string;
  room1Id: string;
  room2Id: string;
  room1Wall?: WallSide; // Optional for manual connections
  room2Wall?: WallSide; // Optional for manual connections
  sharedWallLength?: number; // Optional for manual connections
  sharedWall?: 'manual'; // Specific field for manual connections, although we can check isManual
  overlapStart?: number;
  overlapEnd?: number;
  doors: string[]; // Door IDs
  isManual?: boolean;
}

/**
 * Complete floorplan with all entities and metadata
 */
export interface Floorplan {
  id: string;
  name: string;
  units: MeasurementUnit;
  rooms: Room[];
  walls: Wall[]; // For canvas mode
  doors: Door[];
  windows: Window[];
  connections: RoomConnection[];
  createdAt: Date;
  updatedAt: Date;
  version: string; // Schema version for migrations
}

/**
 * Lightweight metadata for project list
 */
export interface FloorplanMetadata {
  id: string;
  name: string;
  roomCount: number;
  totalArea: number;
  updatedAt: Date;
  thumbnailDataUrl?: string;
}
