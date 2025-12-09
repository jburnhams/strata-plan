/**
 * Color palettes for room types and UI theming
 */

import type { RoomType } from '../types';

/**
 * Default colors for each room type
 */
export const ROOM_TYPE_COLORS: Record<RoomType, string> = {
  bedroom: '#93c5fd', // Light blue
  kitchen: '#fed7aa', // Light orange
  bathroom: '#a5f3fc', // Light cyan
  living: '#fef3c7', // Light yellow
  dining: '#ddd6fe', // Light purple
  office: '#bbf7d0', // Light green
  hallway: '#e5e7eb', // Light gray
  closet: '#f5d0fe', // Light pink
  garage: '#d1d5db', // Gray
  other: '#f3f4f6', // Very light gray
};

/**
 * Color-blind friendly palette (deuteranopia/protanopia safe)
 * Uses distinct hues and brightness levels
 */
export const ROOM_TYPE_COLORS_COLORBLIND: Record<RoomType, string> = {
  bedroom: '#4E9AF1', // Bright blue
  kitchen: '#F49E4C', // Orange
  bathroom: '#16B3D9', // Cyan
  living: '#F5E663', // Yellow
  dining: '#AB81CD', // Purple
  office: '#87D68D', // Green
  hallway: '#9CA3AF', // Medium gray
  closet: '#E879F9', // Magenta
  garage: '#6B7280', // Dark gray
  other: '#D1D5DB', // Light gray
};

/**
 * Wall colors for different materials
 */
export const WALL_COLORS = {
  drywall: '#F5F5F5',
  brick: '#B85450',
  wood: '#8B6F47',
  concrete: '#A8A8A8',
  stone: '#808080',
};

/**
 * Floor colors for different materials
 */
export const FLOOR_COLORS = {
  wood: '#C19A6B',
  tile: '#E0E0E0',
  carpet: '#B0A090',
  concrete: '#A0A0A0',
  laminate: '#D2B48C',
  stone: '#787878',
};
