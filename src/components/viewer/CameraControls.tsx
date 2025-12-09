import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';

export interface CameraControlsProps {
  minDistance?: number;
  maxDistance?: number;
  minPolarAngle?: number;
  maxPolarAngle?: number;
  enableDamping?: boolean;
}

export interface CameraControlsRef {
  reset: () => void;
  setPreset: (view: 'isometric' | 'top' | 'front' | 'side') => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToView: (box: THREE.Box3) => void;
}

export const CameraControls = forwardRef<CameraControlsRef, CameraControlsProps>(({
  minDistance = 2,
  maxDistance = 100,
  minPolarAngle = 0.1,
  maxPolarAngle = Math.PI / 2 - 0.1,
  enableDamping = true
}, ref) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (controlsRef.current) {
        controlsRef.current.reset();
        // Reset to default isometric position
        camera.position.set(10, 10, 10);
        controlsRef.current.update();
      }
    },
    setPreset: (view) => {
      const controls = controlsRef.current;
      if (!controls) return;

      const target = controls.target.clone();
      const distance = camera.position.distanceTo(target);

      switch (view) {
        case 'isometric':
          camera.position.set(target.x + distance * 0.577, target.y + distance * 0.577, target.z + distance * 0.577);
          break;
        case 'top':
          camera.position.set(target.x, target.y + distance, target.z);
          break;
        case 'front':
          camera.position.set(target.x, target.y, target.z + distance);
          break;
        case 'side':
          camera.position.set(target.x + distance, target.y, target.z);
          break;
      }
      controls.update();
    },
    zoomIn: () => {
      if (controlsRef.current) {
        // Zoom logic relies on Dolly which OrbitControls handles internally via mouse/touch
        // Programmatic zoom can be done by moving camera closer
        const direction = new THREE.Vector3().subVectors(controlsRef.current.target, camera.position).normalize();
        camera.position.add(direction.multiplyScalar(2)); // Zoom step
        controlsRef.current.update();
      }
    },
    zoomOut: () => {
      if (controlsRef.current) {
        const direction = new THREE.Vector3().subVectors(controlsRef.current.target, camera.position).normalize();
        camera.position.sub(direction.multiplyScalar(2)); // Zoom step
        controlsRef.current.update();
      }
    },
    fitToView: (box: THREE.Box3) => {
       // Advanced implementation would fit box to frustum
       // For now, simple center and distance check
       const center = new THREE.Vector3();
       box.getCenter(center);
       const size = new THREE.Vector3();
       box.getSize(size);
       const maxDim = Math.max(size.x, size.y, size.z);
       const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
       let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
       cameraZ *= 1.5; // Padding

       camera.position.set(center.x + cameraZ, center.y + cameraZ, center.z + cameraZ);
       if (controlsRef.current) {
         controlsRef.current.target.copy(center);
         controlsRef.current.update();
       }
    }
  }));

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      minDistance={minDistance}
      maxDistance={maxDistance}
      minPolarAngle={minPolarAngle}
      maxPolarAngle={maxPolarAngle}
      enableDamping={enableDamping}
      dampingFactor={0.05}
    />
  );
});

CameraControls.displayName = "CameraControls";
