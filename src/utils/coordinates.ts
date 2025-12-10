import { Position2D } from '../types';
import { PIXELS_PER_METER } from '../constants/defaults';

export interface ViewportTransform {
  zoom: number;
  pan: Position2D;
  width: number;
  height: number;
}

/**
 * Converts world coordinates (meters) to screen coordinates (pixels).
 * Origin (0,0) is at the center of the viewport + pan offset.
 */
export function worldToScreen(
  worldPos: Position2D,
  transform: ViewportTransform
): { x: number; y: number } {
  const { zoom, pan, width, height } = transform;

  // Calculate screen position
  // 1. Scale world coordinates (z maps to y)
  // 2. Add pan offset
  // 3. Center in viewport
  const x = (worldPos.x * PIXELS_PER_METER * zoom) + pan.x + (width / 2);
  const y = (worldPos.z * PIXELS_PER_METER * zoom) + pan.z + (height / 2);

  return { x, y };
}

/**
 * Converts screen coordinates (pixels) to world coordinates (meters).
 * Inverse of worldToScreen.
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  transform: ViewportTransform
): Position2D {
  const { zoom, pan, width, height } = transform;

  // Inverse calculation
  // 1. Subtract center offset
  // 2. Subtract pan offset
  // 3. Divide by scale
  const x = (screenX - pan.x - (width / 2)) / (PIXELS_PER_METER * zoom);
  const z = (screenY - pan.z - (height / 2)) / (PIXELS_PER_METER * zoom);

  return { x, z };
}
