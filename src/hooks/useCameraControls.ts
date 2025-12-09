import React, { useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { Vector3, Box3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useFloorplanStore } from '../stores/floorplanStore';
import { getRoomBounds } from '../services/geometry/room';

export type CameraView = 'isometric' | 'top' | 'front' | 'side';

export interface UseCameraControlsReturn {
  setPresetView: (view: CameraView) => void;
  fitToView: () => void;
  zoom: (direction: 1 | -1) => void;
}

export const useCameraControls = (controlsRef: React.RefObject<OrbitControlsImpl | null>): UseCameraControlsReturn => {
  const camera = useThree((state) => state.camera);
  const rooms = useFloorplanStore(state => state.currentFloorplan?.rooms);

  const fitToView = useCallback(() => {
    if (!controlsRef.current || !rooms || rooms.length === 0) return;

    // Calculate bounding box of all rooms
    const box = new Box3();
    rooms.forEach(room => {
      const bounds = getRoomBounds(room);
      // Room bounds are usually 2D {minX, maxX, minZ, maxZ}
      // We need to convert to 3D. Assuming Y=0 is floor, height is room.height
      box.expandByPoint(new Vector3(bounds.minX, 0, bounds.minZ));
      box.expandByPoint(new Vector3(bounds.maxX, room.height, bounds.maxZ));
    });

    if (box.isEmpty()) return;

    const center = new Vector3();
    box.getCenter(center);

    const size = new Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);

    // Position camera to see everything
    const fov = (camera as any).fov * (Math.PI / 180);
    // Simple calculation to fit the object
    const cameraDistance = Math.abs(maxDim / Math.sin(fov / 2));

    // Maintain current direction but adjust distance
    const direction = new Vector3();
    camera.getWorldDirection(direction);

    // If direction is effectively zero or undefined, default to isometric-ish
    if (direction.lengthSq() < 0.0001) {
        direction.set(-1, -1, -1).normalize();
    }

    // Move camera back from center along the inverse of the view direction
    const position = center.clone().sub(direction.normalize().multiplyScalar(cameraDistance * 1.5)); // 1.5 padding

    camera.position.copy(position);
    controlsRef.current.target.copy(center);
    controlsRef.current.update();
  }, [camera, rooms, controlsRef]);

  const setPresetView = useCallback((view: CameraView) => {
    if (!controlsRef.current) return;

    const center = new Vector3(0, 0, 0);

    // Calculate center of the floorplan if rooms exist
    if (rooms && rooms.length > 0) {
       const box = new Box3();
       rooms.forEach(room => {
          const bounds = getRoomBounds(room);
          box.expandByPoint(new Vector3(bounds.minX, 0, bounds.minZ));
          box.expandByPoint(new Vector3(bounds.maxX, room.height, bounds.maxZ));
       });
       if (!box.isEmpty()) {
         box.getCenter(center);
       }
    }

    const distance = 20;

    // Calculate new position relative to center
    // We add a small offset to avoid singularities with OrbitControls
    const positions: Record<CameraView, Vector3> = {
      isometric: new Vector3(distance, distance, distance),
      top: new Vector3(0.01, distance, 0.01), // Almost top-down
      front: new Vector3(0.01, 5, distance),
      side: new Vector3(distance, 5, 0.01),
    };

    const offset = positions[view];
    const newPos = center.clone().add(offset);

    controlsRef.current.target.copy(center);
    camera.position.copy(newPos);
    controlsRef.current.update();

  }, [camera, controlsRef, rooms]);

  const zoom = useCallback((direction: 1 | -1) => {
    if (!controlsRef.current) return;

    // Zoom factor: 1 (in) -> 0.9, -1 (out) -> 1.1
    const factor = direction === 1 ? 0.9 : 1.1;

    const target = controlsRef.current.target;
    const offset = new Vector3().subVectors(camera.position, target);
    const distance = offset.length();

    let newDistance = distance * factor;

    // Clamp to min/max distance
    // Using simple defaults if limits are not set on controls (though they should be)
    const minDist = controlsRef.current.minDistance ?? 0;
    const maxDist = controlsRef.current.maxDistance ?? Infinity;

    newDistance = Math.max(minDist, Math.min(newDistance, maxDist));

    offset.setLength(newDistance);
    camera.position.copy(target).add(offset);
    controlsRef.current.update();
  }, [camera, controlsRef]);

  return {
    setPresetView,
    fitToView,
    zoom
  };
};
