import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Window } from '../../types';

export interface WindowMeshProps {
  window: Window;
  wallThickness?: number;
}

export const WindowMesh: React.FC<WindowMeshProps> = ({ window, wallThickness = 0.15 }) => {
  // Frame dimensions
  const frameWidth = 0.05;
  const frameDepth = wallThickness + 0.02; // Protrude slightly

  // Glass dimensions
  const glassThickness = 0.02;
  const glassWidth = window.width - (frameWidth * 2);
  const glassHeight = window.height - (frameWidth * 2);

  const materials = useMemo(() => {
    return {
      frame: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.5 }), // White frame
      glass: new THREE.MeshPhysicalMaterial({
        color: '#aaddff',
        metalness: 0,
        roughness: 0,
        transmission: 0.9, // Glass
        transparent: true,
        opacity: 0.3,
        thickness: 0.02,
      })
    };
  }, []);

  return (
    <group name={`window-${window.id}`}>
      {/* Frame Top */}
      <mesh
        position={[0, window.height - (frameWidth/2), 0]}
        material={materials.frame}
      >
        <boxGeometry args={[window.width, frameWidth, frameDepth]} />
      </mesh>

      {/* Frame Bottom */}
      <mesh
        position={[0, frameWidth/2, 0]}
        material={materials.frame}
      >
        <boxGeometry args={[window.width, frameWidth, frameDepth]} />
      </mesh>

      {/* Frame Left */}
      <mesh
        position={[-(window.width/2) + (frameWidth/2), window.height/2, 0]}
        material={materials.frame}
      >
        <boxGeometry args={[frameWidth, window.height - (frameWidth * 2), frameDepth]} />
      </mesh>

      {/* Frame Right */}
      <mesh
        position={[(window.width/2) - (frameWidth/2), window.height/2, 0]}
        material={materials.frame}
      >
        <boxGeometry args={[frameWidth, window.height - (frameWidth * 2), frameDepth]} />
      </mesh>

      {/* Glass Pane */}
      <mesh
        position={[0, window.height/2, 0]}
        material={materials.glass}
      >
        <boxGeometry args={[glassWidth, glassHeight, glassThickness]} />
      </mesh>

      {/* Optional: Mullions depending on window type (Task 7.8.4 mentions it but it's okay to skip for basic implementation) */}
    </group>
  );
};
