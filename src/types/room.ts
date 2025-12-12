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

/**
 * Door types and swing behavior
 */
export type DoorType = 'single' | 'double' | 'sliding' | 'pocket' | 'bifold';
export type DoorSwing = 'inward' | 'outward';
export type HandleSide = 'left' | 'right';

/**
 * Door entity with placement and configuration
 */
export interface Door {
  id: string;
  connectionId?: string; // Link to RoomConnection if between rooms
  roomId: string;
  wallSide: WallSide;
  position: number; // 0.0-1.0 along wall
  width: number; // Default 0.9m
  height: number; // Default 2.1m
  type: DoorType;
  swing: DoorSwing;
  handleSide: HandleSide;
}

/**
 * Window frame types
 */
export type WindowFrameType = 'single' | 'double' | 'triple';

/**
 * Window entity with placement and configuration
 */
export interface Window {
  id: string;
  roomId: string;
  wallSide: WallSide;
  position: number; // 0.0-1.0 along wall
  width: number; // Default 1.2m
  height: number; // Default 1.2m
  sillHeight: number; // Default 0.9m from floor
  frameType: WindowFrameType;
  material?: WindowMaterial;
}
