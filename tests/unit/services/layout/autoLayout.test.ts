import { calculateAutoLayout, GAP } from '../../../../src/services/layout/autoLayout';
import { Room } from '../../../../src/types';

describe('calculateAutoLayout', () => {
  const createMockRoom = (id: string, length: number): Room => ({
    id,
    name: `Room ${id}`,
    length,
    width: 4,
    height: 3,
    type: 'bedroom',
    position: { x: 0, z: 0 },
    rotation: 0,
    doors: [],
    windows: []
  });

  it('positions single room at origin', () => {
    const rooms = [createMockRoom('1', 5)];
    const positions = calculateAutoLayout(rooms);

    expect(positions.get('1')).toEqual({ x: 0, z: 0 });
  });

  it('positions multiple rooms with gap', () => {
    const rooms = [
        createMockRoom('1', 5),
        createMockRoom('2', 4),
        createMockRoom('3', 6)
    ];
    const positions = calculateAutoLayout(rooms);

    expect(positions.get('1')).toEqual({ x: 0, z: 0 });
    // Room 1 ends at 5. Gap is 1. Room 2 starts at 6.
    expect(positions.get('2')).toEqual({ x: 5 + GAP, z: 0 });
    // Room 2 starts at 6, length 4. Ends at 10. Gap 1. Room 3 starts at 11.
    expect(positions.get('3')).toEqual({ x: 6 + 4 + GAP, z: 0 });
  });

  it('handles empty array', () => {
      const positions = calculateAutoLayout([]);
      expect(positions.size).toBe(0);
  });
});
