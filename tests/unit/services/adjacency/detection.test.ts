import { detectAdjacency } from '@/services/adjacency/detection';
import { getRoomWallSegments } from '@/services/geometry/room';
import { Room } from '@/types/room';
import { WallSegment, WallSide } from '@/types/geometry';

// Mock the geometry service
jest.mock('@/services/geometry/room');

const mockedGetRoomWallSegments = jest.mocked(getRoomWallSegments);

describe('Adjacency Detection', () => {
  const room1 = { id: 'r1' } as Room;
  const room2 = { id: 'r2' } as Room;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to setup mock return values
  const setupWalls = (r1Walls: Partial<WallSegment>[], r2Walls: Partial<WallSegment>[]) => {
    mockedGetRoomWallSegments.mockImplementation((room) => {
      if (room.id === room1.id) {
        return r1Walls.map((w, i) => ({
          id: `r1-w${i}`,
          from: { x: 0, z: 0 },
          to: { x: 0, z: 0 },
          wallSide: 'north',
          ...w,
        })) as WallSegment[];
      }
      if (room.id === room2.id) {
        return r2Walls.map((w, i) => ({
          id: `r2-w${i}`,
          from: { x: 0, z: 0 },
          to: { x: 0, z: 0 },
          wallSide: 'north',
          ...w,
        })) as WallSegment[];
      }
      return [];
    });
  };

  it('detects horizontal adjacency (East-West)', () => {
    // Room 1 East wall: x=10, z=0->10
    const r1East: Partial<WallSegment> = {
      wallSide: 'east',
      from: { x: 10, z: 0 },
      to: { x: 10, z: 10 }
    };
    // Room 2 West wall: x=10, z=0->10
    const r2West: Partial<WallSegment> = {
      wallSide: 'west',
      from: { x: 10, z: 0 },
      to: { x: 10, z: 10 }
    };

    setupWalls([r1East], [r2West]);

    const result = detectAdjacency(room1, room2);

    expect(result).toEqual({
      room1Id: 'r1',
      room2Id: 'r2',
      sharedWall: {
        room1Wall: 'east',
        room2Wall: 'west',
        length: 10,
        startPosition: 0,
        endPosition: 1,
      },
    });
  });

  it('detects vertical adjacency (North-South)', () => {
    // Room 1 South wall: z=10, x=10->0 (Direction is usually maxZ to minX? Or whatever geometry returns)
    // detectAdjacency just checks min/max, so direction doesn't affect detection logic for position,
    // but affects how start/end are calculated relative to wall?
    // Let's assume standard axes.
    const r1South: Partial<WallSegment> = {
      wallSide: 'south',
      from: { x: 10, z: 10 },
      to: { x: 0, z: 10 }
    };
    const r2North: Partial<WallSegment> = {
      wallSide: 'north',
      from: { x: 0, z: 10 },
      to: { x: 10, z: 10 }
    };

    setupWalls([r1South], [r2North]);

    const result = detectAdjacency(room1, room2);

    expect(result).not.toBeNull();
    expect(result?.sharedWall.room1Wall).toBe('south');
    expect(result?.sharedWall.room2Wall).toBe('north');
    expect(result?.sharedWall.length).toBe(10);
  });

  it('returns null if walls do not align (gap)', () => {
    const r1East: Partial<WallSegment> = {
      wallSide: 'east',
      from: { x: 10, z: 0 },
      to: { x: 10, z: 10 }
    };
    // Gap of 0.1m (tolerance is 0.01)
    const r2West: Partial<WallSegment> = {
      wallSide: 'west',
      from: { x: 10.1, z: 0 },
      to: { x: 10.1, z: 10 }
    };

    setupWalls([r1East], [r2West]);

    expect(detectAdjacency(room1, room2)).toBeNull();
  });

  it('returns null if no overlap', () => {
    const r1East: Partial<WallSegment> = {
      wallSide: 'east',
      from: { x: 10, z: 0 },
      to: { x: 10, z: 10 }
    };
    // Aligned in X, but shifted in Z (11 to 21)
    const r2West: Partial<WallSegment> = {
      wallSide: 'west',
      from: { x: 10, z: 11 },
      to: { x: 10, z: 21 }
    };

    setupWalls([r1East], [r2West]);

    expect(detectAdjacency(room1, room2)).toBeNull();
  });

  it('handles partial overlap', () => {
    // R1: z=0->10. Length 10.
    const r1East: Partial<WallSegment> = {
      wallSide: 'east',
      from: { x: 10, z: 0 },
      to: { x: 10, z: 10 }
    };
    // R2: z=5->15. Overlap 5->10. Length 5.
    const r2West: Partial<WallSegment> = {
      wallSide: 'west',
      from: { x: 10, z: 5 },
      to: { x: 10, z: 15 }
    };

    setupWalls([r1East], [r2West]);

    const result = detectAdjacency(room1, room2);

    expect(result).not.toBeNull();
    expect(result?.sharedWall.length).toBe(5);
    // Overlap 5->10 on R1 (0->10).
    // Start = 0.5, End = 1.0.
    expect(result?.sharedWall.startPosition).toBeCloseTo(0.5);
    expect(result?.sharedWall.endPosition).toBeCloseTo(1.0);
  });

  it('handles tolerance', () => {
    const r1East: Partial<WallSegment> = {
      wallSide: 'east',
      from: { x: 10, z: 0 },
      to: { x: 10, z: 10 }
    };
    // Within tolerance (0.005 < 0.01)
    const r2West: Partial<WallSegment> = {
      wallSide: 'west',
      from: { x: 10.005, z: 0 },
      to: { x: 10.005, z: 10 }
    };

    setupWalls([r1East], [r2West]);

    expect(detectAdjacency(room1, room2)).not.toBeNull();
  });

  it('correctly identifies side for rotated rooms (based on world segments provided)', () => {
      // Logic for rotated rooms relies on what getRoomWallSegments returns.
      // If we mock getRoomWallSegments to return a "north" wall that is at the bottom (physically),
      // detectAdjacency should still detect it if it overlaps.

      // Assume R1 is normal. South wall at z=10.
      const r1South: Partial<WallSegment> = {
        wallSide: 'south',
        from: { x: 10, z: 10 },
        to: { x: 0, z: 10 }
      };

      // Assume R2 is rotated 180.
      // In reality, getRoomWallSegments would return 'north' for the top wall (minZ).
      // But let's say R2's 'north' wall is at z=10 (touching R1 South).
      // This mocks the scenario where two walls touch.
      const r2North: Partial<WallSegment> = {
          wallSide: 'north',
          from: { x: 0, z: 10 },
          to: { x: 10, z: 10 }
      };

      setupWalls([r1South], [r2North]);

      const result = detectAdjacency(room1, room2);

      expect(result).not.toBeNull();
      expect(result?.sharedWall.room1Wall).toBe('south');
      expect(result?.sharedWall.room2Wall).toBe('north');
  });

  it('detects adjacency regardless of wall labels (using geometry)', () => {
      // Create a vertical wall but label it 'north' to simulate label mismatch or rotation confusion
      // R1 Vertical wall at x=10, z=0->10. Labeled 'north'.
      const r1Vertical: Partial<WallSegment> = {
        wallSide: 'north' as any, // Misleading label
        from: { x: 10, z: 0 },
        to: { x: 10, z: 10 }
      };

      // R2 Vertical wall at x=10, z=0->10. Labeled 'west'.
      const r2Vertical: Partial<WallSegment> = {
        wallSide: 'west',
        from: { x: 10, z: 0 },
        to: { x: 10, z: 10 }
      };

      setupWalls([r1Vertical], [r2Vertical]);

      const result = detectAdjacency(room1, room2);

      expect(result).not.toBeNull();
      // Should detect based on geometry (both vertical)
      expect(result?.sharedWall.room1Wall).toBe('north');
      expect(result?.sharedWall.room2Wall).toBe('west');
  });

  it('returns null for non-axis-aligned walls (diagonal)', () => {
    const r1Diag: Partial<WallSegment> = {
        from: { x: 0, z: 0 },
        to: { x: 10, z: 10 } // Diagonal
    };
    const r2Diag: Partial<WallSegment> = {
        from: { x: 0, z: 0 },
        to: { x: 10, z: 10 }
    };
    setupWalls([r1Diag], [r2Diag]);
    expect(detectAdjacency(room1, room2)).toBeNull();
  });
});
