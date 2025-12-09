/**
 * Barrel export for geometry utilities
 */

export { generateUUID } from './uuid';

export {
  calculateArea,
  calculateVolume,
  calculatePerimeter,
  getRoomCenter,
  getRoomBounds,
  getRoomCorners,
  getRoomWallSegments,
  doRoomsOverlap,
  getWallLength,
  worldToLocal,
  localToWorld,
} from './room';

export { snapToGrid, clamp, distance, lerp } from './bounds';
