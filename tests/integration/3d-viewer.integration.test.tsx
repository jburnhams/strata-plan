import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
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
// The Viewer3D component calls `gl.setClearColor`. We must mock it.
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


jest.mock('@react-three/fiber', () => {
    const original = jest.requireActual('@react-three/fiber');
    const React = require('react');
    const THREE = require('three');

    // We need to provide a mocked 'gl' object to onCreated that has setClearColor
    const mockGl = {
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

    return {
        ...original,
        Canvas: ({ children, onCreated, ...props }: any) => {
            // Simulate onCreated
            React.useEffect(() => {
                if (onCreated) {
                     onCreated({
                         gl: mockGl,
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
            gl: mockGl,
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

// Mock RoomMesh
jest.mock('../../src/components/viewer/RoomMesh', () => ({
    RoomMesh: ({ room, isSelected, quality }: any) => (
        <div
            data-testid={`room-mesh-${room.id}`}
            data-selected={isSelected ? "true" : "false"}
            data-quality={quality}
        >
            {room.name}
        </div>
    )
}));


describe('3D Viewer Integration', () => {
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
        // Reset store
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

    it('initializes and renders rooms', async () => {
        render(
            <Viewer3D>
                <SceneManager />
            </Viewer3D>
        );

        // Check if Canvas is present
        expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();

        // Check if RoomMesh is rendered
        await waitFor(() => {
            expect(screen.getByTestId('room-mesh-room-1')).toBeInTheDocument();
        }, { timeout: 3000 });

        expect(screen.getByText('Living Room')).toBeInTheDocument();
    });

    it('updates when a new room is added', async () => {
        render(
            <Viewer3D>
                <SceneManager />
            </Viewer3D>
        );

        // Wait for initial render
        await waitFor(() => expect(screen.getByTestId('room-mesh-room-1')).toBeInTheDocument(), { timeout: 3000 });

        // Add room
        act(() => {
            const newRoom: Room = { ...mockRoom, id: 'room-2', name: 'Kitchen', position: { x: 5, z: 0 } };
            const state = useFloorplanStore.getState();
            if (state.currentFloorplan) {
                 useFloorplanStore.setState({
                    currentFloorplan: {
                        ...state.currentFloorplan,
                        rooms: [...state.currentFloorplan.rooms, newRoom]
                    }
                });
            }
        });

        // Verify new room appears
        await waitFor(() => {
             expect(screen.getByTestId('room-mesh-room-2')).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('updates selection state', async () => {
        render(
            <Viewer3D>
                <SceneManager />
            </Viewer3D>
        );

        await waitFor(() => expect(screen.getByTestId('room-mesh-room-1')).toBeInTheDocument(), { timeout: 3000 });

        // Select room
        act(() => {
            useFloorplanStore.setState({ selectedRoomId: 'room-1' });
        });

        await waitFor(() => {
             expect(screen.getByTestId('room-mesh-room-1')).toHaveAttribute('data-selected', 'true');
        }, { timeout: 3000 });
    });

    it('passes quality setting to RoomMesh', async () => {
        render(
            <Viewer3D>
                <SceneManager quality="low" />
            </Viewer3D>
        );

        await waitFor(() => {
            expect(screen.getByTestId('room-mesh-room-1')).toHaveAttribute('data-quality', 'low');
        }, { timeout: 3000 });
    });
});
