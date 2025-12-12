import {
  CeilingMaterial,
  CeilingMaterialConfig,
  FloorMaterial,
  FloorMaterialConfig,
  WallMaterial,
  WallMaterialConfig,
} from '../types/materials';

export const FLOOR_MATERIALS: Record<FloorMaterial, FloorMaterialConfig> = {
  hardwood: {
    id: 'hardwood',
    name: 'Hardwood Floor',
    category: 'wood',
    defaultColor: '#e0c090',
    roughness: 0.3,
    reflectivity: 0.1,
  },
  laminate: {
    id: 'laminate',
    name: 'Laminate',
    category: 'wood',
    defaultColor: '#d0b080',
    roughness: 0.4,
    reflectivity: 0.1,
  },
  'tile-ceramic': {
    id: 'tile-ceramic',
    name: 'Ceramic Tile',
    category: 'tile',
    defaultColor: '#f0f0f0',
    roughness: 0.2,
    reflectivity: 0.2,
  },
  'tile-porcelain': {
    id: 'tile-porcelain',
    name: 'Porcelain Tile',
    category: 'tile',
    defaultColor: '#e8e8e8',
    roughness: 0.1,
    reflectivity: 0.3,
  },
  carpet: {
    id: 'carpet',
    name: 'Carpet',
    category: 'carpet',
    defaultColor: '#d9d9d9',
    roughness: 0.9,
    reflectivity: 0,
  },
  concrete: {
    id: 'concrete',
    name: 'Polished Concrete',
    category: 'other',
    defaultColor: '#a0a0a0',
    roughness: 0.4,
    reflectivity: 0.1,
  },
  'stone-marble': {
    id: 'stone-marble',
    name: 'Marble',
    category: 'stone',
    defaultColor: '#fcfcfc',
    roughness: 0.1,
    reflectivity: 0.4,
  },
  'stone-slate': {
    id: 'stone-slate',
    name: 'Slate',
    category: 'stone',
    defaultColor: '#505050',
    roughness: 0.7,
    reflectivity: 0.05,
  },
  vinyl: {
    id: 'vinyl',
    name: 'Vinyl',
    category: 'other',
    defaultColor: '#c0c0c0',
    roughness: 0.5,
    reflectivity: 0.1,
  },
  bamboo: {
    id: 'bamboo',
    name: 'Bamboo',
    category: 'wood',
    defaultColor: '#e8d8b0',
    roughness: 0.3,
    reflectivity: 0.1,
  },
};

export const WALL_MATERIALS: Record<WallMaterial, WallMaterialConfig> = {
  'drywall-white': {
    id: 'drywall-white',
    name: 'White Drywall',
    defaultColor: '#ffffff',
    roughness: 0.8,
  },
  'drywall-painted': {
    id: 'drywall-painted',
    name: 'Painted Drywall',
    defaultColor: '#f0f0f0',
    roughness: 0.8,
  },
  'brick-red': {
    id: 'brick-red',
    name: 'Red Brick',
    defaultColor: '#b05040',
    roughness: 0.9,
  },
  'brick-white': {
    id: 'brick-white',
    name: 'White Brick',
    defaultColor: '#e0e0e0',
    roughness: 0.9,
  },
  concrete: {
    id: 'concrete',
    name: 'Exposed Concrete',
    defaultColor: '#909090',
    roughness: 0.7,
  },
  'wood-panel': {
    id: 'wood-panel',
    name: 'Wood Paneling',
    defaultColor: '#d0a070',
    roughness: 0.6,
  },
  wallpaper: {
    id: 'wallpaper',
    name: 'Wallpaper',
    defaultColor: '#e8e8e8',
    roughness: 0.8,
  },
  stone: {
    id: 'stone',
    name: 'Stone Facade',
    defaultColor: '#808080',
    roughness: 0.9,
  },
};

export const CEILING_MATERIALS: Record<CeilingMaterial, CeilingMaterialConfig> = {
  drywall: {
    id: 'drywall',
    name: 'Drywall',
    defaultColor: '#ffffff',
    roughness: 0.9,
  },
  'acoustic-tile': {
    id: 'acoustic-tile',
    name: 'Acoustic Tile',
    defaultColor: '#f4f4f4',
    roughness: 0.9,
  },
  'wood-beam': {
    id: 'wood-beam',
    name: 'Wood Beams',
    defaultColor: '#8b5a2b',
    roughness: 0.7,
  },
  'exposed-concrete': {
    id: 'exposed-concrete',
    name: 'Exposed Concrete',
    defaultColor: '#a0a0a0',
    roughness: 0.6,
  },
};
