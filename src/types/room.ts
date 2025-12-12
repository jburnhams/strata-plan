/**
 * Room-related types including doors, windows, and walls
 */

import { Position2D } from './geometry';
import { FloorMaterial, WallMaterial } from './materials';

/**
 * Room type categories for default styling and layout
 */
export type RoomType =
  | 'bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'living'
  | 'dining'
  | 'office'
  | 'hallway'
  | 'closet'
  | 'garage'
  | 'other';

/**
 * Room entity with dimensions, position, and properties
 */
export interface Room {
  id: string;
  name: string;
  length: number; // X dimension (meters or feet)
  width: number; // Z dimension (meters or feet)
  height: number; // Ceiling height (meters or feet)
  type: RoomType;
  position: Position2D; // Top-left corner in world space
  rotation: 0 | 90 | 180 | 270; // Rotation in degrees
  color?: string; // Hex color override
  material?: FloorMaterial;
  wallMaterial?: WallMaterial;
}

/**
 * Wall entity for canvas drawing mode
 */
export interface Wall {
  id: string;
  from: Position2D;
  to: Position2D;
  thickness: number; // Default 0.2m
  material?: WallMaterial;
}

