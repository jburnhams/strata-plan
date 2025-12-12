import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ROOM_TYPE_COLORS } from '../../../../src/constants/colors';
import { RoomLayer } from '@/components/editor/RoomLayer';
import { useRoomDrag } from '@/hooks/useRoomDrag';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('@/stores/floorplanStore', () => {
    const { jest } = require('@jest/globals');
    return {
        useFloorplanStore: jest.fn()
    };
});
jest.mock('@/stores/uiStore', () => {
    const { jest } = require('@jest/globals');
    return {
        useUIStore: jest.fn()
    };
});
jest.mock('@/hooks/useRoomDrag', () => {
    const { jest } = require('@jest/globals');
    return {
        useRoomDrag: jest.fn()
    };
});
jest.mock('@/components/editor/RoomShape', () => ({
  RoomShape: ({ onClick, onMouseDown, onMouseEnter, onMouseLeave, isSelected, isHovered, room }: any) => (
    <rect
      data-testid={`room-${room.id}`}
      onClick={(e) => onClick(e, room.id)}
      onMouseDown={onMouseDown}
      onMouseEnter={() => onMouseEnter(room.id)}
      onMouseLeave={onMouseLeave}
      data-selected={isSelected}
      data-hovered={isHovered}
    />
  ),
}));

// Access mocks after definition
const { useFloorplanStore } = require('@/stores/floorplanStore');
const { useUIStore } = require('@/stores/uiStore');

// Helper to reset store
const resetStore = () => {
  useFloorplanStore.setState({
    currentFloorplan: {
      id: 'test-floorplan',
      name: 'Test Floorplan',
      units: 'meters',
      rooms: [],
      walls: [],
      doors: [],
      windows: [],
      connections: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0',
    },
    selectedRoomId: null,
    selectedRoomIds: [],
    isDirty: false,
  });

  useUIStore.setState({
      hoveredRoomId: null,
      propertiesPanelOpen: false,
      focusProperty: null
  });
};

describe('RoomLayer', () => {
  const mockSelectRoom = jest.fn();
  const mockSetRoomSelection = jest.fn();
  const mockSetHoveredRoom = jest.fn();
  const mockHandleDragStart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        currentFloorplan: {
          rooms: [
            { id: 'room1', name: 'Room 1' },
            { id: 'room2', name: 'Room 2' },
          ],
        },
        selectedRoomIds: ['room1'],
        selectRoom: mockSelectRoom,
        setRoomSelection: mockSetRoomSelection,
      };
      return selector(state);
    });

    (useUIStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        hoveredRoomId: null,
        setHoveredRoom: mockSetHoveredRoom,
      };
      return selector(state);
    });

    (useRoomDrag as unknown as jest.Mock).mockReturnValue({
      handleDragStart: mockHandleDragStart,
      isDragging: false,
    });
  });

  const renderComponent = () => {
    return render(
      <svg>
        <RoomLayer />
      </svg>
    );
  };

  it('renders sorted rooms', () => {
    const { container } = renderComponent();
    // Use regex to find specific room elements, ignoring the container group
    const rooms = screen.getAllByTestId(/^room-room/);

    expect(rooms).toHaveLength(2);
    // room1 is selected, so it should be last in DOM (to be on top)
    expect(rooms[1].getAttribute('data-testid')).toBe('room-room1');
  });

  it('handles room click for selection', () => {
    renderComponent();
    fireEvent.click(screen.getByTestId('room-room2'));
    expect(mockSelectRoom).toHaveBeenCalledWith('room2');
  });
  it('handles double click to open properties', () => {
    const store = useFloorplanStore.getState();
    store.addRoom({
      name: 'Room 1',
      length: 4, width: 4, height: 2.7, type: 'bedroom',
      position: { x: 0, z: 0 }, rotation: 0
    });

    // Ensure panel is closed initially
    useUIStore.setState({ propertiesPanelOpen: false, focusProperty: null });

    render(
        <svg>
            <RoomLayer />
        </svg>
    );

    const rooms = useFloorplanStore.getState().currentFloorplan?.rooms || [];
    const room = rooms[0];
    const group = screen.getByTestId(`room-shape-${room.id}`);

    fireEvent.doubleClick(group);

    expect(useUIStore.getState().propertiesPanelOpen).toBe(true);
    expect(useUIStore.getState().focusProperty).toBe('room-name');
    // Also should select the room if not selected
    expect(useFloorplanStore.getState().selectedRoomId).toBe(room.id);
  });

  it('sorts selected rooms to top', () => {
    const store = useFloorplanStore.getState();
    store.addRoom({ name: 'R1', length: 4, width: 4, height: 2.7, type: 'other', position: { x: 0, z: 0 }, rotation: 0 });
    store.addRoom({ name: 'R2', length: 4, width: 4, height: 2.7, type: 'other', position: { x: 5, z: 0 }, rotation: 0 });

    const rooms = useFloorplanStore.getState().currentFloorplan?.rooms || [];
    const r1 = rooms[0];
    const r2 = rooms[1];

  it('handles shift+click for multi-selection', () => {
    renderComponent();
    fireEvent.click(screen.getByTestId('room-room2'), { shiftKey: true });
    expect(mockSetRoomSelection).toHaveBeenCalledWith(['room1', 'room2']);
  });

  it('handles shift+click to deselect', () => {
    renderComponent();
    fireEvent.click(screen.getByTestId('room-room1'), { shiftKey: true });
    expect(mockSetRoomSelection).toHaveBeenCalledWith([]);
  });

  it('handles room mouse down (drag start)', () => {
    renderComponent();
    fireEvent.mouseDown(screen.getByTestId('room-room1'));
    expect(mockHandleDragStart).toHaveBeenCalled();
  });

  it('handles hover states', () => {
    renderComponent();
    fireEvent.mouseEnter(screen.getByTestId('room-room1'));
    expect(mockSetHoveredRoom).toHaveBeenCalledWith('room1');

    fireEvent.mouseLeave(screen.getByTestId('room-room1'));
    expect(mockSetHoveredRoom).toHaveBeenCalledWith(null);
  });
});
