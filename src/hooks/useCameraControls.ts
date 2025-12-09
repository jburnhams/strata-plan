import { useState, useCallback } from 'react';
import * as THREE from 'three';

// Hook to manage camera state outside of the canvas if needed,
// or simply to provide typed presets and constants.

export type CameraViewPreset = 'isometric' | 'top' | 'front' | 'side';

export const useCameraControls = () => {
  const [currentView, setCurrentView] = useState<CameraViewPreset>('isometric');

  const getPresetPosition = useCallback((preset: CameraViewPreset, target: THREE.Vector3, distance: number): THREE.Vector3 => {
    const pos = new THREE.Vector3();
    switch (preset) {
      case 'isometric':
        // 45 degrees
        const isoDist = distance / Math.sqrt(3);
        pos.set(target.x + isoDist, target.y + isoDist, target.z + isoDist);
        break;
      case 'top':
        pos.set(target.x, target.y + distance, target.z);
        break;
      case 'front':
        // Assuming South to North is +Z to -Z? Or standard 3D?
        // Let's assume Front is looking along -Z axis (from +Z)
        pos.set(target.x, target.y, target.z + distance);
        break;
      case 'side':
        // Looking from West to East (+X to -X) or vice versa.
        // Let's assume Side is looking from +X
        pos.set(target.x + distance, target.y, target.z);
        break;
    }
    return pos;
  }, []);

  return {
    currentView,
    setCurrentView,
    getPresetPosition
  };
};
