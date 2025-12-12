import { WallSide } from './geometry';
import { WindowMaterial } from './materials';

export type WindowFrameType = 'single' | 'double' | 'triple';
export type WindowOpeningType = 'fixed' | 'casement' | 'sliding' | 'awning' | 'hopper';

export interface Window {
  id: string;
  roomId: string;
  wallSide: WallSide;
  position: number; // 0.0-1.0 along wall
  width: number; // Default 1.2m
  height: number; // Default 1.2m
  sillHeight: number; // Height from floor, default 0.9m
  frameType: WindowFrameType;
  material: WindowMaterial;
  openingType: WindowOpeningType;
}

export const WINDOW_DEFAULTS = {
  width: 1.2,
  height: 1.2,
  sillHeight: 0.9,
  frameType: 'double' as WindowFrameType,
  material: 'pvc' as WindowMaterial,
  openingType: 'casement' as WindowOpeningType,
};

export const validateWindow = (
  window: Partial<Window> & {
    width: number;
    height: number;
    sillHeight: number;
  },
  ceilingHeight?: number
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Width validation
  if (window.width < 0.3 || window.width > 3.0) {
    errors.push('Window width must be between 0.3m and 3.0m');
  }

  // Height validation
  if (window.height < 0.3 || window.height > 2.5) {
    errors.push('Window height must be between 0.3m and 2.5m');
  }

  // Sill height validation
  if (window.sillHeight < 0 || window.sillHeight > 1.5) {
    errors.push('Window sill height must be between 0m and 1.5m');
  }

  // Ceiling check
  if (ceilingHeight !== undefined) {
    if (window.sillHeight + window.height > ceilingHeight) {
      errors.push('Window exceeds ceiling height');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
