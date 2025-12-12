import * as THREE from 'three';
import { Room } from '../../types';
import { FLOOR_MATERIALS, WALL_MATERIALS, CEILING_MATERIALS } from '../../constants/materialConfigs';

export interface MaterialFactoryOptions {
  quality: 'simple' | 'standard' | 'detailed';
  wallOpacity?: number; // 0.0 to 1.0
}

export interface RoomMaterials {
  floor: THREE.Material;
  walls: THREE.Material;
  ceiling: THREE.Material;
}

// Material cache
const materialCache = new Map<string, THREE.Material>();

// Texture cache
const textureLoader = new THREE.TextureLoader();
const textureCache = new Map<string, THREE.Texture>();

// Helper to get or create texture
const getTexture = (url: string): THREE.Texture | undefined => {
  if (!textureCache.has(url)) {
    // For now, assume textures are in public/textures/ if url is relative, or full path
    // If URL is missing, return undefined
    if (!url) return undefined;

    const texture = textureLoader.load(url);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    textureCache.set(url, texture);
  }
  return textureCache.get(url);
};

// Helper to create material based on quality
const createMaterial = (
  params: THREE.MeshStandardMaterialParameters,
  quality: MaterialFactoryOptions['quality'],
  textureUrl?: string,
  dimensions?: { width: number, height: number }
): THREE.Material => {
  // Try to load texture if available and quality is not simple
  if (quality !== 'simple' && textureUrl) {
    const texture = getTexture(textureUrl);
    if (texture) {
      params.map = texture;

      // Update texture repeat if dimensions provided
      if (dimensions) {
        // Assume texture is 1x1m tiling by default
        texture.repeat.set(dimensions.width, dimensions.height);
      }
    }
  }

  if (quality === 'simple') {
    // MeshBasicMaterial doesn't support roughness/metalness
    const basicParams: THREE.MeshBasicMaterialParameters = {
      color: params.color,
      side: params.side,
      map: params.map, // Basic material supports map
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
  // For detailed, we might want to add normal maps, etc later
  return new THREE.MeshStandardMaterial(params);
};

export function createRoomMaterial(
  room: Room,
  options: MaterialFactoryOptions = { quality: 'standard' }
): RoomMaterials {
  const { quality, wallOpacity = 1.0 } = options;
  const isTransparent = wallOpacity < 1.0;

  // --- Floor Material ---
  let floorColor: THREE.Color | string | number = 0xcccccc;
  let floorTextureUrl: string | undefined = undefined;
  let floorRoughness = 0.8;
  let floorMetalness = 0.1;

  if (room.customFloorColor) {
    floorColor = new THREE.Color(room.customFloorColor);
  } else if (room.floorMaterial && FLOOR_MATERIALS[room.floorMaterial]) {
    const config = FLOOR_MATERIALS[room.floorMaterial];
    floorColor = new THREE.Color(config.defaultColor);
    floorTextureUrl = config.textureUrl;
    floorRoughness = config.roughness;
    floorMetalness = config.reflectivity;
  } else if (room.color) {
    floorColor = new THREE.Color(room.color);
  }

  const floorMaterial = createMaterial(
    {
      color: floorColor,
      side: THREE.DoubleSide,
      roughness: floorRoughness,
      metalness: floorMetalness
    },
    quality,
    floorTextureUrl,
    { width: room.length, height: room.width } // Tile based on room dimensions
  );


  // --- Ceiling Material ---
  let ceilingColor: THREE.Color | string | number = 0xffffff;
  let ceilingTextureUrl: string | undefined = undefined;

  if (room.customCeilingColor) {
    ceilingColor = new THREE.Color(room.customCeilingColor);
  } else if (room.ceilingMaterial && CEILING_MATERIALS[room.ceilingMaterial]) {
    const config = CEILING_MATERIALS[room.ceilingMaterial];
    ceilingColor = new THREE.Color(config.defaultColor);
    ceilingTextureUrl = config.textureUrl;
  }

  const ceilingMaterial = createMaterial(
    {
      color: ceilingColor,
      side: THREE.DoubleSide,
      roughness: 0.9,
      metalness: 0.0
    },
    quality,
    ceilingTextureUrl,
    { width: room.length, height: room.width }
  );


  // --- Wall Material ---
  let wallColor: THREE.Color | string | number = 0xeeeeee;
  let wallTextureUrl: string | undefined = undefined;
  let wallRoughness = 0.9;

  if (room.customWallColor) {
    wallColor = new THREE.Color(room.customWallColor);
  } else if (room.wallMaterial && WALL_MATERIALS[room.wallMaterial]) {
    const config = WALL_MATERIALS[room.wallMaterial];
    wallColor = new THREE.Color(config.defaultColor);
    wallTextureUrl = config.textureUrl;
    wallRoughness = config.roughness;
  } else if (room.color) {
    // Clone and lighten (legacy fallback)
    wallColor = new THREE.Color(room.color).offsetHSL(0, 0, 0.1);
  }

  const wallParams: THREE.MeshStandardMaterialParameters = {
    color: wallColor,
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
    wallTextureUrl
    // Walls are tricky for UV mapping with merged geometry without explicit UVs per wall segment
    // For now we rely on world-space UVs or simple box mapping if we had it, but standard UVs might stretch.
    // Leaving dimensions undefined will default to 1x1 repetition of UV space which might stretch.
    // Addressing UV mapping for walls is a larger task (geometry generation).
  );

  return {
    floor: floorMaterial,
    walls: wallMaterial,
    ceiling: ceilingMaterial
  };
}
