/**
 * Barrel export for all TypeScript types
 */

// Geometry types
export type { Position2D, BoundingBox, WallSegment, WallSide } from './geometry';

// Material types
export type { FloorMaterial, WallMaterial, WindowMaterial } from './materials';

// Room types
export type {
  Room,
  Wall,
  Door,
  Window,
  RoomType,
  DoorType,
  DoorSwing,
  HandleSide,
  WindowFrameType,
} from './room';

// Floorplan types
export type {
  Floorplan,
  FloorplanMetadata,
  RoomConnection,
  MeasurementUnit,
  EditorMode,
} from './floorplan';

// UI types
export type { SortDirection, SortColumn } from './ui';
