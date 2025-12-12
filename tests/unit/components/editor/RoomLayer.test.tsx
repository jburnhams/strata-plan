import { render, screen, fireEvent } from '@testing-library/react';
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
