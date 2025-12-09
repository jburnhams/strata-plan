/**
 * Room-specific geometry calculations
 */

import type { Room, Position2D, BoundingBox, WallSegment, WallSide } from '../../types';

/**
 * Calculate room area (length × width)
 */
export function calculateArea(length: number, width: number): number {
  return length * width;
}

/**
 * Calculate room volume (length × width × height)
 */
export function calculateVolume(length: number, width: number, height: number): number {
  return length * width * height;
}

/**
 * Calculate room perimeter (2 × (length + width))
 */
export function calculatePerimeter(length: number, width: number): number {
  return 2 * (length + width);
}

/**
 * Get the center point of a room
 */
export function getRoomCenter(room: Room): Position2D {
  const halfLength = room.length / 2;
  const halfWidth = room.width / 2;

  // Account for rotation
  switch (room.rotation) {
    case 0:
      return {
        x: room.position.x + halfLength,
        z: room.position.z + halfWidth,
      };
    case 90:
      return {
        x: room.position.x + halfWidth,
        z: room.position.z + halfLength,
      };
    case 180:
      return {
        x: room.position.x + halfLength,
        z: room.position.z + halfWidth,
      };
    case 270:
      return {
        x: room.position.x + halfWidth,
        z: room.position.z + halfLength,
      };
    default:
      return {
        x: room.position.x + halfLength,
        z: room.position.z + halfWidth,
      };
  }
}

/**
 * Get the bounding box of a room (accounts for rotation)
 */
export function getRoomBounds(room: Room): BoundingBox {
  const { position, length, width, rotation } = room;

  // For 0° and 180°, dimensions stay the same
  // For 90° and 270°, length and width swap
  const effectiveLength = rotation === 90 || rotation === 270 ? width : length;
  const effectiveWidth = rotation === 90 || rotation === 270 ? length : width;

  return {
    minX: position.x,
    maxX: position.x + effectiveLength,
    minZ: position.z,
    maxZ: position.z + effectiveWidth,
  };
}

/**
 * Get the four corners of a room in clockwise order starting from top-left
 */
export function getRoomCorners(room: Room): Position2D[] {
  const bounds = getRoomBounds(room);

  return [
    { x: bounds.minX, z: bounds.minZ }, // Top-left
    { x: bounds.maxX, z: bounds.minZ }, // Top-right
    { x: bounds.maxX, z: bounds.maxZ }, // Bottom-right
    { x: bounds.minX, z: bounds.maxZ }, // Bottom-left
  ];
}

/**
 * Get the wall segments of a room with their sides
 */
export function getRoomWallSegments(room: Room): WallSegment[] {
  const corners = getRoomCorners(room);

  return [
    {
      id: `${room.id}-north`,
      from: corners[0],
      to: corners[1],
      wallSide: 'north' as WallSide,
    },
    {
      id: `${room.id}-east`,
      from: corners[1],
      to: corners[2],
      wallSide: 'east' as WallSide,
    },
    {
      id: `${room.id}-south`,
      from: corners[2],
      to: corners[3],
      wallSide: 'south' as WallSide,
    },
    {
      id: `${room.id}-west`,
      from: corners[3],
      to: corners[0],
      wallSide: 'west' as WallSide,
    },
  ];
}

/**
 * Check if two rooms overlap (not just touch)
 */
export function doRoomsOverlap(room1: Room, room2: Room): boolean {
  const bounds1 = getRoomBounds(room1);
  const bounds2 = getRoomBounds(room2);

  // AABB collision detection
  // Rooms overlap if they intersect in both axes
  const overlapX = bounds1.minX < bounds2.maxX && bounds1.maxX > bounds2.minX;
  const overlapZ = bounds1.minZ < bounds2.maxZ && bounds1.maxZ > bounds2.minZ;

  return overlapX && overlapZ;
}

/**
 * Get the length of a specific wall side
 */
export function getWallLength(room: Room, side: WallSide): number {
  const { length, width, rotation } = room;

  // For north/south walls
  if (side === 'north' || side === 'south') {
    return rotation === 90 || rotation === 270 ? width : length;
  }

  // For east/west walls
  return rotation === 90 || rotation === 270 ? length : width;
}

/**
 * Convert world coordinates to room-local coordinates
 */
export function worldToLocal(point: Position2D, room: Room): Position2D {
  const local = {
    x: point.x - room.position.x,
    z: point.z - room.position.z,
  };

  // Apply inverse rotation
  switch (room.rotation) {
    case 90:
      return { x: local.z, z: room.length - local.x };
    case 180:
      return { x: room.length - local.x, z: room.width - local.z };
    case 270:
      return { x: room.width - local.z, z: local.x };
    default:
      return local;
  }
}

/**
 * Convert room-local coordinates to world coordinates
 */
export function localToWorld(point: Position2D, room: Room): Position2D {
  let local = { ...point };

  // Apply rotation
  switch (room.rotation) {
    case 90:
      local = { x: room.width - point.z, z: point.x };
      break;
    case 180:
      local = { x: room.length - point.x, z: room.width - point.z };
      break;
    case 270:
      local = { x: point.z, z: room.length - point.x };
      break;
  }

  return {
    x: room.position.x + local.x,
    z: room.position.z + local.z,
  };
}
