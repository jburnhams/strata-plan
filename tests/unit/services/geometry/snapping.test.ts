import { getSnapGuides } from '../../../../src/services/geometry/snapping';
import { Room } from '../../../../src/types';

describe('snapping service', () => {
  const mockRoom = (id: string, x: number, z: number, length: number, width: number): Room => ({
    id,
    name: `Room ${id}`,
    type: 'living',
    position: { x, z },
    length,
    width,
    height: 2.4,
    rotation: 0,
    doors: [],
    windows: []
  } as Room);

  it('should return no guides when no rooms are close', () => {
    const moving = mockRoom('1', 0, 0, 5, 5);
    const other = mockRoom('2', 10, 10, 5, 5); // Far away
    const result = getSnapGuides(moving, [other], { x: 0, z: 0 }, 0.5);

    expect(result.guides).toHaveLength(0);
    expect(result.position).toEqual({ x: 0, z: 0 });
  });

  it('should snap to left edge alignment (vertical guide)', () => {
    // Make lengths different to avoid center/right alignment ambiguity
    const moving = mockRoom('1', 0.1, 0, 5, 4); // x=0.1, len=5. Center=2.6, Right=5.1
    const other = mockRoom('2', 0, 10, 4, 4);    // x=0, len=4.   Center=2.0, Right=4.0

    // Left-Left: 0.1 vs 0 -> diff 0.1 (Snap!)
    // Center-Center: 2.6 vs 2 -> diff 0.6
    // Right-Right: 5.1 vs 4 -> diff 1.1

    const result = getSnapGuides(moving, [other], { x: 0.1, z: 0 }, 0.2);

    expect(result.position.x).toBeCloseTo(0);
    expect(result.guides).toHaveLength(1);
    expect(result.guides[0].type).toBe('vertical');
    expect(result.guides[0].offset).toBe(0);
  });

  it('should snap to top edge alignment (horizontal guide)', () => {
    const moving = mockRoom('1', 0, 0.1, 4, 5);
    const other = mockRoom('2', 10, 0, 4, 4);

    const result = getSnapGuides(moving, [other], { x: 0, z: 0.1 }, 0.2);

    expect(result.position.z).toBeCloseTo(0);
    expect(result.guides).toHaveLength(1);
    expect(result.guides[0].type).toBe('horizontal');
    expect(result.guides[0].offset).toBe(0);
  });

  it('should snap to center alignment', () => {
    // Room 2 center at x=10 + 2 = 12.
    const other = mockRoom('2', 10, 10, 4, 4);

    // Room 1 length 6. Center at x + 3.
    // We want center to align with 12. So x + 3 = 12 => x = 9.
    // Start at x = 9.1
    const moving = mockRoom('1', 9.1, 0, 6, 4);

    // Check other alignments:
    // Left-Left: 9.1 vs 10 -> diff 0.9
    // Right-Right: 15.1 vs 14 -> diff 1.1
    // Center-Center: 12.1 vs 12 -> diff 0.1 (Snap!)

    const result = getSnapGuides(moving, [other], { x: 9.1, z: 0 }, 0.2);

    expect(result.position.x).toBeCloseTo(9);
    expect(result.guides).toHaveLength(1);
    expect(result.guides[0].offset).toBe(12); // The center line
  });

  it('should respect tolerance', () => {
    const moving = mockRoom('1', 0.5, 0, 4, 4);
    const other = mockRoom('2', 0, 10, 4, 4);

    // Diff 0.5 > tolerance 0.2
    const result = getSnapGuides(moving, [other], { x: 0.5, z: 0 }, 0.2);

    expect(result.position.x).toBe(0.5);
    expect(result.guides).toHaveLength(0);
  });

  it('should prioritize closest snap', () => {
    // Room A Left at x=0
    // Room B Left at x=0.05
    // Moving Left at x=0.02

    // Ensure lengths are different so other points don't interfere
    const moving = mockRoom('1', 0.02, 0, 5, 5);
    const roomA = mockRoom('A', 0, 10, 6, 6);
    const roomB = mockRoom('B', 0.05, 20, 7, 7);

    // A Left: 0.02 vs 0 -> diff 0.02
    // B Left: 0.02 vs 0.05 -> diff 0.03
    // A is closest.

    const result = getSnapGuides(moving, [roomA, roomB], { x: 0.02, z: 0 }, 0.2);

    expect(result.position.x).toBeCloseTo(0);
    expect(result.guides[0].offset).toBe(0);
  });
});
