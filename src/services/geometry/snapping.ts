import { Room, Position2D, Wall } from '../../types';
import { getRoomBounds } from './room';

export interface SnapGuide {
  type: 'horizontal' | 'vertical';
  offset: number; // The coordinate value (z for horizontal, x for vertical)
  start: number;
  end: number;
}

export interface SnapResult {
  position: Position2D;
  guides: SnapGuide[];
}

export interface WallSnapResult {
  position: Position2D;
  snappedTo: 'none' | 'endpoint' | 'grid' | 'angle';
  snapSource?: Position2D; // The point we snapped to (for endpoint)
}

/**
 * Calculates snap guides and adjusted position for a moving room
 */
export const getSnapGuides = (
  movingRoom: Room,
  otherRooms: Room[],
  proposedPosition: Position2D,
  snapTolerance: number = 0.2
): SnapResult => {
  // Create a temporary room object with proposed position to calculate bounds
  // We need to preserve rotation to get accurate bounds
  const tempRoom = { ...movingRoom, position: proposedPosition };
  const bounds = getRoomBounds(tempRoom);

  const width = bounds.maxX - bounds.minX;
  const depth = bounds.maxZ - bounds.minZ;

  // Define interest points for the moving room (Left, Center, Right / Top, Center, Bottom)
  const movingPointsX = [
    bounds.minX,
    bounds.minX + width / 2,
    bounds.maxX
  ];

  const movingPointsZ = [
    bounds.minZ,
    bounds.minZ + depth / 2,
    bounds.maxZ
  ];

  let bestDeltaX = 0;
  let minDistX = snapTolerance;
  let guideX: SnapGuide | null = null;

  let bestDeltaZ = 0;
  let minDistZ = snapTolerance;
  let guideZ: SnapGuide | null = null;

  for (const other of otherRooms) {
    if (other.id === movingRoom.id) continue;

    const otherBounds = getRoomBounds(other);
    const otherWidth = otherBounds.maxX - otherBounds.minX;
    const otherDepth = otherBounds.maxZ - otherBounds.minZ;

    const otherPointsX = [
      otherBounds.minX,
      otherBounds.minX + otherWidth / 2,
      otherBounds.maxX
    ];

    const otherPointsZ = [
      otherBounds.minZ,
      otherBounds.minZ + otherDepth / 2,
      otherBounds.maxZ
    ];

    // Check X alignments (Vertical guides)
    for (const mx of movingPointsX) {
      for (const ox of otherPointsX) {
        const dist = Math.abs(mx - ox);
        if (dist < minDistX) {
          minDistX = dist;
          bestDeltaX = ox - mx;

          // Create guide: vertical line at 'ox'
          // Spanning the Z range of both rooms combined
          const minZ = Math.min(bounds.minZ, otherBounds.minZ);
          const maxZ = Math.max(bounds.maxZ, otherBounds.maxZ);

          guideX = {
             type: 'vertical',
             offset: ox,
             start: minZ,
             end: maxZ
          };
        }
      }
    }

    // Check Z alignments (Horizontal guides)
    for (const mz of movingPointsZ) {
      for (const oz of otherPointsZ) {
        const dist = Math.abs(mz - oz);
        if (dist < minDistZ) {
          minDistZ = dist;
          bestDeltaZ = oz - mz;

          // Create guide: horizontal line at 'oz'
          // Spanning the X range of both rooms combined
          const minX = Math.min(bounds.minX, otherBounds.minX);
          const maxX = Math.max(bounds.maxX, otherBounds.maxX);

           guideZ = {
             type: 'horizontal',
             offset: oz,
             start: minX,
             end: maxX
          };
        }
      }
    }
  }

  // Calculate final position
  const snappedPos = {
      x: proposedPosition.x + bestDeltaX,
      z: proposedPosition.z + bestDeltaZ
  };

  const guides: SnapGuide[] = [];
  if (guideX) guides.push(guideX);
  if (guideZ) guides.push(guideZ);

  return {
      position: snappedPos,
      guides
  };
};

/**
 * Calculates snap points for wall drawing
 * Priority: Endpoint > Angle > Grid
 */
export const getWallSnapPoints = (
  currentPoint: Position2D,
  walls: Wall[],
  startPoint: Position2D | null = null,
  gridSize: number = 0.5,
  showGrid: boolean = true,
  snapTolerance: number = 0.3
): WallSnapResult => {
  // 1. Check for wall endpoints
  for (const wall of walls) {
    const endpoints = [wall.from, wall.to];
    for (const endpoint of endpoints) {
      const dist = Math.sqrt(
        Math.pow(currentPoint.x - endpoint.x, 2) +
        Math.pow(currentPoint.z - endpoint.z, 2)
      );

      if (dist < snapTolerance) {
        return {
          position: endpoint,
          snappedTo: 'endpoint',
          snapSource: endpoint
        };
      }
    }
  }

  // 2. Check for angle snapping if start point exists (0, 90 degrees)
  if (startPoint) {
    const dx = currentPoint.x - startPoint.x;
    const dz = currentPoint.z - startPoint.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    // Only snap angle if we've moved a bit
    if (dist > snapTolerance) {
      // Check proximity to axes (within ~10 degrees = 0.17 rad)
      const angleTolerance = 0.17;

      const isHorizontal = Math.abs(dz) < dist * Math.sin(angleTolerance); // Close to 0 or 180
      const isVertical = Math.abs(dx) < dist * Math.sin(angleTolerance); // Close to 90 or 270

      if (isHorizontal) {
        // Snap Z to match startPoint.z (make line perfectly horizontal)
        // If showGrid is true, we should snap X to grid
        const snappedX = showGrid
          ? Math.round(currentPoint.x / gridSize) * gridSize
          : currentPoint.x;

        return {
          position: { x: snappedX, z: startPoint.z },
          snappedTo: 'angle'
        };
      }

      if (isVertical) {
        // Snap X to match startPoint.x (make line perfectly vertical)
        // If showGrid is true, we should snap Z to grid
        const snappedZ = showGrid
          ? Math.round(currentPoint.z / gridSize) * gridSize
          : currentPoint.z;

        return {
          position: { x: startPoint.x, z: snappedZ },
          snappedTo: 'angle'
        };
      }
    }
  }

  // 3. Grid snapping
  if (showGrid) {
    const snappedX = Math.round(currentPoint.x / gridSize) * gridSize;
    const snappedZ = Math.round(currentPoint.z / gridSize) * gridSize;

    return {
      position: { x: snappedX, z: snappedZ },
      snappedTo: 'grid'
    };
  }

  // 4. No snapping
  return {
    position: currentPoint,
    snappedTo: 'none'
  };
};
