import * as THREE from 'three';
import { generateRoomGeometry } from '../../../../src/services/geometry3d/roomGeometry';
import { Room } from '../../../../src/types';

describe('Room Geometry Generation - LOD', () => {
  const mockRoom: Room = {
    id: 'room-1',
    name: 'Living Room',
    length: 5,
    width: 4,
    height: 3,
    type: 'living',
    position: { x: 0, z: 0 },
    rotation: 0,
    doors: [],
    windows: []
  };

  it('uses MeshBasicMaterial for low detail level', () => {
    const group = generateRoomGeometry(mockRoom, [], [], { detailLevel: 'low' });

    group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        // The material might be an array or single
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach(mat => {
             expect(mat).toBeInstanceOf(THREE.MeshBasicMaterial);
        });
      }
    });
  });

  it('uses MeshStandardMaterial for high detail level', () => {
    const group = generateRoomGeometry(mockRoom, [], [], { detailLevel: 'high' });

    group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach(mat => {
             expect(mat).toBeInstanceOf(THREE.MeshStandardMaterial);
        });
      }
    });
  });

  it('defaults to MeshStandardMaterial if detail level is not specified', () => {
    const group = generateRoomGeometry(mockRoom, [], []);

    group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach(mat => {
             expect(mat).toBeInstanceOf(THREE.MeshStandardMaterial);
        });
      }
    });
  });
});
