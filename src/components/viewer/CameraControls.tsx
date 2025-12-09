import React, { useRef, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useCameraControls } from '../../hooks/useCameraControls';

export const CameraControls: React.FC = () => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { setPresetView, fitToView, zoom } = useCameraControls(controlsRef);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid interfering with input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'r':
        case 'R':
          setPresetView('isometric');
          break;
        case '1':
          setPresetView('isometric');
          break;
        case '2':
          setPresetView('top');
          break;
        case '3':
          setPresetView('front');
          break;
        case '4':
          setPresetView('side');
          break;
        case 'f':
        case 'F':
            fitToView();
            break;
        case '+':
        case '=':
            zoom(1);
            break;
        case '-':
        case '_':
            zoom(-1);
            break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setPresetView, fitToView]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      minDistance={2}
      maxDistance={100}
      minPolarAngle={0.1}
      maxPolarAngle={Math.PI / 2 - 0.1}
    />
  );
};
