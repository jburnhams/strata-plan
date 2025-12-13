import React from 'react';
import { render } from '@testing-library/react';
import { RoomMesh } from '../../src/components/viewer/RoomMesh';
import { Room, Door, Window } from '../../src/types';

// Mock @react-three/fiber
jest.mock('@react-three/fiber', () => {
  const THREE = require('three');
  return {
    useFrame: jest.fn(),
    useThree: jest.fn().mockImplementation(() => ({
      camera: { position: new THREE.Vector3(0, 0, 0) },
      gl: { domElement: { style: {} } } // Mock plain object instead of document.createElement
    })),
  };
});

// Mock @react-three/drei
jest.mock('@react-three/drei', () => ({
  Text: () => <mesh name="Text" />,
  Billboard: ({ children }: { children: React.ReactNode }) => <group name="Billboard">{children}</group>,
  Detailed: ({ children }: { children: React.ReactNode }) => <group name="Detailed">{children}</group>,
}));

// Mock DoorMesh and WindowMesh to easily find them
jest.mock('../../src/components/viewer/DoorMesh', () => ({
  DoorMesh: (props: any) => <mesh name={`MockDoorMesh-${props.door.id}`} />
}));

jest.mock('../../src/components/viewer/WindowMesh', () => ({
  WindowMesh: (props: any) => <mesh name={`MockWindowMesh-${props.window.id}`} />
}));

describe('Doors & Windows 3D Integration', () => {
  const mockRoom: Room = {
    id: 'room-1',
    name: 'Test Room',
    type: 'bedroom',
    width: 4,
    length: 5,
    height: 2.5,
    position: { x: 0, z: 0 },
    rotation: 0,
    floorMaterial: 'wood',
    wallMaterial: 'paint',
    ceilingMaterial: 'paint',
  };

  const mockDoor: Door = {
    id: 'door-1',
    roomId: 'room-1',
    wallSide: 'north',
    position: 0.5,
    width: 1,
    height: 2,
    type: 'single',
    swing: 'inward',
    handleSide: 'left',
    isExterior: false
  };

  const mockWindow: Window = {
    id: 'window-1',
    roomId: 'room-1',
    wallSide: 'south',
    position: 0.5,
    width: 1.5,
    height: 1.2,
    sillHeight: 0.9,
    frameType: 'double',
    material: 'pvc',
    openingType: 'casement'
  };

  // Suppress console errors for unknown elements (mesh, group, primitive)
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = (...args: any[]) => {
      const msg = args[0];
      if (typeof msg === 'string' && (
        msg.includes('React does not recognize the') ||
        msg.includes('Use the `transientProps` prop')
      )) {
        return;
      }
      originalConsoleError(...args);
    };
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('renders RoomMesh with child DoorMesh and WindowMesh', () => {
    const { container } = render(
      <RoomMesh
        room={mockRoom}
        doors={[mockDoor]}
        windows={[mockWindow]}
        isSelected={false}
        onSelect={() => {}}
      />
    );

    const doorMesh = container.querySelector(`mesh[name="MockDoorMesh-${mockDoor.id}"]`);
    const windowMesh = container.querySelector(`mesh[name="MockWindowMesh-${mockWindow.id}"]`);

    expect(doorMesh).toBeInTheDocument();
    expect(windowMesh).toBeInTheDocument();
  });

  it('correctly filters items for the room', () => {
    const otherDoor: Door = { ...mockDoor, id: 'door-2', roomId: 'room-2' };

    const { container } = render(
      <RoomMesh
        room={mockRoom}
        doors={[mockDoor, otherDoor]}
        windows={[mockWindow]}
        isSelected={false}
        onSelect={() => {}}
      />
    );

    const doorMesh1 = container.querySelector(`mesh[name="MockDoorMesh-${mockDoor.id}"]`);
    const doorMesh2 = container.querySelector(`mesh[name="MockDoorMesh-${otherDoor.id}"]`);

    expect(doorMesh1).toBeInTheDocument();
    expect(doorMesh2).not.toBeInTheDocument();
  });
});
