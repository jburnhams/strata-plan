import * as THREE from 'three';
import { generateRoomGeometry, generateFloorplanGeometry } from '../../../../src/services/geometry3d/roomGeometry';
import { Room, Floorplan, Door } from '../../../../src/types';

describe('Room Geometry Generation', () => {
  const mockRoom: Room = {
    id: 'room-1',
    name: 'Living Room',
    length: 5,
    width: 4,
    height: 3,
    type: 'living',
    position: { x: 10, z: 20 },
    rotation: 0,
  };

  it('generates a group with correct position', () => {
    const group = generateRoomGeometry(mockRoom);
    expect(group).toBeInstanceOf(THREE.Group);
    expect(group.position.x).toBe(10);
    expect(group.position.z).toBe(20);
    expect(group.position.y).toBe(0);
    expect(group.userData.roomId).toBe('room-1');
  });

  it('contains floor, ceiling and 4 walls', () => {
    const group = generateRoomGeometry(mockRoom);
    const children = group.children;
    expect(children.length).toBe(6); // Floor, Ceiling, 4 Walls

    const types = children.map(c => c.userData.type);
    expect(types).toContain('floor');
    expect(types).toContain('ceiling');
    expect(types.filter(t => t === 'wall').length).toBe(4);
  });

  it('generates correct floor dimensions for 0 rotation', () => {
    const group = generateRoomGeometry(mockRoom);
    const floor = group.children.find(c => c.userData.type === 'floor') as THREE.Mesh;
    const geometry = floor.geometry as THREE.ShapeGeometry;
    geometry.computeBoundingBox();
    const size = new THREE.Vector3();
    geometry.boundingBox!.getSize(size);

    // For 0 rotation: X = length (5), Z = width (4)
    expect(size.x).toBeCloseTo(5);
    expect(size.z).toBeCloseTo(4);
  });

  it('swaps dimensions for 90 degree rotation', () => {
    const rotatedRoom = { ...mockRoom, rotation: 90 as 0 | 90 | 180 | 270 };
    const group = generateRoomGeometry(rotatedRoom);

    // For 90 deg rotation, length becomes Z-axis dimension, width becomes X-axis dimension
    // widthX = width (4), depthZ = length (5)

    const floor = group.children.find(c => c.userData.type === 'floor') as THREE.Mesh;
    const geometry = floor.geometry as THREE.ShapeGeometry;
    geometry.computeBoundingBox();
    const size = new THREE.Vector3();
    geometry.boundingBox!.getSize(size);

    expect(size.x).toBeCloseTo(4);
    expect(size.z).toBeCloseTo(5);
  });

  it('handles 180 degree rotation', () => {
    const rotatedRoom = { ...mockRoom, rotation: 180 as 0 | 90 | 180 | 270 };
    const group = generateRoomGeometry(rotatedRoom);

    // For 180, dimensions are same as 0 (L, W)
    const floor = group.children.find(c => c.userData.type === 'floor') as THREE.Mesh;
    const geometry = floor.geometry as THREE.ShapeGeometry;
    geometry.computeBoundingBox();
    const size = new THREE.Vector3();
    geometry.boundingBox!.getSize(size);

    expect(size.x).toBeCloseTo(5);
    expect(size.z).toBeCloseTo(4);
  });

  it('handles 270 degree rotation', () => {
    const rotatedRoom = { ...mockRoom, rotation: 270 as 0 | 90 | 180 | 270 };
    const group = generateRoomGeometry(rotatedRoom);

    // For 270, dimensions swapped (W, L)
    const floor = group.children.find(c => c.userData.type === 'floor') as THREE.Mesh;
    const geometry = floor.geometry as THREE.ShapeGeometry;
    geometry.computeBoundingBox();
    const size = new THREE.Vector3();
    geometry.boundingBox!.getSize(size);

    expect(size.x).toBeCloseTo(4);
    expect(size.z).toBeCloseTo(5);
  });

  it('identifies walls correctly', () => {
    const group = generateRoomGeometry(mockRoom);
    const walls = group.children.filter(c => c.userData.type === 'wall');

    const sides = walls.map(w => w.userData.side);
    expect(sides).toContain('north');
    expect(sides).toContain('south');
    expect(sides).toContain('east');
    expect(sides).toContain('west');
  });

  it('generates holes for doors', () => {
    // 0 rotation. North wall corresponds to Z=0 wall (Top).
    // Door on 'north' side.
    const room = { ...mockRoom };
    const doors: Door[] = [{
        id: 'd1',
        roomId: 'room-1',
        wallSide: 'north',
        position: 0.5,
        width: 1,
        height: 2,
        type: 'single',
        swing: 'inward',
        handleSide: 'left'
    }];

    const group = generateRoomGeometry(room, doors, []);
    const northWall = group.children.find(c => c.userData.type === 'wall' && c.userData.side === 'north') as THREE.Mesh;
    const geometry = northWall.geometry as THREE.ShapeGeometry;

    const pos = geometry.attributes.position;
    expect(pos.count).toBeGreaterThan(6);
  });
});

describe('Floorplan Geometry Generation', () => {
  const mockFloorplan: Floorplan = {
    id: 'fp-1',
    name: 'Test Plan',
    units: 'meters',
    rooms: [
      {
        id: 'r1',
        name: 'Room 1',
        length: 4,
        width: 3,
        height: 2.5,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      },
      {
        id: 'r2',
        name: 'Room 2',
        length: 5,
        width: 4,
        height: 2.5,
        type: 'living',
        position: { x: 5, z: 0 },
        rotation: 90,
      }
    ],
    connections: [],
    walls: [],
    doors: [],
    windows: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    version: '1.0.0'
  };

  it('generates a group containing all rooms', () => {
    const group = generateFloorplanGeometry(mockFloorplan);
    expect(group).toBeInstanceOf(THREE.Group);
    expect(group.children.length).toBe(2);
    expect(group.userData.floorplanId).toBe('fp-1');

    const roomIds = group.children.map(c => c.userData.roomId);
    expect(roomIds).toContain('r1');
    expect(roomIds).toContain('r2');
  });
});
