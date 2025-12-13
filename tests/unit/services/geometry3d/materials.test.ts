import * as THREE from 'three';
import { createRoomMaterial, clearMaterialCache } from '@/services/geometry3d/materials';
import { Room } from '@/types';
import { FLOOR_MATERIALS, WALL_MATERIALS, CEILING_MATERIALS } from '@/constants/materialConfigs';

describe('materials', () => {
  const mockRoom: Room = {
    id: 'room-1',
    name: 'Test Room',
    length: 5,
    width: 4,
    height: 2.5,
    type: 'bedroom',
    position: { x: 0, z: 0 },
    rotation: 0,
    doors: [],
    windows: []
  };

  beforeEach(() => {
    clearMaterialCache();
  });

  it('creates standard materials by default', () => {
    const materials = createRoomMaterial(mockRoom);

    expect(materials.floor).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect(materials.walls).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect(materials.ceiling).toBeInstanceOf(THREE.MeshStandardMaterial);
  });

  it('creates basic materials for simple quality', () => {
    const materials = createRoomMaterial(mockRoom, { quality: 'simple' });

    expect(materials.floor).toBeInstanceOf(THREE.MeshBasicMaterial);
    expect(materials.walls).toBeInstanceOf(THREE.MeshBasicMaterial);
    expect(materials.ceiling).toBeInstanceOf(THREE.MeshBasicMaterial);
  });

  it('uses specific material configuration when defined', () => {
    const roomWithMaterials: Room = {
      ...mockRoom,
      floorMaterial: 'tile-ceramic',
      wallMaterial: 'brick-red',
      ceilingMaterial: 'wood-beam'
    };

    const materials = createRoomMaterial(roomWithMaterials);

    const floorMat = materials.floor as THREE.MeshStandardMaterial;
    const wallMat = materials.walls as THREE.MeshStandardMaterial;
    const ceilingMat = materials.ceiling as THREE.MeshStandardMaterial;

    // Check colors match the config
    expect('#' + floorMat.color.getHexString()).toBe(FLOOR_MATERIALS['tile-ceramic'].defaultColor.toLowerCase());
    expect('#' + wallMat.color.getHexString()).toBe(WALL_MATERIALS['brick-red'].defaultColor.toLowerCase());
    expect('#' + ceilingMat.color.getHexString()).toBe(CEILING_MATERIALS['wood-beam'].defaultColor.toLowerCase());
  });

  it('prioritizes custom colors over material configuration', () => {
    const customColor = '#123456';
    const roomWithCustomColors: Room = {
      ...mockRoom,
      floorMaterial: 'tile-ceramic',
      customFloorColor: customColor,
      wallMaterial: 'brick-red',
      customWallColor: customColor,
      ceilingMaterial: 'wood-beam',
      customCeilingColor: customColor
    };

    const materials = createRoomMaterial(roomWithCustomColors);

    const floorMat = materials.floor as THREE.MeshStandardMaterial;
    const wallMat = materials.walls as THREE.MeshStandardMaterial;
    const ceilingMat = materials.ceiling as THREE.MeshStandardMaterial;

    expect(floorMat.color.getHexString()).toBe(customColor.replace('#', ''));
    expect(wallMat.color.getHexString()).toBe(customColor.replace('#', ''));
    expect(ceilingMat.color.getHexString()).toBe(customColor.replace('#', ''));
  });

  it('applies transparency to walls', () => {
    const materials = createRoomMaterial(mockRoom, { quality: 'standard', wallOpacity: 0.5 });

    const wallMat = materials.walls as THREE.MeshStandardMaterial;
    expect(wallMat.transparent).toBe(true);
    expect(wallMat.opacity).toBe(0.5);

    // Floor and ceiling should remain opaque
    expect(materials.floor.transparent).toBe(false);
    expect((materials.floor as THREE.MeshStandardMaterial).opacity).toBe(1);
  });

  it('caches materials and returns the same instance for identical configurations', () => {
    const materials1 = createRoomMaterial(mockRoom);
    const materials2 = createRoomMaterial(mockRoom);

    expect(materials1.floor).toBe(materials2.floor);
    expect(materials1.walls).toBe(materials2.walls);
    expect(materials1.ceiling).toBe(materials2.ceiling);
  });

  it('returns different materials for different configurations', () => {
    const materials1 = createRoomMaterial(mockRoom);

    const otherRoom: Room = { ...mockRoom, floorMaterial: 'carpet' };
    const materials2 = createRoomMaterial(otherRoom);

    expect(materials1.floor).not.toBe(materials2.floor);
  });
});
