import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { RoomMesh } from '../../../../src/components/viewer/RoomMesh';
import { Room } from '../../../../src/types';
import * as THREE from 'three';

// Mock dependencies
const mockUseFrame = jest.fn();
jest.mock('@react-three/fiber', () => ({
  useFrame: (cb: any) => mockUseFrame(cb),
  useThree: () => ({ camera: {}, gl: {} }),
}));

jest.mock('@react-three/drei', () => ({
  Text: ({ children }: any) => <div data-testid="room-label">{children}</div>,
  Billboard: ({ children }: any) => <div data-testid="billboard">{children}</div>
}));

// Mock Data
const createMockMesh = (isMaterialArray = false) => {
  const materials = isMaterialArray
    ? [{
        transparent: false,
        opacity: 1,
        emissive: { copy: jest.fn(), setHex: jest.fn() },
        emissiveIntensity: 0,
        dispose: jest.fn(),
        needsUpdate: false
      }, {
        transparent: false,
        opacity: 1,
        emissive: { copy: jest.fn(), setHex: jest.fn() },
        emissiveIntensity: 0,
        dispose: jest.fn(),
        needsUpdate: false
      }]
    : {
        transparent: false,
        opacity: 1,
        emissive: { copy: jest.fn(), setHex: jest.fn() },
        emissiveIntensity: 0,
        dispose: jest.fn(),
        needsUpdate: false
      };

  if (isMaterialArray) {
      (materials as any[]).forEach(m => Object.setPrototypeOf(m, THREE.MeshStandardMaterial.prototype));
  } else {
      Object.setPrototypeOf(materials, THREE.MeshStandardMaterial.prototype);
  }

  return {
    isMesh: true,
    material: materials,
    geometry: {
        dispose: jest.fn()
    },
    userData: { type: 'wall' }
  };
};

let currentMockMesh: any;
const mockGroup = {
  traverse: (cb: any) => cb(currentMockMesh),
  add: jest.fn()
};

jest.mock('../../../../src/services/geometry3d/roomGeometry', () => {
  return {
    generateRoomGeometry: jest.fn(() => mockGroup)
  };
});

describe('RoomMesh Component', () => {
  const mockRoom: Room = {
    id: 'room-1',
    name: 'Test Room',
    length: 5,
    width: 4,
    height: 3,
    type: 'bedroom',
    position: { x: 0, z: 0 },
    rotation: 0,
    doors: [],
    windows: []
  };

  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFrame.mockClear();
    currentMockMesh = createMockMesh(false);
  });

  it('renders room label', () => {
    render(
        <RoomMesh
            room={mockRoom}
            isSelected={false}
            onSelect={mockOnSelect}
        />
    );

    expect(screen.getByTestId('room-label')).toHaveTextContent('Test Room');
  });

  it('hides label when showLabels is false', () => {
    render(
        <RoomMesh
            room={mockRoom}
            isSelected={false}
            onSelect={mockOnSelect}
            showLabels={false}
        />
    );

    expect(screen.queryByTestId('room-label')).not.toBeInTheDocument();
  });

  it('updates opacity when wallOpacity changes (single material)', () => {
    const { rerender } = render(
        <RoomMesh
            room={mockRoom}
            isSelected={false}
            onSelect={mockOnSelect}
            wallOpacity={0.5}
        />
    );

    expect(currentMockMesh.material.transparent).toBe(true);
    expect(currentMockMesh.material.opacity).toBe(0.5);

    rerender(
        <RoomMesh
            room={mockRoom}
            isSelected={false}
            onSelect={mockOnSelect}
            wallOpacity={0.8}
        />
    );

    expect(currentMockMesh.material.opacity).toBe(0.8);
  });

  it('updates opacity when wallOpacity changes (array material)', () => {
    currentMockMesh = createMockMesh(true);

    render(
        <RoomMesh
            room={mockRoom}
            isSelected={false}
            onSelect={mockOnSelect}
            wallOpacity={0.5}
        />
    );

    expect(currentMockMesh.material[0].transparent).toBe(true);
    expect(currentMockMesh.material[0].opacity).toBe(0.5);
    expect(currentMockMesh.material[1].transparent).toBe(true);
    expect(currentMockMesh.material[1].opacity).toBe(0.5);
  });

  it('highlights room when selected', () => {
    render(
        <RoomMesh
            room={mockRoom}
            isSelected={true}
            onSelect={mockOnSelect}
        />
    );

    expect(mockUseFrame).toHaveBeenCalled();
  });

  it('disposes resources on unmount', () => {
      const { unmount } = render(
        <RoomMesh
            room={mockRoom}
            isSelected={false}
            onSelect={mockOnSelect}
        />
      );

      unmount();

      expect(currentMockMesh.geometry.dispose).toHaveBeenCalled();
      expect(currentMockMesh.material.dispose).toHaveBeenCalled();
  });

  it('disposes array materials on unmount', () => {
      currentMockMesh = createMockMesh(true);
      const { unmount } = render(
        <RoomMesh
            room={mockRoom}
            isSelected={false}
            onSelect={mockOnSelect}
        />
      );

      unmount();

      expect(currentMockMesh.geometry.dispose).toHaveBeenCalled();
      expect(currentMockMesh.material[0].dispose).toHaveBeenCalled();
      expect(currentMockMesh.material[1].dispose).toHaveBeenCalled();
  });
});
