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
  RoomType,
} from './room';

// Door types
export type {
  Door,
  DoorType,
  DoorSwing,
  HandleSide,
} from './door';

// Window types
export type {
  Window,
  WindowFrameType,
  WindowOpeningType,
} from './window';

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
