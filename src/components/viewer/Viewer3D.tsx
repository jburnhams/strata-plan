import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { useThreeScene } from '../../hooks/useThreeScene';

// Internal component to initialize the scene using our hook
const SceneSetup = () => {
  useThreeScene();
  return null;
};

const ViewerLoader = () => (
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    color: '#666'
  }}>
    Loading 3D Viewer...
  </div>
);

const ViewerError = ({ error }: { error: Error }) => (
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff5f5',
    color: '#c00',
    padding: '20px',
    textAlign: 'center'
  }}>
    <div>
      <h3 style={{ marginBottom: '10px' }}>Viewer Error</h3>
      <p>{error.message}</p>
    </div>
  </div>
);

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: (error: Error) => React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Viewer3D Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback(this.state.error!);
    }
    return this.props.children;
  }
}

export const Viewer3D: React.FC = () => {
  const [isWebGLAvailable, setIsWebGLAvailable] = useState(true);

  useEffect(() => {
    // 5.1.6 Handle WebGL context loss / unavailability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setIsWebGLAvailable(false);
      }
    } catch (e) {
      setIsWebGLAvailable(false);
    }
  }, []);

  if (!isWebGLAvailable) {
    return <ViewerError error={new Error("WebGL is not supported in this browser.")} />;
  }

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '400px', position: 'relative', overflow: 'hidden' }}>
      <ErrorBoundary fallback={(err) => <ViewerError error={err} />}>
        <Suspense fallback={<ViewerLoader />}>
          <Canvas
            shadows
            camera={{ position: [10, 10, 10], fov: 50 }}
            gl={{ antialias: true, preserveDrawingBuffer: true }}
            style={{ width: '100%', height: '100%', display: 'block' }}
          >
            {/* 5.1.3 & 5.1.4 Initialize Scene */}
            <SceneSetup />

            {/* 5.1.2 Basic Setup - Controls to ensure useThreeScene finds them */}
            <OrbitControls makeDefault />

            {/* 5.1.5 FPS Counter for debugging */}
            <Stats />
          </Canvas>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};
