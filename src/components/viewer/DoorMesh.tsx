import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Door } from '../../types';

export interface DoorMeshProps {
  door: Door;
  wallThickness?: number;
}

export const DoorMesh: React.FC<DoorMeshProps> = ({ door, wallThickness = 0.15 }) => {
  // Constants for frame dimensions
  const frameWidth = 0.05; // Width of the frame face
  const frameDepth = wallThickness + 0.02; // Slightly thicker than wall

  // Door panel dimensions
  const panelThickness = 0.04;
  const panelWidth = door.width - (frameWidth * 2);
  const panelHeight = door.height - frameWidth; // Frame at top

  // Create materials
  const materials = useMemo(() => {
    return {
      frame: new THREE.MeshStandardMaterial({ color: '#333333', roughness: 0.5 }), // Dark grey frame
      panel: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2 }), // White panel
      handle: new THREE.MeshStandardMaterial({ color: '#cccccc', metalness: 0.8, roughness: 0.2 }) // Silver handle
    };
  }, []);

  // Calculate rotation for swing
  // 0 is closed. +/- 90 degrees for open based on swing direction
  // For static visualization we might just show it closed or slightly open
  // If we want to animate later (Task 7.8.3), we'll use state here.
  const doorRotation = 0; // Closed for now

  return (
    <group name={`door-${door.id}`}>
      {/* Door Frame */}
      {/* Top Frame */}
      <mesh
        position={[0, door.height - (frameWidth/2), 0]}
        material={materials.frame}
      >
        <boxGeometry args={[door.width, frameWidth, frameDepth]} />
      </mesh>

      {/* Left Frame */}
      <mesh
        position={[-(door.width/2) + (frameWidth/2), door.height/2, 0]}
        material={materials.frame}
      >
        <boxGeometry args={[frameWidth, door.height, frameDepth]} />
      </mesh>

      {/* Right Frame */}
      <mesh
        position={[(door.width/2) - (frameWidth/2), door.height/2, 0]}
        material={materials.frame}
      >
        <boxGeometry args={[frameWidth, door.height, frameDepth]} />
      </mesh>

      {/* Door Panel Group (Pivot point) */}
      {/* Pivot should be at the hinge side */}
      <group position={[
        door.handleSide === 'left'
          ? (door.width/2) - frameWidth // Hinge on right
          : -(door.width/2) + frameWidth, // Hinge on left
        0,
        0
      ]}>
        <group rotation={[0, doorRotation, 0]}>
           {/* The Panel itself, offset so edge aligns with pivot */}
           <mesh
            position={[
              door.handleSide === 'left'
                ? -panelWidth/2
                : panelWidth/2,
              panelHeight/2,
              0
            ]}
            material={materials.panel}
           >
             <boxGeometry args={[panelWidth, panelHeight, panelThickness]} />
           </mesh>

           {/* Handle */}
           <mesh
            position={[
              door.handleSide === 'left'
                ? -panelWidth + 0.1 // Near handle side (left)
                : panelWidth - 0.1, // Near handle side (right)
              1.0, // Standard handle height
              (panelThickness/2) + 0.03
            ]}
            material={materials.handle}
           >
             <sphereGeometry args={[0.03, 16, 16]} />
           </mesh>
        </group>
      </group>
    </group>
  );
};
