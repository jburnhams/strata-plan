import React, { useEffect, useRef } from 'react';
import { PointerLockControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useFirstPerson } from '@/hooks/useFirstPerson';

interface FirstPersonControlsProps {
  isEnabled: boolean;
  onExit: () => void;
}

export const FirstPersonControls: React.FC<FirstPersonControlsProps> = ({ isEnabled, onExit }) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null); // PointerLockControls type is tricky in R3F

  useFirstPerson(isEnabled);

  useEffect(() => {
    if (isEnabled && controlsRef.current) {
        // Trigger pointer lock
        controlsRef.current.lock();
    } else if (!isEnabled && controlsRef.current) {
        controlsRef.current.unlock();
    }
  }, [isEnabled]);

  useEffect(() => {
      const handleUnlock = () => {
          if (isEnabled) {
            onExit();
          }
      };

      // Listen for unlock event (Escape key pressed by user)
      // The drei component exposes 'unlock' event
      const controls = controlsRef.current;
      if (controls) {
        controls.addEventListener('unlock', handleUnlock);
      }

      return () => {
          if (controls) {
              controls.removeEventListener('unlock', handleUnlock);
          }
      };
  }, [isEnabled, onExit]);

  if (!isEnabled) return null;

  return (
    <PointerLockControls
        ref={controlsRef}
        selector="#root" // Lock on the root element or canvas
    />
  );
};
