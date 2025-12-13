import { calculateDistance, calculateAngle, getRoomRect, calculateRectGap, Rect } from '../../../src/utils/geometry';
import { Room } from '../../../src/types';

describe('geometry utils', () => {
    describe('calculateDistance', () => {
        it('calculates distance between two points', () => {
            const p1 = { x: 0, z: 0 };
            const p2 = { x: 3, z: 4 };
            expect(calculateDistance(p1, p2)).toBe(5);
        });

        it('calculates distance correctly for negative coordinates', () => {
            const p1 = { x: -1, z: -1 };
            const p2 = { x: -4, z: -5 };
            expect(calculateDistance(p1, p2)).toBe(5);
        });
    });

    describe('calculateAngle', () => {
        it('calculates 0 degrees for horizontal right', () => {
            const p1 = { x: 0, z: 0 };
            const p2 = { x: 5, z: 0 };
            expect(calculateAngle(p1, p2)).toBe(0);
        });

        it('calculates 90 degrees for vertical down', () => {
            const p1 = { x: 0, z: 0 };
            const p2 = { x: 0, z: 5 };
            expect(calculateAngle(p1, p2)).toBe(90);
        });

        it('calculates 180 degrees for horizontal left', () => {
            const p1 = { x: 0, z: 0 };
            const p2 = { x: -5, z: 0 };
            expect(calculateAngle(p1, p2)).toBe(180);
        });

        it('calculates 270 degrees for vertical up', () => {
            const p1 = { x: 0, z: 0 };
            const p2 = { x: 0, z: -5 };
            expect(calculateAngle(p1, p2)).toBe(270);
        });

        it('calculates 45 degrees correctly', () => {
            const p1 = { x: 0, z: 0 };
            const p2 = { x: 5, z: 5 };
            expect(calculateAngle(p1, p2)).toBe(45);
        });
    });

    describe('getRoomRect', () => {
        const mockRoom: Room = {
            id: 'room-1',
            name: 'Test',
            type: 'bedroom',
            length: 4,
            width: 3,
            height: 2.5,
            position: { x: 0, z: 0 },
            rotation: 0
        };

        it('calculates rect for 0 rotation', () => {
            const rect = getRoomRect(mockRoom);
            // Center is at (2, 1.5).
            // Width 4, Height 3.
            // x = 2 - 2 = 0. z = 1.5 - 1.5 = 0.
            expect(rect).toEqual({ x: 0, z: 0, width: 4, height: 3 });
        });

        it('calculates rect for 90 rotation', () => {
            const rotatedRoom = { ...mockRoom, rotation: 90 };
            const rect = getRoomRect(rotatedRoom);
            // Center is still (2, 1.5) based on original position/dimensions logic in function
            // wait, the function says:
            // const cx = room.position.x + room.length / 2;
            // const cz = room.position.z + room.width / 2;
            // The position is top-left of the UNROTATED room.
            // If rotated 90, dimensions swap.
            // Width becomes 3, Height becomes 4.
            // x = 2 - 1.5 = 0.5.
            // z = 1.5 - 2 = -0.5.

            expect(rect).toEqual({ x: 0.5, z: -0.5, width: 3, height: 4 });
        });

        it('calculates rect for 180 rotation', () => {
             const rotatedRoom = { ...mockRoom, rotation: 180 };
             const rect = getRoomRect(rotatedRoom);
             // 180 is not odd multiple of 90, so width/height don't swap?
             // Logic: isRotated = Math.round(room.rotation) % 180 !== 0;
             // 180 % 180 === 0. So isRotated is false.
             // Width 4, Height 3.
             // Center (2, 1.5).
             // x = 0, z = 0.
             expect(rect).toEqual({ x: 0, z: 0, width: 4, height: 3 });
        });
    });

    describe('calculateRectGap', () => {
        const r1: Rect = { x: 0, z: 0, width: 4, height: 4 };

        it('calculates gap for separated rects (horizontal)', () => {
            const r2: Rect = { x: 6, z: 0, width: 4, height: 4 };
            const gap = calculateRectGap(r1, r2);
            expect(gap).toEqual({ x: 2, z: 0 }); // 6 - 4 = 2
        });

        it('calculates gap for separated rects (vertical)', () => {
            const r2: Rect = { x: 0, z: 6, width: 4, height: 4 };
            const gap = calculateRectGap(r1, r2);
            expect(gap).toEqual({ x: 0, z: 2 });
        });

        it('returns null for intersecting rects', () => {
            const r2: Rect = { x: 2, z: 2, width: 4, height: 4 };
            const gap = calculateRectGap(r1, r2);
            expect(gap).toBeNull();
        });

        it('calculates 0 gap for touching rects', () => {
             const r2: Rect = { x: 4, z: 0, width: 4, height: 4 };
             const gap = calculateRectGap(r1, r2);
             // x gap 0
             expect(gap).toEqual({ x: 0, z: 0 });
        });

        it('handles r1 right of r2', () => {
            const r2: Rect = { x: -6, z: 0, width: 4, height: 4 };
            const gap = calculateRectGap(r1, r2);
            // r1.x (0) - (r2.x (-6) + 4) = 0 - (-2) = 2
            expect(gap).toEqual({ x: 2, z: 0 });
        });
    });
});
