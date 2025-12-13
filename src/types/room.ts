/**
 * Room-related types including doors, windows, and walls
 */

import { Position2D, WallSide } from './geometry';
import {
  CeilingMaterial,
  FloorMaterial,
  WallMaterial,
  WindowMaterial,
} from './materials';

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
  | 'generic'
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
  vertices?: Position2D[]; // Optional vertices for non-rectangular rooms
  color?: string; // Hex color override
  floorMaterial?: FloorMaterial;
  wallMaterial?: WallMaterial;
  ceilingMaterial?: CeilingMaterial;
  customFloorColor?: string;
  customWallColor?: string;
  customCeilingColor?: string;
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

