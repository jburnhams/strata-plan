import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { Viewer3D } from '../../../../src/components/viewer/Viewer3D';
import * as THREE from 'three';

// Setup mock tracking - must start with 'mock'
const mockAddEventListener = jest.fn();
const mockSetClearColor = jest.fn();

// Mock @react-three/fiber
jest.mock('@react-three/fiber', () => {
  const React = require('react');
  const THREE = require('three');
  // We can't use `document` directly inside the mock factory if not guaranteed to be present (though in Jest it is).
  // But variables are checked strictly.
  // We can just return a plain object as domElement.

  return {
    Canvas: ({ children, onCreated }: any) => {
      React.useEffect(() => {
        if (onCreated) {
          onCreated({
            gl: {
              domElement: {
                addEventListener: mockAddEventListener,
                removeEventListener: jest.fn(),
              },
              setClearColor: mockSetClearColor,
            },
            scene: new THREE.Scene(),
            camera: new THREE.PerspectiveCamera(),
          });
        }
      }, [onCreated]);
      return <div data-testid="r3f-canvas">{children}</div>;
    },
    useThree: () => ({
      scene: new THREE.Scene(),
      camera: new THREE.PerspectiveCamera(),
      gl: { domElement: {} }, // Mock domElement as empty object to avoid `document` reference issue
    }),
  };
});

// Mock @react-three/drei
jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
}));

// Mock Environment component
jest.mock('../../../../src/components/viewer/Environment', () => ({
  Environment: () => <div data-testid="environment" />
}));

describe('Viewer3D', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    render(<Viewer3D />);
    expect(await screen.findByTestId('r3f-canvas')).toBeInTheDocument();
  });

  it('renders environment', async () => {
    render(<Viewer3D />);
    // Since we mock Canvas to just render children in a div, Environment should be present
    expect(await screen.findByTestId('environment')).toBeInTheDocument();
  });

  it('initializes WebGL context listeners', async () => {
    render(<Viewer3D />);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockAddEventListener).toHaveBeenCalledWith('webglcontextlost', expect.any(Function), false);
    expect(mockAddEventListener).toHaveBeenCalledWith('webglcontextrestored', expect.any(Function), false);
  });

  it('calls onSceneReady callback', async () => {
    const handleSceneReady = jest.fn();
    render(<Viewer3D onSceneReady={handleSceneReady} />);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(handleSceneReady).toHaveBeenCalled();
  });

  it('sets background color', async () => {
    render(<Viewer3D />);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockSetClearColor).toHaveBeenCalled();
  });
});
