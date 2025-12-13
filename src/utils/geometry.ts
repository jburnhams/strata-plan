import { Position2D, Room } from '../types';

/**
 * Calculates the Euclidean distance between two points
 */
export const calculateDistance = (p1: Position2D, p2: Position2D): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.z - p1.z, 2));
};

/**
 * Calculates the angle between two points in degrees (0-360)
 * 0 is right (positive X), 90 is down (positive Z)
 */
export const calculateAngle = (p1: Position2D, p2: Position2D): number => {
  const dx = p2.x - p1.x;
  const dz = p2.z - p1.z;
  let angle = Math.atan2(dz, dx) * (180 / Math.PI);
  if (angle < 0) {
    angle += 360;
  }
  return angle;
};

export interface Rect {
  x: number;
  z: number;
  width: number;
  height: number;
}

/**
 * Calculates the axis-aligned bounding box of a room
 * Handles 90-degree rotations
 */
export const getRoomRect = (room: Room): Rect => {
  // Center of the room
  const cx = room.position.x + room.length / 2;
  const cz = room.position.z + room.width / 2;

  // Effective dimensions based on rotation
  // We assume 90-degree increments for AABB calculation for now
  const isRotated = Math.round(room.rotation) % 180 !== 0;

  const width = isRotated ? room.width : room.length;
  const height = isRotated ? room.length : room.width;

  return {
    x: cx - width / 2,
    z: cz - height / 2,
    width,
    height
  };
};

/**
 * Calculates the gap between two rectangles
 * Returns { x, z } gaps, or null if they overlap in both dimensions
 */
export const calculateRectGap = (r1: Rect, r2: Rect): { x: number, z: number } | null => {
   // Check overlaps
   const overlapX = r1.x < r2.x + r2.width && r1.x + r1.width > r2.x;
   const overlapZ = r1.z < r2.z + r2.height && r1.z + r1.height > r2.z;

   if (overlapX && overlapZ) return null; // Intersecting

   let gapX = 0;
   if (r1.x + r1.width < r2.x) {
       // r1 is left of r2
       gapX = r2.x - (r1.x + r1.width);
   } else if (r2.x + r2.width < r1.x) {
       // r2 is left of r1
       gapX = r1.x - (r2.x + r2.width);
   }
   // else overlapping in X, so gapX is 0

   let gapZ = 0;
   if (r1.z + r1.height < r2.z) {
       // r1 is above r2 (smaller Z)
       gapZ = r2.z - (r1.z + r1.height);
   } else if (r2.z + r2.height < r1.z) {
       // r2 is above r1
       gapZ = r1.z - (r2.z + r2.height);
   }

   return { x: gapX, z: gapZ };
};

/**
 * Projects a point onto a line segment
 */
export const projectPointOnLine = (point: Position2D, start: Position2D, end: Position2D): { point: Position2D, t: number, dist: number } => {
  const l2 = Math.pow(end.x - start.x, 2) + Math.pow(end.z - start.z, 2);
  if (l2 === 0) return { point: start, t: 0, dist: calculateDistance(point, start) };

  let t = ((point.x - start.x) * (end.x - start.x) + (point.z - start.z) * (end.z - start.z)) / l2;
  t = Math.max(0, Math.min(1, t));

  const projection = {
      x: start.x + t * (end.x - start.x),
      z: start.z + t * (end.z - start.z)
  };

  return {
      point: projection,
      t,
      dist: calculateDistance(point, projection)
  };
};
