import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { SceneManager } from '../../../../src/components/viewer/SceneManager';
import { useFloorplanStore } from '../../../../src/stores/floorplanStore';
import { Room } from '../../../../src/types';

// Mock RoomMesh
jest.mock('../../../../src/components/viewer/RoomMesh', () => ({
  RoomMesh: ({ room, isSelected, onSelect }: any) => (
    <div
        data-testid={`room-mesh-${room.id}`}
        data-selected={isSelected}
        onClick={() => onSelect(room.id)}
    >
        {room.name}
    </div>
  )
}));

// Suppress console.error for unknown elements <group> in JSDOM
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (/The tag <group> is unrecognized/.test(args[0])) return;
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

describe('SceneManager Component', () => {
  const mockRooms: Room[] = [
    { id: 'r1', name: 'Room 1', length: 4, width: 3, height: 2.5, type: 'bedroom', position: { x: 0, z: 0 }, rotation: 0, doors: [], windows: [] },
    { id: 'r2', name: 'Room 2', length: 5, width: 4, height: 2.5, type: 'living', position: { x: 5, z: 0 }, rotation: 0, doors: [], windows: [] }
  ];

  beforeEach(() => {
    act(() => {
        useFloorplanStore.setState({
          currentFloorplan: {
            id: 'fp1',
            name: 'Test Plan',
            units: 'meters',
            rooms: mockRooms,
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

  it('renders a RoomMesh for each room', () => {
    render(<SceneManager />);
    expect(screen.getByTestId('room-mesh-r1')).toBeInTheDocument();
    expect(screen.getByTestId('room-mesh-r2')).toBeInTheDocument();
  });

  it('passes selection state to RoomMesh', () => {
    act(() => {
        useFloorplanStore.setState({ selectedRoomId: 'r1' });
    });
    render(<SceneManager />);

    expect(screen.getByTestId('room-mesh-r1')).toHaveAttribute('data-selected', 'true');
    expect(screen.getByTestId('room-mesh-r2')).toHaveAttribute('data-selected', 'false');
  });

  it('handles room selection', () => {
    render(<SceneManager />);

    act(() => {
        screen.getByTestId('room-mesh-r2').click();
    });

    expect(useFloorplanStore.getState().selectedRoomId).toBe('r2');
  });

  it('renders nothing if no floorplan loaded', () => {
    act(() => {
        useFloorplanStore.setState({ currentFloorplan: null });
    });
    const { container } = render(<SceneManager />);
    expect(container).toBeEmptyDOMElement();
  });
});
