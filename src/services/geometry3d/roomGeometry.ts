import * as THREE from 'three';
import { Room, Floorplan, Door, Window } from '../../types';
import { WallSide } from '../../types/geometry';
import { createRoomMaterial } from './materials';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export interface RoomGeometryOptions {
  wallOpacity?: number;
  detailLevel?: 'high' | 'low';
}

/**
 * Generate a 3D group representing a room, including floor, ceiling, and walls.
 * @param room The room to generate geometry for
 * @param doors List of all doors in the floorplan (will be filtered by roomId)
 * @param windows List of all windows in the floorplan (will be filtered by roomId)
 * @param options Options for geometry generation
 * @returns A THREE.Group containing the room parts
 */
export function generateRoomGeometry(
  room: Room,
  doors: Door[] = [],
  windows: Window[] = [],
  options: RoomGeometryOptions = {}
): THREE.Group {
  const { wallOpacity = 1.0, detailLevel = 'high' } = options;
  const group = new THREE.Group();

  // Calculate effective dimensions based on rotation
  const isRotated = room.rotation === 90 || room.rotation === 270;
  const widthX = isRotated ? room.width : room.length;
  const depthZ = isRotated ? room.length : room.width;
  const height = room.height;

  group.position.set(room.position.x, 0, room.position.z);
  group.userData = { roomId: room.id, type: 'room' };

  // Filter doors/windows for this room
  const roomDoors = doors.filter(d => d.roomId === room.id);
  const roomWindows = windows.filter(w => w.roomId === room.id);

  // Helper to create a rectangular shape with holes for doors/windows
  // side: 'north' | 'south' | 'east' | 'west' referring to the PHYSICAL side of the AABB
  const createWallShape = (w: number, h: number, side: WallSide) => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(w, 0);
    shape.lineTo(w, h);
    shape.lineTo(0, h);
    shape.lineTo(0, 0);

    // Only add holes if detail level is high
    if (detailLevel === 'high') {
      // Map the PHYSICAL side (which we are generating) to the LOGICAL side (in room data).
      let mappedSide: WallSide = side;

      switch (room.rotation) {
        case 0:
          if (side === 'north') mappedSide = 'north';
          if (side === 'south') mappedSide = 'south';
          if (side === 'west') mappedSide = 'west';
          if (side === 'east') mappedSide = 'east';
          break;
        case 90:
          if (side === 'north') mappedSide = 'east';
          if (side === 'south') mappedSide = 'west';
          if (side === 'west') mappedSide = 'north';
          if (side === 'east') mappedSide = 'south';
          break;
        case 180:
          if (side === 'north') mappedSide = 'south';
          if (side === 'south') mappedSide = 'north';
          if (side === 'west') mappedSide = 'east';
          if (side === 'east') mappedSide = 'west';
          break;
        case 270:
          if (side === 'north') mappedSide = 'west';
          if (side === 'south') mappedSide = 'east';
          if (side === 'west') mappedSide = 'south';
          if (side === 'east') mappedSide = 'north';
          break;
      }

      const sideDoors = roomDoors.filter(d => d.wallSide === mappedSide);
      const sideWindows = roomWindows.filter(w => w.wallSide === mappedSide);

      // We invert the position (1-pos) because we generate walls with "Outward" normals,
      // which corresponds to traversing the perimeter in reverse (CCW vs CW) or simply
      // looking at the wall from the outside where Left/Right is reversed compared to segment direction.
      const addHole = (centerRel: number, width: number, height: number, y: number) => {
         const hole = new THREE.Path();
         const correctedRel = 1 - centerRel;
         const x = correctedRel * w;
         const xMin = x - width / 2;
         const xMax = x + width / 2;
         const yMin = y;
         const yMax = y + height;

         hole.moveTo(xMin, yMin);
         hole.lineTo(xMax, yMin);
         hole.lineTo(xMax, yMax);
         hole.lineTo(xMin, yMax);
         hole.lineTo(xMin, yMin);
         shape.holes.push(hole);
      };

      sideDoors.forEach(door => {
          addHole(door.position, door.width, door.height, 0);
      });

      sideWindows.forEach(window => {
          addHole(window.position, window.width, window.height, window.sillHeight);
      });
    }

    return shape;
  };

  // Create materials
  const materials = createRoomMaterial(room, { quality: 'standard', wallOpacity });

  // --- Floor ---
  const floorShape = new THREE.Shape();
  floorShape.moveTo(0, 0);
  floorShape.lineTo(widthX, 0);
  floorShape.lineTo(widthX, depthZ);
  floorShape.lineTo(0, depthZ);
  floorShape.lineTo(0, 0);

  const floorGeometry = new THREE.ShapeGeometry(floorShape);
  // Rotate X 90 to face -Y (Down, Outward)
  floorGeometry.rotateX(Math.PI / 2);

  const floorMesh = new THREE.Mesh(
    floorGeometry,
    materials.floor
  );
  floorMesh.userData = { type: 'floor', roomId: room.id };
  floorMesh.receiveShadow = true;
  group.add(floorMesh);

  // --- Ceiling ---
  const ceilingGeometry = new THREE.ShapeGeometry(floorShape); // Use clean geometry
  // Rotate X -90 to face +Y (Up, Outward)
  ceilingGeometry.rotateX(-Math.PI / 2);
  // Translate to height, and shift Z by depthZ because rotation -90 flips Z
  ceilingGeometry.translate(0, height, depthZ);

  const ceilingMesh = new THREE.Mesh(
    ceilingGeometry,
    materials.ceiling
  );
  ceilingMesh.userData = { type: 'ceiling', roomId: room.id };
  group.add(ceilingMesh);

  // --- Walls ---
  const wallGeometries: THREE.BufferGeometry[] = [];

  // North (Back): Min Z. Normal -Z.
  const northWallShape = createWallShape(widthX, height, 'north');
  const northWallGeo = new THREE.ShapeGeometry(northWallShape);
  // Face -Z. Rotate Y 180. Translate X by W.
  northWallGeo.rotateY(Math.PI);
  northWallGeo.translate(widthX, 0, 0);
  wallGeometries.push(northWallGeo);

  // South (Front): Max Z. Normal +Z.
  const southWallShape = createWallShape(widthX, height, 'south');
  const southWallGeo = new THREE.ShapeGeometry(southWallShape);
  // Face +Z. Translate Z by D.
  southWallGeo.translate(0, 0, depthZ);
  wallGeometries.push(southWallGeo);

  // West (Left): Min X. Normal -X.
  const westWallShape = createWallShape(depthZ, height, 'west');
  const westWallGeo = new THREE.ShapeGeometry(westWallShape);
  // Face -X. Rotate Y -90.
  westWallGeo.rotateY(-Math.PI / 2);
  wallGeometries.push(westWallGeo);

  // East (Right): Max X. Normal +X.
  const eastWallShape = createWallShape(depthZ, height, 'east');
  const eastWallGeo = new THREE.ShapeGeometry(eastWallShape);
  // Face +X. Rotate Y 90. Translate X by W. Translate Z by D.
  eastWallGeo.rotateY(Math.PI / 2);
  eastWallGeo.translate(widthX, 0, depthZ);
  wallGeometries.push(eastWallGeo);

  // Merge wall geometries
  if (wallGeometries.length > 0) {
    const mergedWallGeo = BufferGeometryUtils.mergeGeometries(wallGeometries);
    // Dispose intermediate geometries
    wallGeometries.forEach(g => g.dispose());

    // Compute bounding sphere for culling
    mergedWallGeo.computeBoundingSphere();

    const wallsMesh = new THREE.Mesh(mergedWallGeo, materials.walls);
    wallsMesh.userData = { type: 'wall', roomId: room.id };
    wallsMesh.castShadow = true;
    wallsMesh.receiveShadow = true;
    group.add(wallsMesh);
  }

  return group;
}

/**
 * Generate a 3D group representing the entire floorplan.
 * @param floorplan The floorplan to generate geometry for
 * @returns A THREE.Group containing all rooms
 */
export function generateFloorplanGeometry(floorplan: Floorplan): THREE.Group {
  const group = new THREE.Group();
  group.userData = { floorplanId: floorplan.id, type: 'floorplan' };

  floorplan.rooms.forEach(room => {
    // Pass default options
    const roomGroup = generateRoomGeometry(room, floorplan.doors, floorplan.windows);
    group.add(roomGroup);
  });

  return group;
}
