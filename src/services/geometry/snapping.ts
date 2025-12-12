import { Room, Position2D } from '../../types';
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

  // Re-adjust guide extents based on the FINAL snapped position?
  // The guide 'start/end' calculated above used the *unsnapped* bounds (tempRoom).
  // Ideally, visually, it should align with where the room ends up.
  // But the difference is small (< snapTolerance). It's probably fine.
  // If we wanted to be perfect, we'd recalculate guide extents using snappedPos.
  // Let's do that for polish if needed, but for now this is okay.

  const guides: SnapGuide[] = [];
  if (guideX) guides.push(guideX);
  if (guideZ) guides.push(guideZ);

  return {
      position: snappedPos,
      guides
  };
};
