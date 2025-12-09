/**
 * Geometric types for 2D positioning and spatial calculations
 */

/**
 * 2D position in world space (X-Z plane, Y is height)
 */
export interface Position2D {
  x: number;
  z: number;
}

/**
 * Axis-aligned bounding box for collision detection
 */
export interface BoundingBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

/**
 * Wall segment with start and end positions
 */
export interface WallSegment {
  id: string;
  from: Position2D;
  to: Position2D;
  wallSide: WallSide;
}

/**
 * Cardinal directions for wall sides
 */
export type WallSide = 'north' | 'south' | 'east' | 'west';
