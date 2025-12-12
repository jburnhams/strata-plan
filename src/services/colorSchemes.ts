import { FloorMaterial, WallMaterial } from '@/types/materials';
import { RoomType } from '@/types/room';

export interface ColorScheme {
  id: string;
  name: string;
  roomTypeColors: Partial<Record<RoomType, string>>;
  defaultFloorMaterial: FloorMaterial;
  defaultWallMaterial: WallMaterial;
}

export const COLOR_SCHEMES: ColorScheme[] = [
  {
    id: 'modern',
    name: 'Modern',
    roomTypeColors: {
      living: '#FFFFFF',
      kitchen: '#F5F5F5',
      bedroom: '#E0E0E0',
      bathroom: '#F0F0F0',
    },
    defaultFloorMaterial: 'hardwood',
    defaultWallMaterial: 'drywall-white',
  },
  {
    id: 'classic',
    name: 'Classic',
    roomTypeColors: {
      living: '#F5E6D3',
      kitchen: '#FFF8E7',
      bedroom: '#F0EAD6',
      bathroom: '#FFFFFF',
    },
    defaultFloorMaterial: 'hardwood',
    defaultWallMaterial: 'drywall-painted',
  },
  {
    id: 'warm',
    name: 'Warm',
    roomTypeColors: {
      living: '#FFEBCD',
      kitchen: '#FFFACD',
      bedroom: '#FFEFD5',
      bathroom: '#FFF5EE',
    },
    defaultFloorMaterial: 'laminate',
    defaultWallMaterial: 'wallpaper',
  },
  {
    id: 'cool',
    name: 'Cool',
    roomTypeColors: {
      living: '#E0FFFF',
      kitchen: '#F0FFFF',
      bedroom: '#E6E6FA',
      bathroom: '#F0F8FF',
    },
    defaultFloorMaterial: 'tile-porcelain',
    defaultWallMaterial: 'drywall-painted',
  },
  {
    id: 'neutral',
    name: 'Neutral',
    roomTypeColors: {
      living: '#D3D3D3',
      kitchen: '#DCDCDC',
      bedroom: '#C0C0C0',
      bathroom: '#F5F5F5',
    },
    defaultFloorMaterial: 'concrete',
    defaultWallMaterial: 'concrete',
  },
];

export function getColorScheme(id: string): ColorScheme | undefined {
  return COLOR_SCHEMES.find(s => s.id === id);
}
