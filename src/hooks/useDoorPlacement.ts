import { useCallback, useState, useEffect } from 'react';
import { useToolStore } from '../stores/toolStore';
import { useFloorplanStore } from '../stores/floorplanStore';
import { Position2D, WallSegment, WallSide } from '../types';
import { getRoomWallSegments, localToWorld, worldToLocal, getWallLength, distance } from '../services/geometry';
import { DOOR_DEFAULTS, validateDoor } from '../types/door';

// Helper to project point onto line segment
function projectPointOnLine(point: Position2D, start: Position2D, end: Position2D): { point: Position2D, t: number, dist: number } {
    const l2 = Math.pow(end.x - start.x, 2) + Math.pow(end.z - start.z, 2);
    if (l2 === 0) return { point: start, t: 0, dist: distance(point.x, point.z, start.x, start.z) };

    let t = ((point.x - start.x) * (end.x - start.x) + (point.z - start.z) * (end.z - start.z)) / l2;
    t = Math.max(0, Math.min(1, t));

    const projection = {
        x: start.x + t * (end.x - start.x),
        z: start.z + t * (end.z - start.z)
    };

    return {
        point: projection,
        t,
        dist: distance(point.x, point.z, projection.x, projection.z)
    };
}

export function useDoorPlacement() {
    const { activeTool, setTool } = useToolStore();
    const { currentFloorplan, addDoor, selectDoor, getDoorsByRoom, getWindowsByRoom } = useFloorplanStore();

    const [hoveredWall, setHoveredWall] = useState<{ roomId: string, wall: WallSegment, position: number } | null>(null);
    const [isValid, setIsValid] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    // Reset state when tool changes
    useEffect(() => {
        if (activeTool !== 'door') {
            setHoveredWall(null);
            setIsValid(false);
            setValidationError(null);
        }
    }, [activeTool]);

    const handleMouseMove = useCallback((worldPos: Position2D | null) => {
        if (activeTool !== 'door' || !worldPos || !currentFloorplan) {
            setHoveredWall(null);
            return;
        }

        let bestMatch: { roomId: string, wall: WallSegment, position: number, dist: number } | null = null;
        const SNAP_DISTANCE = 0.5; // meters

        // Find closest wall
        for (const room of currentFloorplan.rooms) {
            const walls = getRoomWallSegments(room);
            for (const wall of walls) {
                const { t, dist } = projectPointOnLine(worldPos, wall.from, wall.to);

                if (dist < SNAP_DISTANCE) {
                    if (!bestMatch || dist < bestMatch.dist) {
                        bestMatch = { roomId: room.id, wall, position: t, dist };
                    }
                }
            }
        }

        if (bestMatch) {
            // Validate placement
            const room = currentFloorplan.rooms.find(r => r.id === bestMatch!.roomId);
            if (room) {
                const wallLength = getWallLength(room, bestMatch.wall.wallSide);
                const doorWidth = DOOR_DEFAULTS.width;

                // Calculate position in meters from start of wall
                const posMeters = bestMatch.position * wallLength;

                // Check if door fits in wall
                if (posMeters - doorWidth / 2 < 0 || posMeters + doorWidth / 2 > wallLength) {
                    setIsValid(false);
                    setValidationError('Door exceeds wall bounds');
                } else {
                     // Basic validation passed
                    setIsValid(true);
                    setValidationError(null);

                    // TODO: Check for overlap with other doors/windows
                    // This would require checking existing openings on this wall
                }

                setHoveredWall({
                    roomId: bestMatch.roomId,
                    wall: bestMatch.wall,
                    position: bestMatch.position
                });
            }
        } else {
            setHoveredWall(null);
            setIsValid(false);
            setValidationError(null);
        }
    }, [activeTool, currentFloorplan]);

    const handleClick = useCallback(() => {
        if (activeTool !== 'door' || !hoveredWall || !isValid || !currentFloorplan) return;

        const room = currentFloorplan.rooms.find(r => r.id === hoveredWall.roomId);
        if (!room) return;

        // Check if shared wall (find connection)
        let connectionId: string | undefined = undefined;
        let isExterior = true;

        if (currentFloorplan.connections) {
            const connection = currentFloorplan.connections.find(c =>
                (c.room1Id === room.id && c.room1Wall === hoveredWall.wall.wallSide) ||
                (c.room2Id === room.id && c.room2Wall === hoveredWall.wall.wallSide)
            );

            if (connection) {
                connectionId = connection.id;
                isExterior = false;
            }
        }

        const newDoor = addDoor({
            ...DOOR_DEFAULTS,
            roomId: room.id,
            wallSide: hoveredWall.wall.wallSide,
            position: hoveredWall.position,
            connectionId,
            isExterior,
        });

        selectDoor(newDoor.id);
        setTool('select');
    }, [activeTool, hoveredWall, isValid, currentFloorplan, addDoor, selectDoor, setTool]);

    return {
        isActive: activeTool === 'door',
        hoveredWall,
        isValid,
        validationError,
        handleMouseMove,
        handleClick
    };
}
