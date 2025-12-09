import { useThree } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { MutableRefObject } from 'react';

// In R3F, we typically use the `useThree` hook inside a Canvas component.
// This hook abstracts that to provide a consistent interface as requested in the docs.
// Note: This hook MUST be used within a <Canvas> context.

export interface UseThreeSceneReturn {
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
  // Controls might be null if not yet initialized or ref not passed
  controls: OrbitControlsImpl | null;
}

export const useThreeScene = (controlsRef?: MutableRefObject<OrbitControlsImpl | null>): UseThreeSceneReturn => {
  const { scene, camera, gl } = useThree();

  return {
    scene,
    camera,
    renderer: gl,
    controls: controlsRef?.current || null,
  };
};
