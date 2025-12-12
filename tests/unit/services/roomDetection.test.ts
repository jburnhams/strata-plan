import { findEnclosedAreas, createRoomFromPolygon } from '../../../src/services/roomDetection';
import { Wall } from '../../../src/types';

const createWall = (id: string, x1: number, z1: number, x2: number, z2: number): Wall => ({
  id,
  from: { x: x1, z: z1 },
  to: { x: x2, z: z2 },
  thickness: 0.2
});

describe('roomDetection', () => {
  it('returns empty array for insufficient walls', () => {
    const walls = [
      createWall('w1', 0, 0, 4, 0),
      createWall('w2', 4, 0, 4, 4),
    ];
    expect(findEnclosedAreas(walls)).toEqual([]);
  });

  it('detects a simple square room', () => {
    // 4 walls forming a 4x4 square at (0,0)
    const walls = [
      createWall('w1', 0, 0, 4, 0), // Top
      createWall('w2', 4, 0, 4, 4), // Right
      createWall('w3', 4, 4, 0, 4), // Bottom
      createWall('w4', 0, 4, 0, 0), // Left
    ];

    const polygons = findEnclosedAreas(walls);
    expect(polygons).toHaveLength(1);
    expect(polygons[0].area).toBeCloseTo(16);
    expect(polygons[0].vertices).toHaveLength(4);
  });

  it('detects two adjacent rooms', () => {
    // Room 1: (0,0) to (4,4)
    // Room 2: (4,0) to (8,4)
    // Shared wall at x=4
    const walls = [
      createWall('w1', 0, 0, 4, 0),
      createWall('w2', 4, 0, 4, 4), // Shared
      createWall('w3', 4, 4, 0, 4),
      createWall('w4', 0, 4, 0, 0),

      createWall('w5', 4, 0, 8, 0),
      createWall('w6', 8, 0, 8, 4),
      createWall('w7', 8, 4, 4, 4),
      // w2 is shared
    ];

    const polygons = findEnclosedAreas(walls);
    expect(polygons).toHaveLength(2);

    const areas = polygons.map(p => p.area).sort((a, b) => a - b);
    expect(areas[0]).toBeCloseTo(16);
    expect(areas[1]).toBeCloseTo(16);
  });

  it('ignores open loops', () => {
    // U-shape
    const walls = [
      createWall('w1', 0, 0, 4, 0),
      createWall('w2', 4, 0, 4, 4),
      createWall('w3', 4, 4, 0, 4),
    ];
    expect(findEnclosedAreas(walls)).toHaveLength(0);
  });

  it('handles tolerance/gaps correctly (within epsilon)', () => {
    const EPS = 0.005; // Less than 0.01
    const walls = [
      createWall('w1', 0, 0, 4, 0),
      createWall('w2', 4, EPS, 4, 4), // Slight gap in Z
      createWall('w3', 4, 4, 0, 4),
      createWall('w4', 0, 4, 0, 0),
    ];

    const polygons = findEnclosedAreas(walls);
    expect(polygons).toHaveLength(1);
    expect(polygons[0].area).toBeCloseTo(16);
  });

  it('detects L-shaped room', () => {
    // (0,0)-(2,0)-(2,2)-(4,2)-(4,4)-(0,4)-(0,0)
    const walls = [
      createWall('w1', 0, 0, 2, 0),
      createWall('w2', 2, 0, 2, 2),
      createWall('w3', 2, 2, 4, 2),
      createWall('w4', 4, 2, 4, 4),
      createWall('w5', 4, 4, 0, 4),
      createWall('w6', 0, 4, 0, 0),
    ];

    const polygons = findEnclosedAreas(walls);
    expect(polygons).toHaveLength(1);

    // Area: Full 4x4 (16) minus missing 2x2 (4) = 12
    expect(polygons[0].area).toBeCloseTo(12);
    expect(polygons[0].vertices).toHaveLength(6);
  });

  it('ignores crossed walls without vertex at intersection', () => {
    // X shape. Two long walls crossing. No vertex in middle.
    // (0,0)-(4,4) and (0,4)-(4,0)
    // This forms "bowtie" visually but graph is 2 disjoint edges.
    const walls = [
      createWall('w1', 0, 0, 4, 4),
      createWall('w2', 0, 4, 4, 0),
    ];
    expect(findEnclosedAreas(walls)).toHaveLength(0);
  });

  it('detects triangle', () => {
    const walls = [
        createWall('w1', 0, 0, 4, 0),
        createWall('w2', 4, 0, 2, 3),
        createWall('w3', 2, 3, 0, 0)
    ];
    const polygons = findEnclosedAreas(walls);
    expect(polygons).toHaveLength(1);
    // Base 4, Height 3. Area 6.
    expect(polygons[0].area).toBeCloseTo(6);
  });

  describe('createRoomFromPolygon', () => {
    it('converts polygon to room props with relative vertices', () => {
      const polygon = {
        area: 16,
        vertices: [
          { x: 10, z: 10 },
          { x: 14, z: 10 },
          { x: 14, z: 14 },
          { x: 10, z: 14 }
        ]
      };

      const room = createRoomFromPolygon(polygon);
      expect(room.length).toBe(4);
      expect(room.width).toBe(4);
      expect(room.position).toEqual({ x: 10, z: 10 });
      expect(room.vertices).toHaveLength(4);
      // Verify relative coords
      expect(room.vertices).toContainEqual({ x: 0, z: 0 });
      expect(room.vertices).toContainEqual({ x: 4, z: 0 });
      expect(room.vertices).toContainEqual({ x: 4, z: 4 });
      expect(room.vertices).toContainEqual({ x: 0, z: 4 });
    });
  });
});
