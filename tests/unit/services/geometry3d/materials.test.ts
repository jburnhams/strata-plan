import * as THREE from 'three';
import { createRoomMaterial } from '@/services/geometry3d/materials';
import { Room } from '@/types';

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

  it('uses room color for floor', () => {
    const coloredRoom = { ...mockRoom, color: '#ff0000' };
    const materials = createRoomMaterial(coloredRoom);

    const floorMat = materials.floor as THREE.MeshStandardMaterial;
    expect(floorMat.color.getHexString()).toBe('ff0000');
  });

  it('derives wall color from room color', () => {
    const coloredRoom = { ...mockRoom, color: '#ff0000' };
    const materials = createRoomMaterial(coloredRoom);

    const wallMat = materials.walls as THREE.MeshStandardMaterial;
    // Should be lighter than pure red
    // We expect the color to change. The exact value depends on Three.js impl
    expect(wallMat.color.getHexString()).not.toBe('ff0000');
    // Verify it is still somewhat red (Hue 0)
    const hsl = { h: 0, s: 0, l: 0 };
    wallMat.color.getHSL(hsl);
    expect(hsl.h).toBeCloseTo(0, 1); // Hue should be 0 (red)
    expect(hsl.l).toBeGreaterThan(0.5); // Lightness should be > 0.5 (original red)
  });

  it('applies transparency to walls', () => {
    const materials = createRoomMaterial(mockRoom, { quality: 'standard', wallOpacity: 0.5 });

    const wallMat = materials.walls as THREE.MeshStandardMaterial;
    expect(wallMat.transparent).toBe(true);
    expect(wallMat.opacity).toBe(0.5);

    // Floor and ceiling should remain opaque
    expect(materials.floor.transparent).toBe(false); // Default false for standard material unless specified
    expect((materials.floor as THREE.MeshStandardMaterial).opacity).toBe(1);
  });

  it('handles default opacity correctly', () => {
     const materials = createRoomMaterial(mockRoom, { quality: 'standard' });
     const wallMat = materials.walls as THREE.MeshStandardMaterial;
     // transparent defaults to false in threejs unless set
     expect(wallMat.transparent).toBe(false);
     expect(wallMat.opacity).toBe(1);
  });
});
