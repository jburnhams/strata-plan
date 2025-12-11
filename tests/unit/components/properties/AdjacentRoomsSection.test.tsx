import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { AdjacentRoomsSection } from '../../../../src/components/properties/AdjacentRoomsSection';
import { useFloorplanStore } from '../../../../src/stores/floorplanStore';
import { useUIStore } from '../../../../src/stores/uiStore';
import { Room, RoomConnection } from '../../../../src/types';

// Mock dependencies
jest.mock('../../../../src/stores/floorplanStore');
jest.mock('../../../../src/stores/uiStore');
jest.mock('lucide-react', () => ({
  Link: () => <div data-testid="icon-link" />,
  DoorOpen: () => <div data-testid="icon-door" />,
  AlertCircle: () => <div data-testid="icon-alert" />,
  Unlink: () => <div data-testid="icon-unlink" />
}));

describe('AdjacentRoomsSection', () => {
  const mockRooms: Room[] = [
    {
      id: 'room1',
      name: 'Room 1',
      length: 4,
      width: 5,
      height: 3,
      type: 'bedroom',
      position: { x: 0, z: 0 },
      doors: [],
      windows: [],
      rotation: 0
    },
    {
      id: 'room2',
      name: 'Room 2',
      length: 4,
      width: 5,
      height: 3,
      type: 'living',
      position: { x: 4, z: 0 },
      doors: [],
      windows: [],
      rotation: 0
    }
  ];

  const mockConnections: RoomConnection[] = [
    {
      id: 'conn1',
      room1Id: 'room1',
      room2Id: 'room2',
      room1Wall: 'east',
      room2Wall: 'west',
      sharedWallLength: 3,
      doors: []
    }
  ];

  const mockSelectRoom = jest.fn();
  const mockRemoveConnection = jest.fn();

  beforeEach(() => {
    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        selectedRoomId: '1',
        currentFloorplan: {
          rooms: [mockRoom1, mockRoom2],
          connections: [mockConnection],
          doors: []
        },
        selectRoom: mockSelectRoom,
        removeConnection: mockRemoveConnection
      })
    );
  });

  it('should render adjacent room info', () => {
    render(<AdjacentRoomsSection />);
    jest.clearAllMocks();

    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        currentFloorplan: {
          rooms: mockRooms,
          connections: mockConnections,
        },
        selectedRoomId: 'room1',
        selectRoom: mockSelectRoom,
      };
      return selector(state);
    });

    (useUIStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        zoomLevel: 1.0,
        setPan: jest.fn(),
      };
      return selector(state);
    });
  });

  it('should render nothing if no room is selected', () => {
    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
        return selector({
          selectedRoomId: null,
          currentFloorplan: {
            rooms: mockRooms,
            connections: mockConnections
          }
        });
    });
    const { container } = render(<AdjacentRoomsSection />);
    expect(container.firstChild).toBeNull();
  });

  it('should list adjacent rooms', () => {
    const { getByText } = render(<AdjacentRoomsSection />);
    expect(getByText('Adjacent Rooms')).toBeInTheDocument();
    expect(getByText('Room 2')).toBeInTheDocument();
    expect(getByText('3.00m shared')).toBeInTheDocument();
    expect(getByText('East Wall ↔ West Wall')).toBeInTheDocument();
  });

  it('should handle clicking adjacent room', () => {
    const { getByText } = render(<AdjacentRoomsSection />);
    fireEvent.click(getByText('Room 2'));
    expect(mockSelectRoom).toHaveBeenCalledWith('room2');
  });

  it('should show message when no adjacent rooms', () => {
    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
        return selector({
             selectedRoomId: 'room1',
             currentFloorplan: {
               rooms: mockRooms,
               connections: [] // No connections
             }
        });
    });
    const { getByText } = render(<AdjacentRoomsSection />);
    expect(getByText('No adjacent rooms')).toBeInTheDocument();
  });

  it('should allow removing a connection', () => {
    window.confirm = jest.fn(() => true);
    render(<AdjacentRoomsSection />);

    const removeButton = screen.getByTitle('Remove Connection');
    fireEvent.click(removeButton);

    expect(window.confirm).toHaveBeenCalledWith('Remove this connection?');
    expect(mockRemoveConnection).toHaveBeenCalledWith('c1');
  });
});
