import React, { Suspense, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Environment } from './Environment';

// Fallback loader while 3D content loads
const ViewerLoader = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2 mx-auto"></div>
      <p>Loading 3D Viewer...</p>
    </div>
  </div>
);

// Error Fallback
const ViewerError = ({ error }: { error: Error }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-red-50 text-red-600 p-4">
    <div className="text-center">
      <p className="font-bold mb-2">3D Viewer Error</p>
      <p className="text-sm">{error.message}</p>
      <p className="text-xs mt-4 text-gray-500">
        Try refreshing the page or checking your WebGL support.
      </p>
    </div>
  </div>
);

interface Viewer3DProps {
  children?: React.ReactNode;
  className?: string;
  onSceneReady?: (scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) => void;
}

// Internal component to expose three instances
const SceneExposer = ({ onSceneReady }: { onSceneReady?: Viewer3DProps['onSceneReady'] }) => {
  const { scene, camera, gl } = useThree();

  useEffect(() => {
    if (onSceneReady) {
      onSceneReady(scene, camera, gl);
    }
  }, [scene, camera, gl, onSceneReady]);

  return null;
};

export const Viewer3D: React.FC<Viewer3DProps> = ({
  children,
  className = "w-full h-full min-h-[400px]",
  onSceneReady
}) => {
  const [hasWebGLError, setHasWebGLError] = useState<Error | null>(null);

  const handleContextLost = (event: Event) => {
    event.preventDefault();
    setHasWebGLError(new Error("WebGL context lost"));
  };

  const handleContextRestored = () => {
    setHasWebGLError(null);
  };

  if (hasWebGLError) {
    return <ViewerError error={hasWebGLError} />;
  }

  return (
    <div className={`relative ${className}`}>
      <Suspense fallback={<ViewerLoader />}>
        <Canvas
          shadows
          camera={{ position: [0, 10, 10], fov: 50 }}
          onCreated={({ gl }) => {
            gl.setClearColor(new THREE.Color('#f0f0f0'));

            // Attach context loss listeners to the canvas element
            const canvas = gl.domElement;
            canvas.addEventListener('webglcontextlost', handleContextLost, false);
            canvas.addEventListener('webglcontextrestored', handleContextRestored, false);
          }}
          // We can't easily cleanup listeners added in onCreated if the component unmounts
          // because onCreated doesn't return a cleanup function.
          // However, if the canvas is destroyed (which happens when unmounting), listeners are gone.
        >
          <SceneExposer onSceneReady={onSceneReady} />
          <Environment />
          {children}
        </Canvas>
      </Suspense>
    </div>
  );
};

export default Viewer3D;
