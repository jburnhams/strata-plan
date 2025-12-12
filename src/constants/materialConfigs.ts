import { FloorMaterial, FloorMaterialConfig, WallMaterial, WallMaterialConfig, CeilingMaterial, CeilingMaterialConfig } from '@/types/materials';

export const FLOOR_MATERIALS: Record<FloorMaterial, FloorMaterialConfig> = {
  'hardwood': {
    id: 'hardwood',
    name: 'Hardwood Oak',
    category: 'wood',
    defaultColor: '#8B5A2B',
    roughness: 0.6,
    reflectivity: 0.2
  },
  'laminate': {
    id: 'laminate',
    name: 'Laminate Wood',
    category: 'wood',
    defaultColor: '#A07050',
    roughness: 0.5,
    reflectivity: 0.3
  },
  'tile-ceramic': {
    id: 'tile-ceramic',
    name: 'Ceramic Tile',
    category: 'tile',
    defaultColor: '#E6E6E6',
    roughness: 0.3,
    reflectivity: 0.4
  },
  'tile-porcelain': {
    id: 'tile-porcelain',
    name: 'Porcelain Tile',
    category: 'tile',
    defaultColor: '#F0F0F0',
    roughness: 0.2,
    reflectivity: 0.5
  },
  'carpet': {
    id: 'carpet',
    name: 'Beige Carpet',
    category: 'carpet',
    defaultColor: '#D3C0A3',
    roughness: 0.9,
    reflectivity: 0.05
  },
  'concrete': {
    id: 'concrete',
    name: 'Polished Concrete',
    category: 'other',
    defaultColor: '#999999',
    roughness: 0.4,
    reflectivity: 0.3
  },
  'stone-marble': {
    id: 'stone-marble',
    name: 'Marble Stone',
    category: 'stone',
    defaultColor: '#F5F5F5',
    roughness: 0.1,
    reflectivity: 0.7
  },
  'stone-slate': {
    id: 'stone-slate',
    name: 'Slate Stone',
    category: 'stone',
    defaultColor: '#505050',
    roughness: 0.7,
    reflectivity: 0.1
  },
  'vinyl': {
    id: 'vinyl',
    name: 'Vinyl Sheet',
    category: 'other',
    defaultColor: '#C0C0C0',
    roughness: 0.5,
    reflectivity: 0.2
  },
  'bamboo': {
    id: 'bamboo',
    name: 'Bamboo Flooring',
    category: 'wood',
    defaultColor: '#D2B48C',
    roughness: 0.5,
    reflectivity: 0.3
  }
};

export const WALL_MATERIALS: Record<WallMaterial, WallMaterialConfig> = {
  'drywall-white': {
    id: 'drywall-white',
    name: 'White Drywall',
    defaultColor: '#FFFFFF',
    roughness: 0.8
  },
  'drywall-painted': {
    id: 'drywall-painted',
    name: 'Painted Drywall',
    defaultColor: '#F0F0F0',
    roughness: 0.7
  },
  'brick-red': {
    id: 'brick-red',
    name: 'Red Brick',
    defaultColor: '#8B4513',
    roughness: 0.9
  },
  'brick-white': {
    id: 'brick-white',
    name: 'White Brick',
    defaultColor: '#F5F5F5',
    roughness: 0.9
  },
  'concrete': {
    id: 'concrete',
    name: 'Exposed Concrete',
    defaultColor: '#A0A0A0',
    roughness: 0.8
  },
  'wood-panel': {
    id: 'wood-panel',
    name: 'Wood Paneling',
    defaultColor: '#8B5A2B',
    roughness: 0.6
  },
  'wallpaper': {
    id: 'wallpaper',
    name: 'Patterned Wallpaper',
    defaultColor: '#FDF5E6',
    roughness: 0.7
  },
  'stone': {
    id: 'stone',
    name: 'Stone Cladding',
    defaultColor: '#808080',
    roughness: 0.9
  }
};

export const CEILING_MATERIALS: Record<CeilingMaterial, CeilingMaterialConfig> = {
  'drywall': {
    id: 'drywall',
    name: 'White Drywall',
    defaultColor: '#FFFFFF'
  },
  'acoustic-tile': {
    id: 'acoustic-tile',
    name: 'Acoustic Tile',
    defaultColor: '#F5F5F5'
  },
  'wood-beam': {
    id: 'wood-beam',
    name: 'Wood Beams',
    defaultColor: '#8B5A2B'
  },
  'exposed-concrete': {
    id: 'exposed-concrete',
    name: 'Exposed Concrete',
    defaultColor: '#999999'
  }
};
