import * as THREE from 'three';
import { Room } from '../../types';

export interface MaterialFactoryOptions {
  quality: 'simple' | 'standard' | 'detailed';
  wallOpacity?: number; // 0.0 to 1.0
}

export interface RoomMaterials {
  floor: THREE.Material;
  walls: THREE.Material;
  ceiling: THREE.Material;
}

// Helper to create material based on quality
const createMaterial = (
  params: THREE.MeshStandardMaterialParameters,
  quality: MaterialFactoryOptions['quality']
): THREE.Material => {
  if (quality === 'simple') {
    // MeshBasicMaterial doesn't support roughness/metalness
    const basicParams: THREE.MeshBasicMaterialParameters = {
      color: params.color,
      side: params.side,
    };

    // Only set transparent/opacity if they are defined in params
    if (params.transparent !== undefined) {
      basicParams.transparent = params.transparent;
    }
    if (params.opacity !== undefined) {
      basicParams.opacity = params.opacity;
    }

    return new THREE.MeshBasicMaterial(basicParams);
  }

  // Standard and Detailed use MeshStandardMaterial for now
  return new THREE.MeshStandardMaterial(params);
};

export function createRoomMaterial(
  room: Room,
  options: MaterialFactoryOptions = { quality: 'standard' }
): RoomMaterials {
  const { quality, wallOpacity = 1.0 } = options;
  const isTransparent = wallOpacity < 1.0;

  // Floor Material
  // Use room color if available, otherwise default gray
  const floorColor = room.color ? new THREE.Color(room.color) : new THREE.Color(0xcccccc);
  const floorMaterial = createMaterial(
    {
      color: floorColor,
      side: THREE.DoubleSide,
      roughness: 0.8,
      metalness: 0.1
    },
    quality
  );

  // Ceiling Material
  // Usually white
  const ceilingMaterial = createMaterial(
    {
      color: 0xffffff,
      side: THREE.DoubleSide,
      roughness: 0.9,
      metalness: 0.0
    },
    quality
  );

  // Wall Material
  let wallColor = new THREE.Color(0xeeeeee);
  if (room.color) {
    // Clone and lighten
    // offsetHSL adds to existing HSL values.
    // If HSL(0, 1, 0.5) + (0, 0, 0.1) = HSL(0, 1, 0.6)
    wallColor = new THREE.Color(room.color).offsetHSL(0, 0, 0.1);
  }

  const wallParams: THREE.MeshStandardMaterialParameters = {
    color: wallColor,
    side: THREE.DoubleSide,
    roughness: 0.9,
    metalness: 0.0,
  };

  if (isTransparent) {
    wallParams.transparent = true;
    wallParams.opacity = wallOpacity;
  }

  const wallMaterial = createMaterial(
    wallParams,
    quality
  );

  return {
    floor: floorMaterial,
    walls: wallMaterial,
    ceiling: ceilingMaterial
  };
}
