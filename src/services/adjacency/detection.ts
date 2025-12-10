import { Room } from '../../types/room';
import { AdjacencyInfo, SharedWall } from '../../types/adjacency';
import { getRoomWallSegments } from '../geometry/room';
import { WallSegment } from '../../types/geometry';

const ADJACENCY_TOLERANCE = 0.01; // 1cm
const MIN_SHARED_LENGTH = 0.1; // 10cm

/**
 * Detects if two rooms are adjacent (share a wall segment)
 * Returns adjacency information or null if not adjacent
 */
export function detectAdjacency(room1: Room, room2: Room): AdjacencyInfo | null {
  const walls1 = getRoomWallSegments(room1);
  const walls2 = getRoomWallSegments(room2);

  for (const w1 of walls1) {
    for (const w2 of walls2) {
      const shared = checkSharedWall(w1, w2);
      if (shared) {
        return {
          room1Id: room1.id,
          room2Id: room2.id,
          sharedWall: shared,
        };
      }
    }
  }

  return null;
}

function checkSharedWall(w1: WallSegment, w2: WallSegment): SharedWall | null {
  // Determine orientation based on coordinates
  // Horizontal: Z is constant (delta Z is small)
  // Vertical: X is constant (delta X is small)
  const isHorizontal1 = Math.abs(w1.from.z - w1.to.z) < ADJACENCY_TOLERANCE;
  const isHorizontal2 = Math.abs(w2.from.z - w2.to.z) < ADJACENCY_TOLERANCE;

  // Check if walls are vertical (fallback if not horizontal)
  // We assume manhattan geometry (walls are either horiz or vert)
  // But explicitly checking protects against diagonal walls if they ever exist
  const isVertical1 = Math.abs(w1.from.x - w1.to.x) < ADJACENCY_TOLERANCE;
  const isVertical2 = Math.abs(w2.from.x - w2.to.x) < ADJACENCY_TOLERANCE;

  // Ensure walls are axis-aligned
  if ((!isHorizontal1 && !isVertical1) || (!isHorizontal2 && !isVertical2)) return null;

  // Must be same orientation
  if (isHorizontal1 !== isHorizontal2) return null;

  // Check alignment (distance between lines)
  let dist = 0;
  if (isHorizontal1) {
    // Horizontal: check Z difference
    dist = Math.abs(w1.from.z - w2.from.z);
  } else {
    // Vertical: check X difference
    dist = Math.abs(w1.from.x - w2.from.x);
  }

  if (dist > ADJACENCY_TOLERANCE) return null;

  // Check overlap
  let start1, end1, start2, end2;
  if (isHorizontal1) {
    // X axis projection
    start1 = Math.min(w1.from.x, w1.to.x);
    end1 = Math.max(w1.from.x, w1.to.x);
    start2 = Math.min(w2.from.x, w2.to.x);
    end2 = Math.max(w2.from.x, w2.to.x);
  } else {
    // Z axis projection
    start1 = Math.min(w1.from.z, w1.to.z);
    end1 = Math.max(w1.from.z, w1.to.z);
    start2 = Math.min(w2.from.z, w2.to.z);
    end2 = Math.max(w2.from.z, w2.to.z);
  }

  const overlapStart = Math.max(start1, start2);
  const overlapEnd = Math.min(end1, end2);
  const overlapLen = overlapEnd - overlapStart;

  if (overlapLen < MIN_SHARED_LENGTH) return null;

  // Calculate start/end position (0.0-1.0) along room1's wall
  const len1 = end1 - start1;
  // Theoretically len1 should be > 0 for a valid wall
  if (len1 === 0) return null;

  let w1StartVal, w1EndVal;

  if (isHorizontal1) {
    w1StartVal = w1.from.x;
    w1EndVal = w1.to.x;
  } else {
    w1StartVal = w1.from.z;
    w1EndVal = w1.to.z;
  }

  const totalDist = w1EndVal - w1StartVal;

  // Calculate t values for the overlap interval endpoints
  // t = (val - start) / (end - start)
  const t1 = (overlapStart - w1StartVal) / totalDist;
  const t2 = (overlapEnd - w1StartVal) / totalDist;

  // Normalize so sp < ep
  let sp = Math.min(t1, t2);
  let ep = Math.max(t1, t2);

  // Clamp to 0-1
  sp = Math.max(0, Math.min(1, sp));
  ep = Math.max(0, Math.min(1, ep));

  return {
    room1Wall: w1.wallSide,
    room2Wall: w2.wallSide,
    length: overlapLen,
    startPosition: sp,
    endPosition: ep,
  };
}
