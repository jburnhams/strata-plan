import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { Viewer3D } from '../../../../src/components/viewer/Viewer3D';
import * as THREE from 'three';

// Setup mock tracking - must start with 'mock'
const mockAddEventListener = jest.fn();
const mockSetClearColor = jest.fn();

// Create a real event target for the canvas to dispatch events
const mockCanvasElement = document.createElement('canvas');
mockCanvasElement.addEventListener = mockAddEventListener;

// Mock @react-three/fiber
jest.mock('@react-three/fiber', () => {
  const React = require('react');
  const THREE = require('three');

  return {
    Canvas: ({ children, onCreated }: any) => {
      React.useEffect(() => {
        if (onCreated) {
          onCreated({
            gl: {
              domElement: mockCanvasElement, // Use our mock element
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
      gl: { domElement: mockCanvasElement },
    }),
    useFrame: jest.fn(), // Mock useFrame to prevent crash in FirstPersonControls
  };
});

// Mock @react-three/drei
jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  PointerLockControls: () => <div data-testid="pointer-lock-controls" />, // Mock this for FirstPersonControls
}));

// Mock Environment component
jest.mock('../../../../src/components/viewer/Environment', () => ({
  Environment: () => <div data-testid="environment" />
}));

// Mock useToast hook
jest.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: jest.fn()
    })
}));

// Mock CameraControls
jest.mock('../../../../src/components/viewer/CameraControls', () => {
    const React = require('react');
    return {
        CameraControls: React.forwardRef((props: any, ref: any) => <div data-testid="camera-controls" />)
    };
});

// Mock ViewerControls
jest.mock('../../../../src/components/viewer/ViewerControls', () => ({
    ViewerControls: () => <div data-testid="viewer-controls" />
}));

describe('Viewer3D', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    render(<Viewer3D />);
    expect(await screen.findByTestId('r3f-canvas')).toBeInTheDocument();
  });

  it('renders children', async () => {
    render(
      <Viewer3D>
        <div data-testid="test-child" />
      </Viewer3D>
    );
    expect(await screen.findByTestId('test-child')).toBeInTheDocument();
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

  it('handles WebGL context loss', async () => {
      render(<Viewer3D />);

      await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Capture the listener
      const contextLostHandler = mockAddEventListener.mock.calls.find(call => call[0] === 'webglcontextlost')[1];

      const mockEvent = { preventDefault: jest.fn() };

      act(() => {
          contextLostHandler(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(await screen.findByText('3D Viewer Error')).toBeInTheDocument();
      expect(await screen.findByText('WebGL context lost')).toBeInTheDocument();
  });

  it('recovers from WebGL context loss', async () => {
      render(<Viewer3D />);

      await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Trigger loss
      const contextLostHandler = mockAddEventListener.mock.calls.find(call => call[0] === 'webglcontextlost')[1];
      act(() => {
          contextLostHandler({ preventDefault: jest.fn() });
      });

      expect(screen.getByText('WebGL context lost')).toBeInTheDocument();

      // Trigger restore
      const contextRestoredHandler = mockAddEventListener.mock.calls.find(call => call[0] === 'webglcontextrestored')[1];
      act(() => {
          contextRestoredHandler();
      });

      // Error should be gone, canvas should be back (mocked)
      // Note: In our mock, Canvas doesn't unmount on error state change unless component structure changes.
      // The component returns `ViewerError` if error exists.
      // When error is null, it renders Canvas.
      expect(screen.queryByText('WebGL context lost')).not.toBeInTheDocument();
      expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
  });
});
