import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoomLayer } from '../../../../src/components/editor/RoomLayer';
import { useFloorplanStore } from '../../../../src/stores/floorplanStore';
import { Room } from '../../../../src/types';

jest.mock('../../../../src/stores/floorplanStore');

describe('RoomLayer', () => {
  const mockRooms: Room[] = [
    {
      id: 'room-1',
      name: 'Room 1',
      length: 5,
      width: 4,
      height: 2.7,
      type: 'living',
      position: { x: 0, z: 0 },
      rotation: 0,
      doors: [],
      windows: []
    },
    {
      id: 'room-2',
      name: 'Room 2',
      length: 3,
      width: 3,
      height: 2.7,
      type: 'bedroom',
      position: { x: 6, z: 0 },
      rotation: 0,
      doors: [],
      windows: []
    }
  ];

  const mockStore = {
      currentFloorplan: {
          rooms: mockRooms,
          id: 'fp-1',
          name: 'Plan',
          units: 'meters',
          walls: [],
          doors: [],
          windows: [],
          connections: []
      },
      selectedRoomIds: [],
      selectRoom: jest.fn(),
      setRoomSelection: jest.fn(),
  };

  const mockOnRoomMouseDown = jest.fn();

  beforeEach(() => {
    (useFloorplanStore as unknown as jest.Mock).mockReturnValue(mockStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockOnRoomMouseDown.mockClear();
  });

  it('renders all rooms', () => {
    render(
      <svg>
        <RoomLayer onRoomMouseDown={mockOnRoomMouseDown} />
      </svg>
    );
    expect(screen.getByTestId('room-room-1')).toBeInTheDocument();
    expect(screen.getByTestId('room-room-2')).toBeInTheDocument();
  });

  it('sorts selected room to top', () => {
    (useFloorplanStore as unknown as jest.Mock).mockReturnValue({
        ...mockStore,
        selectedRoomIds: ['room-1']
    });

    const { container } = render(
      <svg>
        <RoomLayer onRoomMouseDown={mockOnRoomMouseDown} />
      </svg>
    );

    // In SVG, last child is on top.
    const roomGroups = container.querySelectorAll('g[data-testid^="room-room-"]');
    expect(roomGroups.length).toBe(2);
    expect(roomGroups[0]).toHaveAttribute('data-testid', 'room-room-2');
    expect(roomGroups[1]).toHaveAttribute('data-testid', 'room-room-1');
  });

  it('calls onRoomMouseDown on mouse down', () => {
    render(
      <svg>
        <RoomLayer onRoomMouseDown={mockOnRoomMouseDown} />
      </svg>
    );

    fireEvent.mouseDown(screen.getByTestId('room-room-1'));
    expect(mockOnRoomMouseDown).toHaveBeenCalledWith(expect.anything(), 'room-1');
  });
});
