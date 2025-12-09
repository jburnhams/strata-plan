/**
 * Validation limits and constraints
 */

// Room dimension limits
export const MIN_ROOM_DIMENSION = 0.1; // meters
export const MAX_ROOM_DIMENSION = 100; // meters

// Ceiling height limits
export const MIN_CEILING_HEIGHT = 1.5; // meters
export const MAX_CEILING_HEIGHT = 4.0; // meters

// Wall thickness limits
export const MIN_WALL_THICKNESS = 0.05; // meters
export const MAX_WALL_THICKNESS = 0.5; // meters

// Name length limits
export const MAX_ROOM_NAME_LENGTH = 100;
export const MAX_PROJECT_NAME_LENGTH = 100;

// Zoom limits
export const MIN_ZOOM_LEVEL = 0.25;
export const MAX_ZOOM_LEVEL = 4.0;

// Grid size options
export const GRID_SIZE_OPTIONS = [0.1, 0.5, 1.0] as const;

// Zoom level options
export const ZOOM_LEVEL_OPTIONS = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 4.0] as const;
