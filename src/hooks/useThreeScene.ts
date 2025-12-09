import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { Color, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import type { OrbitControls } from 'three-stdlib';

export interface UseThreeSceneReturn {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  controls: OrbitControls | null;
}

/**
 * Hook to access and configure the Three.js scene.
 * Must be used inside a <Canvas> component.
 */
export const useThreeScene = (): UseThreeSceneReturn => {
  const state = useThree();

  const scene = state.scene;
  const camera = state.camera;
  const renderer = state.gl;
  const controls = state.controls;

  useEffect(() => {
    // 5.1.4 Initialize Three.js scene: Scene with background color
    // We use a light gray background as a sensible default
    scene.background = new Color('#f5f5f5');
  }, [scene]);

  return {
    scene,
    camera: camera as PerspectiveCamera,
    renderer,
    controls: controls as unknown as OrbitControls | null,
  };
};
