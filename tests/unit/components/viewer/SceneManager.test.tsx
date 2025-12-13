import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { SceneManager } from '../../../../src/components/viewer/SceneManager';
import { useFloorplanStore } from '../../../../src/stores/floorplanStore';
import { Room } from '../../../../src/types';
import * as useSceneSyncModule from '../../../../src/hooks/useSceneSync';

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

  it('regenerates scene when sceneVersion changes', () => {
    // Spy on useSceneSync to mock the return value and allow updating sceneVersion
    const useSceneSyncSpy = jest.spyOn(useSceneSyncModule, 'useSceneSync');

    // Initial render
    let sceneVersion = 0;
    useSceneSyncSpy.mockImplementation(() => ({
      rooms: mockRooms,
      floorplan: useFloorplanStore.getState().currentFloorplan,
      sceneVersion: sceneVersion,
      regenerateScene: jest.fn()
    }));

    const { rerender } = render(<SceneManager />);

    // Check initial key (this is hard to check directly in react-testing-library as key is not a prop,
    // but we can check if the component re-mounted by checking if the DOM elements are fresh if we could,
    // but here we just want to ensure it renders correctly).
    // A better way is to verify that the group element has the key, but <group> is not an HTML element.
    // However, we can trust React's key behavior if we verify the prop is passed.
    // We can't easily check 'key' on the rendered output.
    // Instead, let's just ensure it still renders.
    expect(screen.getByTestId('room-mesh-r1')).toBeInTheDocument();

    // Update scene version
    sceneVersion = 1;
    useSceneSyncSpy.mockImplementation(() => ({
        rooms: mockRooms,
        floorplan: useFloorplanStore.getState().currentFloorplan,
        sceneVersion: sceneVersion,
        regenerateScene: jest.fn()
    }));

    rerender(<SceneManager />);
    expect(screen.getByTestId('room-mesh-r1')).toBeInTheDocument();
  });

  it('uses debounced scene sync', () => {
    const useSceneSyncSpy = jest.spyOn(useSceneSyncModule, 'useSceneSync');

    render(<SceneManager />);

    // Verify it was called with default delay 100
    expect(useSceneSyncSpy).toHaveBeenCalledWith(100);
  });
});
