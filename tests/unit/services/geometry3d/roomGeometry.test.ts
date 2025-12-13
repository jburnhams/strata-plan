import * as THREE from 'three';
import { generateRoomGeometry } from '../../../../src/services/geometry3d/roomGeometry';
import { Room, Door, Window } from '../../../../src/types';

// Mock THREE to avoid WebGL dependencies if needed, but for BufferGeometry/Shape it should be fine in node
// We might need to handle the fact that ShapeGeometry might not fully work without some polyfills if it uses canvas?
// Actually ShapeGeometry logic is mostly math.

describe('generateRoomGeometry', () => {
  const mockRoom: Room = {
    id: 'room-1',
    name: 'Test Room',
    type: 'bedroom',
    width: 4,
    length: 5,
    height: 2.5,
    position: { x: 0, z: 0 },
    rotation: 0,
    walls: [],
    floorMaterial: 'wood',
    wallMaterial: 'paint',
    ceilingMaterial: 'paint',
  };

  it('should generate a group with floor, ceiling and walls', () => {
    const group = generateRoomGeometry(mockRoom);
    expect(group).toBeInstanceOf(THREE.Group);
    expect(group.children.length).toBeGreaterThanOrEqual(3); // Floor, Ceiling, Walls
  });

  it('should create holes in walls for doors', () => {
    const door: Door = {
      id: 'door-1',
      roomId: 'room-1',
      wallSide: 'north',
      position: 0.5,
      width: 1,
      height: 2,
      type: 'single',
      swing: 'inward',
      handleSide: 'left',
      isExterior: false
    };

    const group = generateRoomGeometry(mockRoom, [door], [], { detailLevel: 'high' });
    const wallMesh = group.children.find(c => c.userData.type === 'wall') as THREE.Mesh;
    expect(wallMesh).toBeDefined();

    // It's hard to directly test "holes" on a BufferGeometry without inspecting vertices.
    // However, we can check if the geometry is created successfully.
    // A wall with a hole should have more vertices/triangles than a solid wall?
    // Or we can rely on manual verification via inspection if we trust THREE.ShapeGeometry.

    // For a solid wall (rect), ShapeGeometry usually has 2 triangles (6 vertices).
    // But here we merge 4 walls.
    // Solid room: 4 walls * 2 triangles = 8 triangles.

    // With a hole, the triangulation is more complex.

    const solidGroup = generateRoomGeometry(mockRoom, [], [], { detailLevel: 'high' });
    const solidWallMesh = solidGroup.children.find(c => c.userData.type === 'wall') as THREE.Mesh;

    expect(wallMesh.geometry.attributes.position.count).not.toBe(solidWallMesh.geometry.attributes.position.count);
  });
});
