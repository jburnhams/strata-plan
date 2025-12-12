import { jest } from '@jest/globals';
import * as THREE from 'three';
import { createRoomMaterial } from '@/services/geometry3d/materials';
import { Room } from '@/types';
import { FLOOR_MATERIALS, WALL_MATERIALS } from '@/constants/materialConfigs';

describe('Geometry3D Materials Service', () => {
  const mockRoom: Room = {
    id: 'room-1',
    name: 'Test Room',
    type: 'bedroom',
    length: 5,
    width: 4,
    height: 3,
    position: { x: 0, z: 0 },
    rotation: 0,
    floorMaterial: 'hardwood',
    wallMaterial: 'drywall-painted',
  } as Room;

  it('creates standard materials by default', () => {
    const materials = createRoomMaterial(mockRoom);

    expect(materials.floor).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect(materials.walls).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect(materials.ceiling).toBeInstanceOf(THREE.MeshStandardMaterial);
  });

  it('creates basic materials when quality is simple', () => {
    const materials = createRoomMaterial(mockRoom, { quality: 'simple' });

    expect(materials.floor).toBeInstanceOf(THREE.MeshBasicMaterial);
    expect(materials.walls).toBeInstanceOf(THREE.MeshBasicMaterial);
  });

  it('uses default colors from config', () => {
    const materials = createRoomMaterial(mockRoom);

    const floorMat = materials.floor as THREE.MeshStandardMaterial;
    const expectedColor = new THREE.Color(FLOOR_MATERIALS['hardwood'].defaultColor);

    expect(floorMat.color.getHex()).toBe(expectedColor.getHex());
  });

  it('overrides with custom floor color', () => {
    const customRoom = { ...mockRoom, customFloorColor: '#FF0000' };
    const materials = createRoomMaterial(customRoom);

    const floorMat = materials.floor as THREE.MeshStandardMaterial;
    expect(floorMat.color.getHexString()).toBe('ff0000');
  });

  it('overrides with custom wall color', () => {
    const customRoom = { ...mockRoom, customWallColor: '#00FF00' };
    const materials = createRoomMaterial(customRoom);

    const wallMat = materials.walls as THREE.MeshStandardMaterial;
    expect(wallMat.color.getHexString()).toBe('00ff00');
  });

  it('applies transparency to walls', () => {
    const materials = createRoomMaterial(mockRoom, { quality: 'standard', wallOpacity: 0.5 });

    const wallMat = materials.walls as THREE.MeshStandardMaterial;
    expect(wallMat.transparent).toBe(true);
    expect(wallMat.opacity).toBe(0.5);
  });
});
