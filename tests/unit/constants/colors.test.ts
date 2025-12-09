import {
  ROOM_TYPE_COLORS,
  ROOM_TYPE_COLORS_COLORBLIND,
  WALL_COLORS,
  FLOOR_COLORS,
} from '@/constants/colors';
import { describe, it, expect } from '@jest/globals';

describe('Colors Constants', () => {
  it('should have colors for all room types', () => {
    const roomTypes = [
      'bedroom',
      'kitchen',
      'bathroom',
      'living',
      'dining',
      'office',
      'hallway',
      'closet',
      'garage',
      'other',
    ];

    roomTypes.forEach((type) => {
      // @ts-ignore
      expect(ROOM_TYPE_COLORS[type]).toBeDefined();
      expect(ROOM_TYPE_COLORS[type]).toMatch(/^#[0-9A-Fa-f]{6}$/);

      // @ts-ignore
      expect(ROOM_TYPE_COLORS_COLORBLIND[type]).toBeDefined();
      expect(ROOM_TYPE_COLORS_COLORBLIND[type]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it('should have wall colors', () => {
    expect(WALL_COLORS.drywall).toBeDefined();
    expect(WALL_COLORS.brick).toBeDefined();
    expect(WALL_COLORS.wood).toBeDefined();
  });

  it('should have floor colors', () => {
    expect(FLOOR_COLORS.wood).toBeDefined();
    expect(FLOOR_COLORS.tile).toBeDefined();
  });
});
