import { getWallSnapPoints } from '../../../../src/services/geometry/snapping';
import { Wall, Position2D } from '../../../../src/types';

describe('getWallSnapPoints Combined Snapping', () => {
    const walls: Wall[] = [];
    const startPoint: Position2D = { x: 0, z: 0 };
    const gridSize = 0.5;
    const snapTolerance = 0.2;

    it('snaps horizontal line to grid along X axis', () => {
        // Drawing horizontal line (snapped to Z=0)
        // Cursor at (5.2, 0.1) -> should snap Z to 0 (angle), and X to 5.0 (grid)
        const cursor = { x: 5.2, z: 0.1 };
        const result = getWallSnapPoints(cursor, walls, startPoint, gridSize, true, snapTolerance);

        expect(result.snappedTo).toBe('angle');
        expect(result.position).toEqual({ x: 5.0, z: 0 });
    });

    it('does not snap horizontal line to grid if grid disabled', () => {
        const cursor = { x: 5.2, z: 0.1 };
        const result = getWallSnapPoints(cursor, walls, startPoint, gridSize, false, snapTolerance);

        expect(result.snappedTo).toBe('angle');
        expect(result.position).toEqual({ x: 5.2, z: 0 });
    });

    it('snaps vertical line to grid along Z axis', () => {
        // Drawing vertical line (snapped to X=0)
        // Cursor at (0.1, 5.2) -> should snap X to 0 (angle), and Z to 5.0 (grid)
        const cursor = { x: 0.1, z: 5.2 };
        const result = getWallSnapPoints(cursor, walls, startPoint, gridSize, true, snapTolerance);

        expect(result.snappedTo).toBe('angle');
        expect(result.position).toEqual({ x: 0, z: 5.0 });
    });
});
