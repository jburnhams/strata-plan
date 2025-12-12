import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Constants
const MOVE_SPEED = 2.0; // m/s
const RUN_SPEED = 4.0; // m/s
const EYE_HEIGHT = 1.6; // m
const COLLISION_DISTANCE = 0.5; // m

export const useFirstPerson = (isEnabled: boolean) => {
  const { camera, scene } = useThree();

  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const moveLeft = useRef(false);
  const moveRight = useRef(false);
  const isRunning = useRef(false);

  // Collision raycaster
  const raycaster = useRef(new THREE.Raycaster());

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isEnabled) return;

      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          moveForward.current = true;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          moveLeft.current = true;
          break;
        case 'ArrowDown':
        case 'KeyS':
          moveBackward.current = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          moveRight.current = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          isRunning.current = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!isEnabled) return;

      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          moveForward.current = false;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          moveLeft.current = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          moveBackward.current = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          moveRight.current = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          isRunning.current = false;
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isEnabled]);

  // Initial positioning when enabling
  useEffect(() => {
    if (isEnabled) {
      // Find a safe starting spot or just use current if reasonable
      // For now, ensure we are at eye height
      camera.position.y = Math.max(camera.position.y, EYE_HEIGHT);
      camera.lookAt(new THREE.Vector3(0, EYE_HEIGHT, 0));
    }
  }, [isEnabled, camera]);

  useFrame((state, delta) => {
    if (!isEnabled) return;

    // Calculate speed
    const speed = isRunning.current ? RUN_SPEED : MOVE_SPEED;

    // Determine movement direction relative to camera
    const forwardVector = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forwardVector.y = 0; // Lock movement to XZ plane
    forwardVector.normalize();

    const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    rightVector.y = 0;
    rightVector.normalize();

    // Calculate proposed movement vector
    const moveVector = new THREE.Vector3(0, 0, 0);

    if (moveForward.current) moveVector.add(forwardVector);
    if (moveBackward.current) moveVector.sub(forwardVector);
    if (moveRight.current) moveVector.add(rightVector);
    if (moveLeft.current) moveVector.sub(rightVector);

    if (moveVector.lengthSq() > 0) {
      moveVector.normalize().multiplyScalar(speed * delta);

      // --- Collision Detection ---
      // Raycast in the direction of movement
      const rayDir = moveVector.clone().normalize();
      raycaster.current.set(camera.position, rayDir);
      raycaster.current.far = COLLISION_DISTANCE;

      // Filter objects to intersect: we only care about meshes (walls)
      // We explicitly exclude objects that are not walls to avoid floor sticking
      // This is a naive heuristic: assume "Scene" contains "Group" (Rooms) which contain "Mesh" (Walls)
      // We can also check if the object is visible

      const intersects = raycaster.current.intersectObjects(scene.children, true);

      const hitWall = intersects.some(hit => {
         // Ignore helpers, lines, points
         if (!(hit.object instanceof THREE.Mesh)) return false;

         // Ignore invisible objects
         if (!hit.object.visible) return false;

         // Ignore the floor (usually a large plane at y=0, rotated -90deg x-axis)
         // Or simple heuristic: if normal is pointing UP, it's floor/ceiling.
         // Walls have normals mostly horizontal.
         if (hit.face && Math.abs(hit.face.normal.y) > 0.9) return false;

         return hit.distance < COLLISION_DISTANCE;
      });

      if (!hitWall) {
         camera.position.add(moveVector);
      }
    }

    // Keep height constant (simple version, no gravity/stairs yet)
    camera.position.y = EYE_HEIGHT;
  });
};
