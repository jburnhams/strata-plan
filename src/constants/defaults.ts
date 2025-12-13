/**
 * Default values for rooms, doors, windows, and layout
 */

import { RoomType } from '../types/room';
import {
  CeilingMaterial,
  FloorMaterial,
  WallMaterial,
} from '../types/materials';

// Room defaults
export const DEFAULT_CEILING_HEIGHT = 2.7; // meters
export const DEFAULT_WALL_THICKNESS = 0.2; // meters
export const DEFAULT_ROOM_GAP = 1.0; // meters (for auto-layout)

// Door defaults
export const DEFAULT_DOOR_WIDTH = 0.9; // meters
export const DEFAULT_DOOR_HEIGHT = 2.1; // meters

// Window defaults
export const DEFAULT_WINDOW_WIDTH = 1.2; // meters
export const DEFAULT_WINDOW_HEIGHT = 1.2; // meters
export const DEFAULT_WINDOW_SILL = 0.9; // meters (from floor)

// Grid and zoom defaults
export const DEFAULT_GRID_SIZE = 0.5; // meters
export const DEFAULT_ZOOM_LEVEL = 1.0;
export const ZOOM_INCREMENT = 1.25;
export const PIXELS_PER_METER = 50; // pixels

// Room Type Defaults
export const ROOM_TYPE_DEFAULTS: Record<RoomType, {
  name: string;
  width: number;
  length: number;
}> = {
  bedroom: { name: 'Bedroom', width: 3.5, length: 4.0 },
  kitchen: { name: 'Kitchen', width: 3.0, length: 4.0 },
  bathroom: { name: 'Bathroom', width: 2.0, length: 2.5 },
  living: { name: 'Living Room', width: 4.5, length: 5.0 },
  dining: { name: 'Dining Room', width: 3.5, length: 4.0 },
  office: { name: 'Office', width: 3.0, length: 3.5 },
  hallway: { name: 'Hallway', width: 1.2, length: 4.0 },
  closet: { name: 'Closet', width: 1.5, length: 1.0 },
  garage: { name: 'Garage', width: 6.0, length: 6.0 },
  generic: { name: 'Room', width: 4.0, length: 4.0 },
  other: { name: 'Room', width: 3.0, length: 3.0 },
};

export const ROOM_TYPE_MATERIALS: Record<RoomType, {
  floor: FloorMaterial;
  wall: WallMaterial;
  ceiling: CeilingMaterial;
}> = {
  bedroom: { floor: 'hardwood', wall: 'drywall-painted', ceiling: 'drywall' },
  kitchen: { floor: 'tile-ceramic', wall: 'drywall-painted', ceiling: 'drywall' },
  bathroom: { floor: 'tile-porcelain', wall: 'drywall-painted', ceiling: 'drywall' },
  living: { floor: 'hardwood', wall: 'drywall-painted', ceiling: 'drywall' },
  dining: { floor: 'hardwood', wall: 'drywall-painted', ceiling: 'drywall' },
  office: { floor: 'laminate', wall: 'drywall-painted', ceiling: 'acoustic-tile' },
  hallway: { floor: 'hardwood', wall: 'drywall-painted', ceiling: 'drywall' },
  closet: { floor: 'carpet', wall: 'drywall-painted', ceiling: 'drywall' },
  garage: { floor: 'concrete', wall: 'drywall-white', ceiling: 'exposed-concrete' },
  generic: { floor: 'carpet', wall: 'drywall-painted', ceiling: 'drywall' },
  other: { floor: 'carpet', wall: 'drywall-painted', ceiling: 'drywall' },
};
