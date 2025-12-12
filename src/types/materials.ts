/**
 * Material types for surfaces and structures
 */

/**
 * Floor material options
 */
export type FloorMaterial =
  | 'hardwood'
  | 'laminate'
  | 'tile-ceramic'
  | 'tile-porcelain'
  | 'carpet'
  | 'concrete'
  | 'stone-marble'
  | 'stone-slate'
  | 'vinyl'
  | 'bamboo';

export interface FloorMaterialConfig {
  id: FloorMaterial;
  name: string;
  category: 'wood' | 'tile' | 'carpet' | 'stone' | 'other';
  defaultColor: string;
  textureUrl?: string;
  roughness: number;
  reflectivity: number;
}

/**
 * Wall material options
 */
export type WallMaterial =
  | 'drywall-white'
  | 'drywall-painted'
  | 'brick-red'
  | 'brick-white'
  | 'concrete'
  | 'wood-panel'
  | 'wallpaper'
  | 'stone';

export interface WallMaterialConfig {
  id: WallMaterial;
  name: string;
  defaultColor: string;
  textureUrl?: string;
  roughness: number;
}

/**
 * Ceiling material options
 */
export type CeilingMaterial =
  | 'drywall'
  | 'acoustic-tile'
  | 'wood-beam'
  | 'exposed-concrete';

export interface CeilingMaterialConfig {
  id: CeilingMaterial;
  name: string;
  defaultColor: string;
  textureUrl?: string;
  roughness: number;
}

/**
 * Window frame material options
 */
export type WindowMaterial = 'wood' | 'aluminum' | 'pvc';
