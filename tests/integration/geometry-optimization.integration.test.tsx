import * as THREE from 'three';
import { generateRoomGeometry } from '../../src/services/geometry3d/roomGeometry';
import { Room } from '../../src/types';

// Mock WebGLRenderer
jest.mock('three', () => {
  const original = jest.requireActual('three');
  return {
    ...original,
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      render: jest.fn(),
      setSize: jest.fn(),
      // Use standard object or createElement if available in scope, but safe way is:
      domElement: { style: {}, addEventListener: jest.fn(), removeEventListener: jest.fn() },
      dispose: jest.fn(),
      forceContextLoss: jest.fn(),
      info: {
        render: { calls: 0, triangles: 0 },
        memory: { geometries: 0, textures: 0 }
      },
      shadowMap: { enabled: false }
    }))
  };
});

describe('Geometry Optimization Integration', () => {
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

  it('generates optimized geometry with merged walls', () => {
    const group = generateRoomGeometry(mockRoom);

    // Check structure
    const meshes = group.children.filter(c => (c as THREE.Mesh).isMesh);
    const floor = meshes.find(m => m.userData.type === 'floor');
    const ceiling = meshes.find(m => m.userData.type === 'ceiling');
    const walls = meshes.find(m => m.userData.type === 'wall');

    expect(floor).toBeDefined();
    expect(ceiling).toBeDefined();
    expect(walls).toBeDefined();

    // Crucial check: Only ONE wall mesh object for all walls
    // Previously there were 4
    const allWalls = meshes.filter(m => m.userData.type === 'wall');
    expect(allWalls.length).toBe(1);

    // Check geometry type
    expect((walls as THREE.Mesh).geometry).toBeInstanceOf(THREE.BufferGeometry);
  });

  it('computes bounding sphere for merged geometry', () => {
    const group = generateRoomGeometry(mockRoom);
    const walls = group.children.find(m => m.userData.type === 'wall') as THREE.Mesh;

    expect(walls.geometry.boundingSphere).not.toBeNull();
    // Radius should be roughly half the diagonal of the room
    // Room 5x4x3. Diagonal ~ 7.
    // It depends on origin. The walls are centered around room.
    // We just check it's a valid number.
    expect(walls.geometry.boundingSphere!.radius).toBeGreaterThan(0);
  });
});
