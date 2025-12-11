import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';

// Constants
const MOVE_SPEED = 2.0; // m/s
const RUN_SPEED = 4.0; // m/s
const EYE_HEIGHT = 1.6; // m
const COLLISION_DISTANCE = 0.5; // m

export const useFirstPerson = (isEnabled: boolean) => {
  const { camera } = useThree();
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const moveLeft = useRef(false);
  const moveRight = useRef(false);
  const isRunning = useRef(false);

  // Track movement velocity for smooth transitions
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());

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

    // Apply damping/friction
    velocity.current.x -= velocity.current.x * 10.0 * delta;
    velocity.current.z -= velocity.current.z * 10.0 * delta;

    // Determine direction
    direction.current.z = Number(moveForward.current) - Number(moveBackward.current);
    direction.current.x = Number(moveRight.current) - Number(moveLeft.current);
    direction.current.normalize(); // ensure consistent speed in all directions

    if (moveForward.current || moveBackward.current) {
      velocity.current.z -= direction.current.z * 40.0 * delta * speed;
    }
    if (moveLeft.current || moveRight.current) {
      velocity.current.x -= direction.current.x * 40.0 * delta * speed;
    }

    // Apply movement
    // Note: PointerLockControls object is the camera for movement purposes usually,
    // or we move the camera directly if using standard PointerLockControls logic.
    // However, THREE.PointerLockControls usually handles the mouse look, but not movement.
    // We need to move the camera relative to its local orientation.

    const forwardVector = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forwardVector.y = 0; // Lock movement to XZ plane
    forwardVector.normalize();

    const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    rightVector.y = 0;
    rightVector.normalize();

    // Move forward/back
    if (moveForward.current) camera.position.addScaledVector(forwardVector, speed * delta);
    if (moveBackward.current) camera.position.addScaledVector(forwardVector, -speed * delta);

    // Move left/right
    if (moveRight.current) camera.position.addScaledVector(rightVector, speed * delta);
    if (moveLeft.current) camera.position.addScaledVector(rightVector, -speed * delta);

    // Keep height constant (simple version, no gravity/stairs yet)
    camera.position.y = EYE_HEIGHT;

    // TODO: Collision detection would go here
  });
};
