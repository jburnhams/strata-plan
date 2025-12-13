import { FloorMaterial, WallMaterial } from '../types/materials';
import { RoomType } from '../types/room';
import { ROOM_TYPE_COLORS, ROOM_TYPE_COLORS_COLORBLIND } from '../constants/colors';

export interface ColorScheme {
  id: string;
  name: string;
  roomTypeColors: Record<RoomType, string>;
  defaultFloorMaterial: FloorMaterial;
  defaultWallMaterial: WallMaterial;
  description?: string;
}

export const COLOR_SCHEMES: ColorScheme[] = [
  {
    id: 'standard',
    name: 'Standard',
    description: 'Default color palette',
    roomTypeColors: ROOM_TYPE_COLORS,
    defaultFloorMaterial: 'hardwood',
    defaultWallMaterial: 'drywall-painted',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Cool tones and sleek materials',
    roomTypeColors: {
      bedroom: '#a1c4e8',
      kitchen: '#e0e0e0',
      bathroom: '#b0d0d0',
      living: '#d0d0d0',
      dining: '#c0c0d0',
      office: '#b0c0c0',
      hallway: '#d0d0d0',
      closet: '#d0d0e0',
      garage: '#a0a0a0',
      generic: '#c0c0c0',
      other: '#c0c0c0',
    },
    defaultFloorMaterial: 'concrete',
    defaultWallMaterial: 'drywall-white',
  },
  {
    id: 'warm',
    name: 'Warm',
    description: 'Cozy warm colors and wood finishes',
    roomTypeColors: {
        bedroom: '#f0d0b0',
        kitchen: '#f8e0c0',
        bathroom: '#e8d8c0',
        living: '#f0e0c0',
        dining: '#e0c0a0',
        office: '#e8d0b0',
        hallway: '#e8e0d0',
        closet: '#f0e0d0',
        garage: '#d0c0b0',
        generic: '#e8d8c0',
        other: '#e8d8c0'
    },
    defaultFloorMaterial: 'hardwood',
    defaultWallMaterial: 'wood-panel',
  },
  {
    id: 'colorblind',
    name: 'Accessible',
    description: 'High contrast for color vision deficiency',
    roomTypeColors: ROOM_TYPE_COLORS_COLORBLIND,
    defaultFloorMaterial: 'laminate',
    defaultWallMaterial: 'drywall-white',
  }
];

export const getColorScheme = (id: string): ColorScheme | undefined => {
    return COLOR_SCHEMES.find(s => s.id === id);
};
