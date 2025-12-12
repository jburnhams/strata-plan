/**
 * Factory functions for creating rooms, doors, and windows
 */

import type { Room, Door, Window, RoomType, Position2D } from '../../types';
import { generateUUID } from '../geometry';
import {
  DEFAULT_CEILING_HEIGHT,
  DEFAULT_DOOR_WIDTH,
  DEFAULT_DOOR_HEIGHT,
  DEFAULT_WINDOW_WIDTH,
  DEFAULT_WINDOW_HEIGHT,
  DEFAULT_WINDOW_SILL,
} from '../../constants/defaults';

/**
 * Parameters for creating a new room
 */
export interface CreateRoomParams {
  name: string;
  length: number;
  width: number;
  type: RoomType;
  height?: number;
  position?: Position2D;
  rotation?: 0 | 90 | 180 | 270;
  color?: string;
}

/**
 * Create a new room with defaults applied
 */
export function createRoom(params: CreateRoomParams): Room {
  return {
    id: generateUUID(),
    name: params.name,
    length: params.length,
    width: params.width,
    height: params.height ?? DEFAULT_CEILING_HEIGHT,
    type: params.type,
    position: params.position ?? { x: 0, z: 0 },
    rotation: params.rotation ?? 0,
    color: params.color,
    floorMaterial: undefined,
    wallMaterial: undefined,
    ceilingMaterial: undefined,
  };
}

/**
 * Default dimensions for each room type (in meters)
 */
const DEFAULT_ROOM_DIMENSIONS: Record<RoomType, { length: number; width: number }> = {
  bedroom: { length: 4, width: 4 },
  kitchen: { length: 4, width: 3 },
  bathroom: { length: 2.5, width: 2 },
  living: { length: 5, width: 4 },
  dining: { length: 4, width: 3.5 },
  office: { length: 3.5, width: 3 },
  hallway: { length: 3, width: 1.5 },
  closet: { length: 2, width: 1.5 },
  garage: { length: 6, width: 3 },
  other: { length: 3, width: 3 },
};

/**
 * Create a room with default dimensions based on type
 */
export function createDefaultRoom(type: RoomType): Room {
  const dimensions = DEFAULT_ROOM_DIMENSIONS[type];
  const name = type.charAt(0).toUpperCase() + type.slice(1);

  return createRoom({
    name,
    length: dimensions.length,
    width: dimensions.width,
    type,
  });
}

/**
 * Clone a room with a new ID and optional position offset
 */
export function cloneRoom(room: Room, offset?: Position2D): Room {
  const cloned: Room = {
    ...room,
    id: generateUUID(),
    name: `${room.name} (copy)`,
    position: offset
      ? { x: room.position.x + offset.x, z: room.position.z + offset.z }
      : { ...room.position },
  };

  return cloned;
}

/**
 * Parameters for creating a new door
 */
export interface CreateDoorParams {
  roomId: string;
  wallSide: 'north' | 'south' | 'east' | 'west';
  position?: number;
  width?: number;
  height?: number;
  type?: 'single' | 'double' | 'sliding' | 'pocket' | 'bifold';
  swing?: 'inward' | 'outward';
  handleSide?: 'left' | 'right';
  connectionId?: string;
}

/**
 * Create a new door with defaults applied
 */
export function createDoor(params: CreateDoorParams): Door {
  return {
    id: generateUUID(),
    roomId: params.roomId,
    wallSide: params.wallSide,
    position: params.position ?? 0.5,
    width: params.width ?? DEFAULT_DOOR_WIDTH,
    height: params.height ?? DEFAULT_DOOR_HEIGHT,
    type: params.type ?? 'single',
    swing: params.swing ?? 'inward',
    handleSide: params.handleSide ?? 'right',
    connectionId: params.connectionId,
    isExterior: !params.connectionId,
  };
}

/**
 * Parameters for creating a new window
 */
export interface CreateWindowParams {
  roomId: string;
  wallSide: 'north' | 'south' | 'east' | 'west';
  position?: number;
  width?: number;
  height?: number;
  sillHeight?: number;
  frameType?: 'single' | 'double' | 'triple';
}

/**
 * Create a new window with defaults applied
 */
export function createWindow(params: CreateWindowParams): Window {
  return {
    id: generateUUID(),
    roomId: params.roomId,
    wallSide: params.wallSide,
    position: params.position ?? 0.5,
    width: params.width ?? DEFAULT_WINDOW_WIDTH,
    height: params.height ?? DEFAULT_WINDOW_HEIGHT,
    sillHeight: params.sillHeight ?? DEFAULT_WINDOW_SILL,
    frameType: params.frameType ?? 'double',
    material: 'pvc',
    openingType: 'casement',
  };
}
