import React, { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { FirstPersonControls } from './FirstPersonControls';
import { ViewerControls } from './ViewerControls';
import { CameraControls, CameraControlsRef } from './CameraControls';
import { useToast } from '@/hooks/use-toast';
import { PerformanceMonitor } from '@/services/geometry3d/optimization';

// Define explicit types for GLTFExporter since imports might fail resolution
// or use 'any' if acceptable for dynamic import situations where types are tricky
interface GLTFExporterType {
    parse(
        input: THREE.Object3D | THREE.Object3D[],
        onCompleted: (gltf: ArrayBuffer | { [key: string]: any }) => void,
        onError: (error: ErrorEvent) => void,
        options?: { binary?: boolean; [key: string]: any }
    ): void;
}

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

interface ViewerActions {
    takeScreenshot: () => void;
    exportGLTF: () => void;
    toggleFullscreen: () => void;
}

// Performance monitoring component
const PerformanceTracker = () => {
    const { gl } = useThree();
    const monitorRef = useRef<PerformanceMonitor | null>(null);

    useEffect(() => {
        monitorRef.current = new PerformanceMonitor(gl);
    }, [gl]);

    useFrame(() => {
        if (monitorRef.current) {
            monitorRef.current.update();
            // In a real app we might expose these metrics to a store or UI overlay
            // const metrics = monitorRef.current.getMetrics();
            // console.log(metrics.fps);
        }
    });

    return null;
}

// Internal component to expose three instances and actions
const SceneExposer = ({
    onSceneReady,
    onActionsReady
}: {
    onSceneReady?: Viewer3DProps['onSceneReady'];
    onActionsReady?: (actions: ViewerActions) => void;
}) => {
  const { scene, camera, gl } = useThree();
  const { toast } = useToast();
  // Use a ref to track if actions have been set to avoid infinite loops if onActionsReady is not stable
  const actionsSet = useRef(false);

  useEffect(() => {
    if (onSceneReady) {
      onSceneReady(scene, camera, gl);
    }
  }, [scene, camera, gl, onSceneReady]);

  useEffect(() => {
      if (onActionsReady && !actionsSet.current) {
          actionsSet.current = true;
          onActionsReady({
              takeScreenshot: () => {
                  gl.render(scene, camera);
                  const dataURL = gl.domElement.toDataURL('image/png');
                  const link = document.createElement('a');
                  link.download = `strataplan-view-${new Date().toISOString().slice(0, 10)}.png`;
                  link.href = dataURL;
                  link.click();
                  toast({ title: "Screenshot Saved", description: "Image downloaded successfully." });
              },
              exportGLTF: async () => {
                  try {
                      // Dynamic import to avoid heavy bundle load
                      // Use require/import dynamically and cast to any to bypass strict type check for now if module resolution fails
                      // @ts-ignore
                      const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter');
                      const exporter = new GLTFExporter() as GLTFExporterType;

                      exporter.parse(
                        scene,
                        (result: any) => {
                            const output = JSON.stringify(result, null, 2);
                            const blob = new Blob([output], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.style.display = 'none';
                            link.href = url;
                            link.download = `strataplan-model-${new Date().toISOString().slice(0, 10)}.gltf`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                            toast({ title: "Export Complete", description: "Model exported as glTF." });
                        },
                        (error: any) => {
                            console.error('An error happened during GLTF export:', error);
                            toast({ variant: "destructive", title: "Export Failed", description: "Could not export model." });
                        },
                        { binary: false } // Options
                      );
                  } catch (err) {
                      console.error('Failed to load GLTFExporter:', err);
                      toast({ variant: "destructive", title: "Export Failed", description: "Could not load exporter." });
                  }
              },
              toggleFullscreen: () => {
                 const container = gl.domElement.parentElement;
                 if (!container) return;

                 if (!document.fullscreenElement) {
                     container.requestFullscreen().catch((err) => {
                        console.error(`Error attempting to enable fullscreen: ${err.message}`);
                     });
                 } else {
                     document.exitFullscreen();
                 }
              }
          });
      }
  }, [scene, camera, gl, onActionsReady, toast]);

  return null;
};

export const Viewer3D: React.FC<Viewer3DProps> = ({
  children,
  className = "w-full h-full min-h-[400px]",
  onSceneReady
}) => {
  const [hasWebGLError, setHasWebGLError] = useState<Error | null>(null);
  const [isFirstPerson, setIsFirstPerson] = useState(false);
  const cameraControlsRef = useRef<CameraControlsRef>(null);
  const [actions, setActions] = useState<ViewerActions | null>(null);

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
      {/* UI Overlay */}
      <ViewerControls
        cameraControlsRef={cameraControlsRef}
        isFirstPerson={isFirstPerson}
        onToggleFirstPerson={() => setIsFirstPerson(!isFirstPerson)}
        onTakeScreenshot={actions?.takeScreenshot}
        onExportGLTF={actions?.exportGLTF}
        onToggleFullscreen={actions?.toggleFullscreen}
      />

      {isFirstPerson && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm z-10 pointer-events-none">
          First Person Mode: WASD to move, Mouse to look, ESC to exit
        </div>
      )}

      <Suspense fallback={<ViewerLoader />}>
        <Canvas
          shadows
          gl={{ preserveDrawingBuffer: true }} // Required for screenshots
          camera={{ position: [0, 10, 10], fov: 50 }}
          onCreated={({ gl }) => {
            gl.setClearColor(new THREE.Color('#f0f0f0'));

            // Attach context loss listeners to the canvas element
            const canvas = gl.domElement;
            canvas.addEventListener('webglcontextlost', handleContextLost, false);
            canvas.addEventListener('webglcontextrestored', handleContextRestored, false);
          }}
        >
          <PerformanceTracker />
          <SceneExposer onSceneReady={onSceneReady} onActionsReady={setActions} />

          {/* Lighting and Environment are usually children passed in,
              but Controls are managed here to coordinate with UI */}

          {!isFirstPerson && (
             <CameraControls ref={cameraControlsRef} />
          )}

          <FirstPersonControls
            isEnabled={isFirstPerson}
            onExit={() => setIsFirstPerson(false)}
          />

          {children}
        </Canvas>
      </Suspense>
    </div>
  );
};

export default Viewer3D;
