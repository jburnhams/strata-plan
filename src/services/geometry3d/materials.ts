import * as THREE from 'three';
import { Room } from '../../types';
import {
  FLOOR_MATERIALS,
  WALL_MATERIALS,
  CEILING_MATERIALS
} from '../../constants/materialConfigs';

export interface MaterialFactoryOptions {
  quality: 'simple' | 'standard' | 'detailed';
  wallOpacity?: number; // 0.0 to 1.0
}

export interface RoomMaterials {
  floor: THREE.Material;
  walls: THREE.Material;
  ceiling: THREE.Material;
}

// Cache to store material instances
const materialCache = new Map<string, THREE.Material>();

export function clearMaterialCache() {
  materialCache.clear();
}

const createMaterial = (
  params: THREE.MeshStandardMaterialParameters,
  quality: MaterialFactoryOptions['quality'],
  cacheKey: string
): THREE.Material => {
  if (materialCache.has(cacheKey)) {
    return materialCache.get(cacheKey)!;
  }

  let material: THREE.Material;

  if (quality === 'simple') {
    const basicParams: THREE.MeshBasicMaterialParameters = {
      color: params.color,
      side: params.side,
    };

    if (params.transparent !== undefined) {
      basicParams.transparent = params.transparent;
    }
    if (params.opacity !== undefined) {
      basicParams.opacity = params.opacity;
    }

    material = new THREE.MeshBasicMaterial(basicParams);
  } else {
    // Standard and Detailed use MeshStandardMaterial for now
    material = new THREE.MeshStandardMaterial(params);
  }

  materialCache.set(cacheKey, material);
  return material;
};

export function createRoomMaterial(
  room: Room,
  options: MaterialFactoryOptions = { quality: 'standard' }
): RoomMaterials {
  const { quality, wallOpacity = 1.0 } = options;

  // --- Floor ---
  let floorColorStr = '#cccccc';
  let floorRoughness = 0.8;
  let floorReflectivity = 0.1;
  let floorId = 'default';

  if (room.customFloorColor) {
    floorColorStr = room.customFloorColor;
    floorId = 'custom-' + floorColorStr;
  } else if (room.floorMaterial && FLOOR_MATERIALS[room.floorMaterial]) {
    const config = FLOOR_MATERIALS[room.floorMaterial];
    floorColorStr = config.defaultColor;
    floorRoughness = config.roughness;
    floorReflectivity = config.reflectivity;
    floorId = config.id;
  } else if (room.color) {
    floorColorStr = room.color;
    floorId = 'legacy-' + floorColorStr;
  }

  const floorKey = `floor-${floorId}-${quality}-${floorColorStr}-${floorRoughness}-${floorReflectivity}`;
  const floorMaterial = createMaterial(
    {
      color: new THREE.Color(floorColorStr),
      side: THREE.DoubleSide,
      roughness: floorRoughness,
      metalness: floorReflectivity
    },
    quality,
    floorKey
  );

  // --- Walls ---
  let wallColorStr = '#eeeeee';
  let wallRoughness = 0.9;
  let wallId = 'default';

  if (room.customWallColor) {
    wallColorStr = room.customWallColor;
    wallId = 'custom-' + wallColorStr;
  } else if (room.wallMaterial && WALL_MATERIALS[room.wallMaterial]) {
    const config = WALL_MATERIALS[room.wallMaterial];
    wallColorStr = config.defaultColor;
    wallRoughness = config.roughness;
    wallId = config.id;
  } else if (room.color) {
    // Legacy behavior: use room color but lighter
    const c = new THREE.Color(room.color).offsetHSL(0, 0, 0.1);
    wallColorStr = '#' + c.getHexString();
    wallId = 'legacy-' + wallColorStr;
  }

  const isTransparent = wallOpacity < 1.0;
  const wallKey = `wall-${wallId}-${quality}-${wallColorStr}-${wallRoughness}-${wallOpacity}`;

  const wallParams: THREE.MeshStandardMaterialParameters = {
    color: new THREE.Color(wallColorStr),
    side: THREE.DoubleSide,
    roughness: wallRoughness,
    metalness: 0.0,
  };

  if (isTransparent) {
    wallParams.transparent = true;
    wallParams.opacity = wallOpacity;
  }

  const wallMaterial = createMaterial(
    wallParams,
    quality,
    wallKey
  );

  // --- Ceiling ---
  let ceilingColorStr = '#ffffff';
  let ceilingRoughness = 0.9;
  let ceilingId = 'default';

  if (room.customCeilingColor) {
    ceilingColorStr = room.customCeilingColor;
    ceilingId = 'custom-' + ceilingColorStr;
  } else if (room.ceilingMaterial && CEILING_MATERIALS[room.ceilingMaterial]) {
    const config = CEILING_MATERIALS[room.ceilingMaterial];
    ceilingColorStr = config.defaultColor;
    ceilingRoughness = config.roughness;
    ceilingId = config.id;
  }

  const ceilingKey = `ceiling-${ceilingId}-${quality}-${ceilingColorStr}-${ceilingRoughness}`;
  const ceilingMaterial = createMaterial(
    {
      color: new THREE.Color(ceilingColorStr),
      side: THREE.DoubleSide,
      roughness: ceilingRoughness,
      metalness: 0.0
    },
    quality,
    ceilingKey
  );

  return {
    floor: floorMaterial,
    walls: wallMaterial,
    ceiling: ceilingMaterial
  };
}
