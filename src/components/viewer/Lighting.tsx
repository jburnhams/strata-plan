import React, { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

export interface LightingProps {
  brightness?: number; // 0.0 to 2.0, default 1.0
  sunDirection?: number; // 0 to 360 degrees, default 45 (North-East)
  castShadows?: boolean;
  shadowMapSize?: 512 | 1024 | 2048;
}

// Extracted logic for testing
export const useLightingLogic = (
  directionalLight: THREE.DirectionalLight | null,
  options: LightingProps
) => {
  const {
    sunDirection = 45,
    castShadows = true,
    shadowMapSize = 2048
  } = options;

  useEffect(() => {
    // Safety check: ensure it has position property (is a THREE object, not DOM element)
    if (directionalLight && (directionalLight as any).position && (directionalLight as any).position.set) {
      // Calculate sun position
      const radius = 50;
      const height = 30;
      const radians = (sunDirection - 90) * (Math.PI / 180);

      const sunX = Math.cos(radians) * radius;
      const sunZ = Math.sin(radians) * radius;

      directionalLight.position.set(sunX, height, sunZ);
      directionalLight.target.position.set(0, 0, 0);
      directionalLight.target.updateMatrixWorld();

      if (castShadows) {
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = shadowMapSize;
        directionalLight.shadow.mapSize.height = shadowMapSize;

        const size = 30;
        directionalLight.shadow.camera.left = -size;
        directionalLight.shadow.camera.right = size;
        directionalLight.shadow.camera.top = size;
        directionalLight.shadow.camera.bottom = -size;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 100;
        directionalLight.shadow.bias = -0.0005;
      } else {
        directionalLight.castShadow = false;
      }
    }
  }, [directionalLight, sunDirection, castShadows, shadowMapSize]);
};

export const Lighting: React.FC<LightingProps> = (props) => {
  const { brightness = 1.0 } = props;
  const directionalLightRef = useRef<THREE.DirectionalLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);

  useLightingLogic(directionalLightRef.current, props);

  // Force re-render on mount to ensure ref is captured
  const [lightInstance, setLightInstance] = React.useState<THREE.DirectionalLight | null>(null);

  return (
    <group>
      <ambientLight
        ref={ambientLightRef}
        intensity={0.5 * brightness}
        color="#ffffff"
      />
      <directionalLight
        ref={(node) => {
             directionalLightRef.current = node;
             if (node && node !== lightInstance) {
                 setLightInstance(node);
             }
        }}
        intensity={0.8 * brightness}
        color="#fff5e6"
      />
    </group>
  );
};
