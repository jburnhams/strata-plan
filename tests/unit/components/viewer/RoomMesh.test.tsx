import React from 'react';
import { render, act } from '@testing-library/react';
import { RoomMesh, RoomMeshProps } from '../../../../src/components/viewer/RoomMesh';
import { Room } from '../../../../src/types';

// Mock R3F hooks
jest.mock('@react-three/fiber', () => {
  const ThreeLib = require('three');
  return {
    ...jest.requireActual('@react-three/fiber'),
    useFrame: jest.fn(),
    useThree: jest.fn(() => ({
      camera: new ThreeLib.PerspectiveCamera(),
      scene: new ThreeLib.Scene(),
      gl: { domElement: { style: {} } }
    })),
  };
});

// Mock Drei
jest.mock('@react-three/drei', () => ({
  Text: () => null,
  Billboard: ({ children }: any) => <group>{children}</group>,
  Detailed: ({ children }: any) => <group>{children}</group>
}));

// Mock geometry generation service to inspect calls and results
jest.mock('../../../../src/services/geometry3d/roomGeometry', () => {
    // Require THREE inside the factory with a distinct name to avoid hoisting conflicts
    const ThreeLib = require('three');
    return {
        generateRoomGeometry: jest.fn().mockImplementation(() => {
            // Return a mock group with structure we can inspect
            const group = new ThreeLib.Group();
            const wallMesh = new ThreeLib.Mesh(
                new ThreeLib.BufferGeometry(),
                new ThreeLib.MeshStandardMaterial({ transparent: false, opacity: 1 })
            );
            wallMesh.userData = { type: 'wall' };
            group.add(wallMesh);
            return group;
        })
    };
});

// Mock dependencies
jest.mock('three', () => {
    const ThreeLib = jest.requireActual('three');
    return {
        ...ThreeLib,
        Group: class extends ThreeLib.Group {
            constructor() {
                super();
                this.add(new ThreeLib.Mesh());
            }
        },
    };
});

const originalConsoleError = console.error;
beforeAll(() => {
    console.error = (...args: any[]) => {
        // Suppress expected R3F/JSDOM errors
        const msg = args[0];
        if (typeof msg === 'string' && (
            msg.includes('The tag <primitive>') ||
            msg.includes('The tag <group>') ||
            msg.includes('The tag <mesh>') ||
            msg.includes('The tag <geometry>') ||
            msg.includes('The tag <material>')
        )) {
            return;
        }
        originalConsoleError(...args);
    };
});
afterAll(() => {
    console.error = originalConsoleError;
});

const mockRoom: Room = {
  id: 'room-1',
  name: 'Living Room',
  length: 5,
  width: 4,
  height: 3,
  type: 'living',
  position: { x: 0, z: 0 },
  rotation: 0,
  doors: [],
  windows: []
};

describe('RoomMesh Component', () => {
  it('renders room label', () => {
    render(
        <RoomMesh
            room={mockRoom}
            isSelected={false}
            onSelect={jest.fn()}
        />
    );
  });

  it('updates opacity when wallOpacity changes', () => {
      // We rely on the mock `generateRoomGeometry` returning a group with a wall mesh
      const { generateRoomGeometry } = require('../../../../src/services/geometry3d/roomGeometry');

      const { rerender } = render(
        <RoomMesh
            room={mockRoom}
            isSelected={false}
            onSelect={jest.fn()}
            wallOpacity={0.5}
        />
      );

      // Verify generateRoomGeometry was called
      expect(generateRoomGeometry).toHaveBeenCalled();

      // Get the last returned group (LOD calls it multiple times, we just need to check if one of them is valid)
      const results = generateRoomGeometry.mock.results;
      const group = results[results.length - 1].value;
      const wallMesh = group.children.find((c: any) => c.userData.type === 'wall');

      // Verify opacity was applied
      expect(wallMesh.material.transparent).toBe(true);
      expect(wallMesh.material.opacity).toBe(0.5);

      // Update opacity
      rerender(
        <RoomMesh
            room={mockRoom}
            isSelected={false}
            onSelect={jest.fn()}
            wallOpacity={0.8}
        />
      );

      const group2 = generateRoomGeometry.mock.results[generateRoomGeometry.mock.results.length - 1].value;
      const wallMesh2 = group2.children.find((c: any) => c.userData.type === 'wall');
      expect(wallMesh2.material.opacity).toBe(0.8);
  });

  it('disposes resources on unmount', () => {
      const { generateRoomGeometry } = require('../../../../src/services/geometry3d/roomGeometry');

      const { unmount } = render(
        <RoomMesh
            room={mockRoom}
            isSelected={false}
            onSelect={jest.fn()}
        />
      );

      const group = generateRoomGeometry.mock.results[generateRoomGeometry.mock.results.length - 1].value;
      const wallMesh = group.children.find((c: any) => c.userData.type === 'wall');

      // Spy on dispose
      const disposeGeoSpy = jest.spyOn(wallMesh.geometry, 'dispose');
      const disposeMatSpy = jest.spyOn(wallMesh.material, 'dispose');

      unmount();

      expect(disposeGeoSpy).toHaveBeenCalled();
      expect(disposeMatSpy).toHaveBeenCalled();
  });

  it('does not re-render if props are identical (memoization)', () => {
      const { generateRoomGeometry } = require('../../../../src/services/geometry3d/roomGeometry');
      generateRoomGeometry.mockClear();

      const onSelect = jest.fn();

      const { rerender } = render(
        <RoomMesh
            room={mockRoom}
            isSelected={false}
            onSelect={onSelect}
        />
      );

      // Called twice (High and Low)
      expect(generateRoomGeometry).toHaveBeenCalledTimes(2);

      // Rerender with same props
      rerender(
        <RoomMesh
            room={mockRoom}
            isSelected={false}
            onSelect={onSelect}
        />
      );

      // Should still be 2 if memo works on component level
      expect(generateRoomGeometry).toHaveBeenCalledTimes(2);

      // Rerender with new prop
      rerender(
        <RoomMesh
            room={{ ...mockRoom, name: 'Changed' }}
            isSelected={false}
            onSelect={onSelect}
        />
      );

      // Called 2 more times (High and Low) = 4
      expect(generateRoomGeometry).toHaveBeenCalledTimes(4);
  });
});
