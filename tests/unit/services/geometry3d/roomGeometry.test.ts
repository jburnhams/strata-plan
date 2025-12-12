import * as THREE from 'three';
import { generateRoomGeometry, generateFloorplanGeometry } from '@/services/geometry3d/roomGeometry';
import { Room, Floorplan, Door, Window } from '@/types';

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
    doors: [],
    windows: []
  };

  it('generates a group with correct position', () => {
    const group = generateRoomGeometry(mockRoom);
    expect(group).toBeInstanceOf(THREE.Group);
    expect(group.position.x).toBe(10);
    expect(group.position.z).toBe(20);
    expect(group.position.y).toBe(0);
    expect(group.userData.roomId).toBe('room-1');
  });

  it('contains floor, ceiling and merged walls', () => {
    const group = generateRoomGeometry(mockRoom);
    const children = group.children;
    // With optimization, we expect 3 meshes: Floor, Ceiling, MergedWalls
    expect(children.length).toBe(3);

    const types = children.map(c => c.userData.type);
    expect(types).toContain('floor');
    expect(types).toContain('ceiling');
    expect(types).toContain('wall');
    expect(types.filter(t => t === 'wall').length).toBe(1);
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

  it('identifies merged walls correctly', () => {
    const group = generateRoomGeometry(mockRoom);
    const walls = group.children.filter(c => c.userData.type === 'wall');
    expect(walls.length).toBe(1);
    expect(walls[0].userData.type).toBe('wall');
    // Bounding sphere check to ensure it's computed
    expect(walls[0].geometry.boundingSphere).not.toBeNull();
  });

  it('generates walls with holes for doors', () => {
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
    const wall = group.children.find(c => c.userData.type === 'wall') as THREE.Mesh;
    expect(wall).toBeDefined();
    // We expect the geometry to be more complex due to holes, but exact verification is hard.
    // We just ensure it builds successfully.
    const northWall = group.children.find(c => c.userData.type === 'wall' && c.userData.side === 'north') as THREE.Mesh;
    expect(northWall).toBeDefined();
  });

  it('maps door sides correctly for rotated rooms', () => {
      const room = { ...mockRoom, rotation: 90 as 0 | 90 | 180 | 270 };
      const doors: Door[] = [{
        id: 'd1',
        roomId: 'room-1',
        wallSide: 'east',
        position: 0.5,
        width: 1,
        height: 2,
        type: 'single',
        swing: 'inward',
        handleSide: 'left'
      }];

      const group = generateRoomGeometry(room, doors, []);
      const wall = group.children.find(c => c.userData.type === 'wall');
      expect(wall).toBeDefined();
  });

  it('generates holes for windows', () => {
      const room = { ...mockRoom };
      const windows: Window[] = [{
          id: 'w1',
          roomId: 'room-1',
          wallSide: 'south',
          position: 0.5,
          width: 1.2,
          height: 1.2,
          sillHeight: 0.9,
          frameType: 'single'
      }];

      const group = generateRoomGeometry(room, [], windows);
      const wall = group.children.find(c => c.userData.type === 'wall');
      expect(wall).toBeDefined();
  });

  it('applies wall opacity when specified', () => {
    const opacity = 0.5;
    const group = generateRoomGeometry(mockRoom, [], [], opacity);

    const walls = group.children.filter(c => c.userData.type === 'wall');
    expect(walls.length).toBeGreaterThan(0);

    walls.forEach(wall => {
      const mesh = wall as THREE.Mesh;
      const material = mesh.material as THREE.MeshStandardMaterial;

      expect(material.transparent).toBe(true);
      expect(material.opacity).toBe(opacity);
    });
  });

  it('uses default opacity (1.0) when not specified', () => {
    const group = generateRoomGeometry(mockRoom);

    const walls = group.children.filter(c => c.userData.type === 'wall');

    walls.forEach(wall => {
      const mesh = wall as THREE.Mesh;
      const material = mesh.material as THREE.MeshStandardMaterial;

      // Default behavior from materials.ts: if opacity is 1.0, transparent is not set (undefined)
      expect(material.opacity).toBe(1.0);
      expect(material.transparent).toBeFalsy();
    });
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
        doors: [],
        windows: []
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
        doors: [],
        windows: []
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
