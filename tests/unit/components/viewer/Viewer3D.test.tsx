import React from 'react';
import { render, screen } from '@testing-library/react';
import { Viewer3D } from '../../../../src/components/viewer/Viewer3D';
import * as THREE from 'three';

// Mock dependencies
jest.mock('@react-three/fiber', () => {
  const React = require('react');
  const THREE = require('three');
  return {
    ...jest.requireActual('@react-three/fiber'),
    Canvas: ({ children, onCreated, onContextLost, onContextRestored, fallback, ...props }: any) => {
      // Simulate onCreated callback
      React.useEffect(() => {
          if (onCreated) {
              const domElement = {
                  addEventListener: jest.fn(),
                  removeEventListener: jest.fn(),
              };

              onCreated({
                  gl: {
                      setClearColor: jest.fn(),
                      domElement: domElement
                  }
              });
          }
      }, [onCreated]);

      return (
        <div data-testid="canvas-mock">
          {children}
          {/* Expose context loss handlers for testing */}
          <button data-testid="trigger-context-lost" onClick={(e) => onContextLost && onContextLost(e)}>Lost</button>
          <button data-testid="trigger-context-restored" onClick={() => onContextRestored && onContextRestored()}>Restored</button>
        </div>
      );
    },
    useThree: () => ({
      scene: new THREE.Scene(),
      camera: new THREE.PerspectiveCamera(),
      gl: {
          render: jest.fn(),
          domElement: {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
          }
      },
    }),
  };
});

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls-mock" />,
}));

describe('Viewer3D Component', () => {
  it('renders the canvas', () => {
    render(<Viewer3D />);
    expect(screen.getByTestId('canvas-mock')).toBeInTheDocument();
  });

  it('renders children inside the canvas', () => {
    render(
      <Viewer3D>
        <mesh data-testid="test-mesh" />
      </Viewer3D>
    );
    expect(screen.getByTestId('canvas-mock')).toBeInTheDocument();
    expect(screen.getByTestId('test-mesh')).toBeInTheDocument();
  });

  it('handles onSceneReady callback', () => {
    const handleSceneReady = jest.fn();
    render(<Viewer3D onSceneReady={handleSceneReady} />);
    expect(handleSceneReady).toHaveBeenCalled();
    const args = handleSceneReady.mock.calls[0];
    expect(args[0]).toBeInstanceOf(THREE.Scene);
    expect(args[1]).toBeInstanceOf(THREE.PerspectiveCamera);
  });
});
