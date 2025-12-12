import { getWallSnapPoints, WallSnapResult } from '../../../../src/services/geometry/snapping';
import { Wall, Position2D } from '../../../../src/types';

describe('getWallSnapPoints', () => {
    const existingWalls: Wall[] = [
        {
            id: 'w1',
            from: { x: 0, z: 0 },
            to: { x: 5, z: 0 },
            thickness: 0.2
        },
        {
            id: 'w2',
            from: { x: 5, z: 0 },
            to: { x: 5, z: 5 },
            thickness: 0.2
        }
    ];

    const startPoint: Position2D = { x: 0, z: 2 };
    const gridSize = 0.5;
    const snapTolerance = 0.3;

    it('snaps to existing wall endpoint', () => {
        // Cursor near (0,0) - endpoint of w1
        const cursor: Position2D = { x: 0.1, z: 0.1 };
        const result = getWallSnapPoints(cursor, existingWalls, null, gridSize, true, snapTolerance);

        expect(result.snappedTo).toBe('endpoint');
        expect(result.position).toEqual({ x: 0, z: 0 });
    });

    it('snaps to another endpoint', () => {
        // Cursor near (5,0) - endpoint of w1 and w2
        const cursor: Position2D = { x: 4.9, z: 0.1 };
        const result = getWallSnapPoints(cursor, existingWalls, null, gridSize, true, snapTolerance);

        expect(result.snappedTo).toBe('endpoint');
        expect(result.position).toEqual({ x: 5, z: 0 });
    });

    it('snaps to perpendicular angle (horizontal)', () => {
        // Start point at (0, 2)
        // Cursor moving to right, slightly off horizontal: (4, 2.1)
        // Should snap to (4, 2)
        const cursor: Position2D = { x: 4, z: 2.1 };
        const result = getWallSnapPoints(cursor, existingWalls, startPoint, gridSize, true, snapTolerance);

        expect(result.snappedTo).toBe('angle');
        expect(result.position.z).toBe(2);
        expect(result.position.x).toBe(4);
    });

    it('snaps to perpendicular angle (vertical)', () => {
        // Start point at (0, 2)
        // Cursor moving down, slightly off vertical: (0.1, 5)
        // Should snap to (0, 5)
        const cursor: Position2D = { x: 0.1, z: 5 };
        const result = getWallSnapPoints(cursor, existingWalls, startPoint, gridSize, true, snapTolerance);

        expect(result.snappedTo).toBe('angle');
        expect(result.position.x).toBe(0);
        expect(result.position.z).toBe(5);
    });

    it('snaps to grid if no wall endpoint or angle snap applies', () => {
        // Random point far from walls and not aligned with start
        const cursor: Position2D = { x: 3.2, z: 3.3 };
        const result = getWallSnapPoints(cursor, existingWalls, startPoint, gridSize, true, snapTolerance);

        expect(result.snappedTo).toBe('grid');
        // Closest grid point (0.5 spacing)
        // 3.2 -> 3.0 or 3.5? 3.0 is closer.
        // 3.3 -> 3.5 is closer.
        expect(result.position).toEqual({ x: 3.0, z: 3.5 });
    });

    it('returns raw position if grid is off and no other snaps', () => {
        const cursor: Position2D = { x: 3.24, z: 3.37 };
        const result = getWallSnapPoints(cursor, existingWalls, startPoint, gridSize, false, snapTolerance);

        expect(result.snappedTo).toBe('none');
        expect(result.position).toEqual(cursor);
    });

    it('prioritizes endpoint over angle and grid', () => {
        // Cursor near (5,0) which is an endpoint
        // Also could be on grid (5,0)
        // Also could be angle-aligned if startPoint was (0,0) -> (5,0) is horizontal
        const cursor: Position2D = { x: 4.9, z: 0.1 };
        const result = getWallSnapPoints(cursor, existingWalls, {x:0, z:0}, gridSize, true, snapTolerance);

        expect(result.snappedTo).toBe('endpoint');
        expect(result.position).toEqual({ x: 5, z: 0 });
    });
});
