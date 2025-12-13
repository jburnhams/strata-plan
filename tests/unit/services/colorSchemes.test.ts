import { COLOR_SCHEMES, getColorScheme } from '@/services/colorSchemes';
import { ROOM_TYPE_COLORS } from '@/constants/colors';

describe('colorSchemes service', () => {
  it('exports standard color schemes', () => {
    expect(COLOR_SCHEMES.length).toBeGreaterThan(0);
    expect(COLOR_SCHEMES.some(s => s.id === 'standard')).toBe(true);
    expect(COLOR_SCHEMES.some(s => s.id === 'modern')).toBe(true);
    expect(COLOR_SCHEMES.some(s => s.id === 'warm')).toBe(true);
  });

  it('retrieves schemes by id', () => {
    const scheme = getColorScheme('modern');
    expect(scheme).toBeDefined();
    expect(scheme?.id).toBe('modern');
  });

  it('returns undefined for invalid id', () => {
    const scheme = getColorScheme('invalid-id');
    expect(scheme).toBeUndefined();
  });

  it('standard scheme uses default colors', () => {
    const standard = getColorScheme('standard');
    expect(standard?.roomTypeColors).toEqual(ROOM_TYPE_COLORS);
  });
});
