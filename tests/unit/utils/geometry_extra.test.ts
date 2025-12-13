import { calculateDistance, calculateAngle, getRoomRect, calculateRectGap, projectPointOnLine } from '../../../src/utils/geometry';
import { mockRoom } from '../../utils/mockData';

describe('geometry utils coverage', () => {
  it('calculateDistance', () => {
    expect(calculateDistance({ x: 0, z: 0 }, { x: 3, z: 4 })).toBe(5);
  });

  it('calculateAngle', () => {
    expect(calculateAngle({ x: 0, z: 0 }, { x: 1, z: 0 })).toBe(0);
    expect(calculateAngle({ x: 0, z: 0 }, { x: 0, z: 1 })).toBe(90);
    expect(calculateAngle({ x: 0, z: 0 }, { x: -1, z: 0 })).toBe(180);
    expect(calculateAngle({ x: 0, z: 0 }, { x: 0, z: -1 })).toBe(270);
  });

  it('getRoomRect', () => {
    const room = { ...mockRoom(), position: { x: 10, z: 10 }, length: 4, width: 2, rotation: 0 };
    // Center: 10+2=12, 10+1=11.
    // Rect: x: 12-2=10, z: 11-1=10, w: 4, h: 2.
    expect(getRoomRect(room)).toEqual({ x: 10, z: 10, width: 4, height: 2 });

    const roomRotated = { ...mockRoom(), position: { x: 10, z: 10 }, length: 4, width: 2, rotation: 90 };
    // Center: 12, 11.
    // Width becomes 2, Height becomes 4.
    // Rect: x: 12-1=11, z: 11-2=9, w: 2, h: 4.
    expect(getRoomRect(roomRotated)).toEqual({ x: 11, z: 9, width: 2, height: 4 });
  });

  it('calculateRectGap', () => {
    const r1 = { x: 0, z: 0, width: 10, height: 10 };
    const r2 = { x: 15, z: 0, width: 10, height: 10 };
    expect(calculateRectGap(r1, r2)).toEqual({ x: 5, z: 0 }); // 5m gap in X, overlap in Z

    const r3 = { x: 0, z: 15, width: 10, height: 10 };
    expect(calculateRectGap(r1, r3)).toEqual({ x: 0, z: 5 });

    const r4 = { x: 5, z: 5, width: 2, height: 2 };
    expect(calculateRectGap(r1, r4)).toBeNull(); // Overlap
  });

  it('projectPointOnLine', () => {
    const start = { x: 0, z: 0 };
    const end = { x: 10, z: 0 };

    // On line
    expect(projectPointOnLine({ x: 5, z: 0 }, start, end)).toEqual({ point: { x: 5, z: 0 }, t: 0.5, dist: 0 });

    // Off line
    expect(projectPointOnLine({ x: 5, z: 5 }, start, end)).toEqual({ point: { x: 5, z: 0 }, t: 0.5, dist: 5 });

    // Before start
    expect(projectPointOnLine({ x: -5, z: 0 }, start, end)).toEqual({ point: { x: 0, z: 0 }, t: 0, dist: 5 });

    // After end
    expect(projectPointOnLine({ x: 15, z: 0 }, start, end)).toEqual({ point: { x: 10, z: 0 }, t: 1, dist: 5 });

    // Zero length line
    expect(projectPointOnLine({ x: 5, z: 0 }, start, start)).toEqual({ point: { x: 0, z: 0 }, t: 0, dist: 5 });
  });
});
