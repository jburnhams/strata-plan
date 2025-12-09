import React from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

export interface EnvironmentProps {
  showGrid?: boolean;
  showAxis?: boolean;
  backgroundColor?: string;
  groundColor?: string;
  gridSize?: number;
}

export const Environment: React.FC<EnvironmentProps> = ({
  showGrid = true,
  showAxis = false,
  backgroundColor = '#e0e0e0',
  groundColor = '#f5f5f5',
  gridSize = 200
}) => {
  const { scene } = useThree();

  React.useEffect(() => {
    scene.background = new THREE.Color(backgroundColor);
    scene.fog = new THREE.Fog(backgroundColor, 20, gridSize / 2);

    return () => {
      scene.background = null;
      scene.fog = null;
    };
  }, [scene, backgroundColor, gridSize]);

  return (
    <group name="environment">
      {/* Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[gridSize, gridSize]} />
        <meshStandardMaterial
          color={groundColor}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Grid Helper */}
      {showGrid && (
        <gridHelper
          args={[gridSize, gridSize, 0x888888, 0xcccccc]}
          position={[0, 0, 0]}
        />
      )}

      {/* Axis Helper */}
      {showAxis && <axesHelper args={[5]} />}
    </group>
  );
};
