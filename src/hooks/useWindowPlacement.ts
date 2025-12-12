import { useCallback, useState, useEffect } from 'react';
import { useToolStore } from '../stores/toolStore';
import { useFloorplanStore } from '../stores/floorplanStore';
import { Position2D, WallSegment } from '../types';
import { getRoomWallSegments, getWallLength, distance } from '../services/geometry';
import { WINDOW_DEFAULTS, validateWindow } from '../types/window';

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

export function useWindowPlacement() {
    const { activeTool, setTool } = useToolStore();
    const { currentFloorplan, addWindow, selectWindow, getDoorsByRoom, getWindowsByRoom } = useFloorplanStore();

    const [hoveredWall, setHoveredWall] = useState<{ roomId: string, wall: WallSegment, position: number } | null>(null);
    const [isValid, setIsValid] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    // Reset state when tool changes
    useEffect(() => {
        if (activeTool !== 'window') {
            setHoveredWall(null);
            setIsValid(false);
            setValidationError(null);
        }
    }, [activeTool]);

    const handleMouseMove = useCallback((worldPos: Position2D | null) => {
        if (activeTool !== 'window' || !worldPos || !currentFloorplan) {
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
                const windowWidth = WINDOW_DEFAULTS.width;

                // Calculate position in meters from start of wall
                const posMeters = bestMatch.position * wallLength;

                // Check if window fits in wall
                if (posMeters - windowWidth / 2 < 0 || posMeters + windowWidth / 2 > wallLength) {
                    setIsValid(false);
                    setValidationError('Window exceeds wall bounds');
                } else {
                    // Check overlap
                    const roomDoors = getDoorsByRoom(room.id);
                    const roomWindows = getWindowsByRoom(room.id);

                    const currentStart = posMeters - windowWidth / 2;
                    const currentEnd = posMeters + windowWidth / 2;
                    let overlap = false;

                    // Check doors
                    for (const door of roomDoors) {
                        if (door.wallSide === bestMatch.wall.wallSide) {
                            const doorPos = door.position * wallLength;
                            const doorStart = doorPos - door.width / 2;
                            const doorEnd = doorPos + door.width / 2;

                            if (Math.max(currentStart, doorStart) < Math.min(currentEnd, doorEnd)) {
                                overlap = true;
                                break;
                            }
                        }
                    }

                    if (!overlap) {
                        // Check windows
                        for (const win of roomWindows) {
                            if (win.wallSide === bestMatch.wall.wallSide) {
                                const winPos = win.position * wallLength;
                                const winStart = winPos - win.width / 2;
                                const winEnd = winPos + win.width / 2;

                                if (Math.max(currentStart, winStart) < Math.min(currentEnd, winEnd)) {
                                    overlap = true;
                                    break;
                                }
                            }
                        }
                    }

                    if (overlap) {
                        setIsValid(false);
                        setValidationError('Overlaps with existing opening');
                    } else {
                        // Check against room height
                        const validation = validateWindow(WINDOW_DEFAULTS, room.height);

                        if (!validation.isValid) {
                            setIsValid(false);
                            setValidationError(validation.errors[0]);
                        } else {
                            setIsValid(true);
                            setValidationError(null);
                        }
                    }
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
        if (activeTool !== 'window' || !hoveredWall || !isValid || !currentFloorplan) return;

        const room = currentFloorplan.rooms.find(r => r.id === hoveredWall.roomId);
        if (!room) return;

        const newWindow = addWindow({
            ...WINDOW_DEFAULTS,
            roomId: room.id,
            wallSide: hoveredWall.wall.wallSide,
            position: hoveredWall.position,
        });

        selectWindow(newWindow.id);
        setTool('select');
    }, [activeTool, hoveredWall, isValid, currentFloorplan, addWindow, selectWindow, setTool]);

    return {
        isActive: activeTool === 'window',
        hoveredWall,
        isValid,
        validationError,
        handleMouseMove,
        handleClick
    };
}
