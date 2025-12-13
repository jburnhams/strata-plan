import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { Viewer3D } from '../../src/components/viewer/Viewer3D';
import { SceneManager } from '../../src/components/viewer/SceneManager';
import { useFloorplanStore } from '../../src/stores/floorplanStore';
import { Room } from '../../src/types';
import * as THREE from 'three';

// --- MOCKS ---

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserver;

// Mock Three.js WebGLRenderer
jest.mock('three', () => {
    const originalThree = jest.requireActual('three');
    return {
        ...originalThree,
        WebGLRenderer: jest.fn().mockImplementation(() => {
            return {
                domElement: {
                    style: {},
                    width: 800,
                    height: 600,
                    addEventListener: jest.fn(),
                    removeEventListener: jest.fn()
                },
                setSize: jest.fn(),
                setPixelRatio: jest.fn(),
                setClearColor: jest.fn(),
                render: jest.fn(),
                dispose: jest.fn(),
                shadowMap: { enabled: false, type: 0 },
                info: {
                  render: { calls: 0, triangles: 0, frame: 0, lines: 0, points: 0 },
                  memory: { geometries: 0, textures: 0 },
                },
                capabilities: {
                  isWebGL2: true
                },
                forceContextLoss: jest.fn()
            };
        }),
    };
});

// Mock react-three-fiber hooks
jest.mock('@react-three/fiber', () => {
    const original = jest.requireActual('@react-three/fiber');
    const React = require('react');
    const THREE = require('three');

    return {
        ...original,
        Canvas: ({ children, onCreated, ...props }: any) => {
            React.useEffect(() => {
                if (onCreated) {
                     onCreated({
                         gl: new THREE.WebGLRenderer(),
                         scene: new THREE.Scene(),
                         camera: new THREE.PerspectiveCamera(),
                     });
                }
            }, [onCreated]);
            return <div data-testid="r3f-canvas">{children}</div>;
        },
        useThree: () => ({
            camera: new THREE.PerspectiveCamera(),
            scene: new THREE.Scene(),
            gl: new THREE.WebGLRenderer(),
            size: { width: 800, height: 600 },
            viewport: { width: 800, height: 600, factor: 1, distance: 10, aspect: 1.33 },
            invalidate: jest.fn(),
        }),
        useFrame: jest.fn(),
    };
});

// Mock drei
jest.mock('@react-three/drei', () => ({
    OrbitControls: () => <div data-testid="orbit-controls" />,
    PointerLockControls: () => <div data-testid="pointer-lock-controls" />,
    Environment: () => <div data-testid="environment" />,
    Html: ({ children }: any) => <div data-testid="html-overlay">{children}</div>,
    Billboard: ({ children }: any) => <div data-testid="billboard">{children}</div>,
    Text: ({ children, text }: any) => <div data-testid="drei-text">{text || children}</div>
}));

// Mock CameraControls to allow us to check if methods are called
const mockCameraControls = {
  reset: jest.fn(),
  setPreset: jest.fn(),
  zoomIn: jest.fn(),
  zoomOut: jest.fn(),
  fitToView: jest.fn()
};

jest.mock('../../src/components/viewer/CameraControls', () => {
  const React = require('react');
  return {
    CameraControls: React.forwardRef((props: any, ref: any) => {
      React.useImperativeHandle(ref, () => mockCameraControls);
      return <div data-testid="camera-controls" />;
    })
  };
});

// Mock RoomMesh
jest.mock('../../src/components/viewer/RoomMesh', () => ({
    RoomMesh: ({ room }: any) => (
        <div data-testid={`room-mesh-${room.id}`}>{room.name}</div>
    )
}));

describe('3D Viewer Integration - Controls & Cleanup', () => {
    const mockRoom: Room = {
        id: 'room-1',
        name: 'Living Room',
        length: 5,
        width: 4,
        height: 2.5,
        type: 'living',
        position: { x: 0, z: 0 },
        rotation: 0,
        doors: [],
        windows: []
    };

    beforeEach(() => {
        jest.clearAllMocks();
        act(() => {
            useFloorplanStore.setState({
                currentFloorplan: {
                    id: 'fp-1',
                    name: 'Test Plan',
                    units: 'meters',
                    rooms: [mockRoom],
                    connections: [],
                    walls: [],
                    doors: [],
                    windows: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    version: '1.0.0'
                },
                selectedRoomId: null,
                selectedRoomIds: []
            });
        });
    });

    it('triggers camera presets', async () => {
        render(
            <Viewer3D>
                <SceneManager />
            </Viewer3D>
        );

        // Find buttons in the toolbar (ViewerControls)
        // Note: The buttons use icons so we need to find them by aria-label or role
        // Since aria-labels are not explicitly set in the previous code (I assume), let's check ViewerControls.tsx logic or add them.
        // But wait, the previous code didn't show ViewerControls.tsx.
        // I will assume there are buttons with titles or aria-labels.
        // If not, I'll need to update ViewerControls to be testable.

        // Assuming ViewerControls renders buttons for presets.
        // Let's check if we can find them.
        const topButton = screen.getByTitle(/Top View/);
        const sideButton = screen.getByTitle(/Side View/);

        act(() => {
           topButton.click();
        });
        expect(mockCameraControls.setPreset).toHaveBeenCalledWith('top');

        act(() => {
            sideButton.click();
        });
        expect(mockCameraControls.setPreset).toHaveBeenCalledWith('side');
    });

    it('cleans up meshes when room is deleted', async () => {
        const { unmount } = render(
            <Viewer3D>
                <SceneManager />
            </Viewer3D>
        );

        expect(screen.getByTestId('room-mesh-room-1')).toBeInTheDocument();

        // Delete room
        act(() => {
            useFloorplanStore.setState({
                currentFloorplan: {
                    ...useFloorplanStore.getState().currentFloorplan!,
                    rooms: []
                }
            });
        });

        // Should be gone
        // Since we are mocking SceneManager rendering, we need to wait for debounce
        // SceneManager uses 100ms debounce
        await act(async () => {
           await new Promise(r => setTimeout(r, 150));
        });

        expect(screen.queryByTestId('room-mesh-room-1')).not.toBeInTheDocument();

        unmount();
    });
});
