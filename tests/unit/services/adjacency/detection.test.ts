import { describe, it, expect } from '@jest/globals';
import { detectAdjacency } from '../../../../src/services/adjacency/detection';
import { Room } from '../../../../src/types/room';

describe('Adjacency Detection', () => {
  const createRoom = (
    id: string,
    x: number,
    z: number,
    length: number,
    width: number,
    rotation: 0 | 90 | 180 | 270 = 0
  ): Room => ({
    id,
    name: `Room ${id}`,
    type: 'bedroom',
    position: { x, z },
    length,
    width,
    height: 2.4,
    rotation,
    doors: [],
    windows: [],
  });

  it('should detect adjacency for rooms side-by-side (touching)', () => {
    // Room 1: 0,0 to 4,4
    const r1 = createRoom('1', 0, 0, 4, 4);
    // Room 2: 4,0 to 8,4 (touching on Right/Left)
    const r2 = createRoom('2', 4, 0, 4, 4);

    const adjacency = detectAdjacency(r1, r2);

    expect(adjacency).not.toBeNull();
    expect(adjacency).toEqual({
      room1Id: '1',
      room2Id: '2',
      sharedWall: {
        room1Wall: 'east',
        room2Wall: 'west',
        length: 4,
        startPosition: 0,
        endPosition: 1,
      },
    });
  });

  it('should return null for rooms with a gap > tolerance', () => {
    // Room 1: 0,0 to 4,4
    const r1 = createRoom('1', 0, 0, 4, 4);
    // Room 2: 4.02, 0 (gap 0.02 > 0.01 tolerance)
    const r2 = createRoom('2', 4.02, 0, 4, 4);

    const adjacency = detectAdjacency(r1, r2);
    expect(adjacency).toBeNull();
  });

  it('should detect adjacency for rooms with a small gap < tolerance', () => {
    // Room 1: 0,0 to 4,4
    const r1 = createRoom('1', 0, 0, 4, 4);
    // Room 2: 4.005, 0 (gap 0.005 < 0.01 tolerance)
    const r2 = createRoom('2', 4.005, 0, 4, 4);

    const adjacency = detectAdjacency(r1, r2);
    expect(adjacency).not.toBeNull();
    expect(adjacency?.sharedWall.length).toBeCloseTo(4);
  });

  it('should detect partial overlap', () => {
    // Room 1: 0,0 to 4,4
    const r1 = createRoom('1', 0, 0, 4, 4);
    // Room 2: 4,2 to 8,6 (overlap on Z from 2 to 4, length 2)
    const r2 = createRoom('2', 4, 2, 4, 4);

    const adjacency = detectAdjacency(r1, r2);

    expect(adjacency).not.toBeNull();
    expect(adjacency?.sharedWall).toMatchObject({
      room1Wall: 'east',
      room2Wall: 'west',
      length: 2,
    });
    // Overlap is on r1's east wall (length 4). Overlap is from z=2 to z=4.
    // Normalized start: (2-0)/4 = 0.5. End: (4-0)/4 = 1.0.
    expect(adjacency?.sharedWall.startPosition).toBeCloseTo(0.5);
    expect(adjacency?.sharedWall.endPosition).toBeCloseTo(1.0);
  });

  it('should detect adjacency correctly for rotated rooms', () => {
    // Room 1: 0,0 to 4,4
    const r1 = createRoom('1', 0, 0, 4, 4);
    // Room 2: 2,4 to 6,8, but rotated 90 deg.
    // Position 2,4.
    // Unrotated: 2,4 to 6,8 (Length 4, Width 4).
    // Rotated 90: effective dimensions 4x4.
    // Bounds: 2,4 to 6,8.
    // Touching r1 at Z=4.
    const r2 = createRoom('2', 2, 4, 4, 4, 90);

    const adjacency = detectAdjacency(r1, r2);
    expect(adjacency).not.toBeNull();
    expect(adjacency?.sharedWall).toMatchObject({
      room1Wall: 'south',
      room2Wall: 'north', // Room 2's bounding box North wall touches Room 1's South wall
      length: 2,
    });
  });

  it('should return null if overlap length is less than minimum', () => {
    // Room 1: 0,0 to 4,4
    const r1 = createRoom('1', 0, 0, 4, 4);
    // Room 2: 4, 3.95 to 8, 7.95. Overlap on Z is 4-3.95 = 0.05.
    // MIN_SHARED_LENGTH is 0.1
    const r2 = createRoom('2', 4, 3.95, 4, 4);

    const adjacency = detectAdjacency(r1, r2);
    expect(adjacency).toBeNull();
  });
});
