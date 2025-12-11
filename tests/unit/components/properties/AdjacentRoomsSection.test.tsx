import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdjacentRoomsSection } from '../../../../src/components/properties/AdjacentRoomsSection';
import { useFloorplanStore } from '../../../../src/stores/floorplanStore';
import { Room, RoomConnection } from '../../../../src/types';

// Mock dependencies
jest.mock('../../../../src/stores/floorplanStore');
jest.mock('../../../../src/stores/uiStore');
jest.mock('lucide-react', () => ({
  Link: () => <div data-testid="icon-link" />,
  DoorOpen: () => <div data-testid="icon-door" />,
  AlertCircle: () => <div data-testid="icon-alert" />
}));

describe('AdjacentRoomsSection', () => {
  const mockRoom1: Room = {
    id: '1',
    name: 'Room 1',
    length: 5,
    width: 5,
    height: 2.4,
    type: 'bedroom',
    position: { x: 0, z: 0 },
    rotation: 0,
    doors: [],
    windows: []
  };

  const mockRoom2: Room = {
    id: '2',
    name: 'Room 2',
    length: 5,
    width: 5,
    height: 2.4,
    type: 'bedroom',
    position: { x: 5, z: 0 },
    rotation: 0,
    doors: [],
    windows: []
  };

  const mockConnection: RoomConnection = {
    id: 'c1',
    room1Id: '1',
    room2Id: '2',
    room1Wall: 'east',
    room2Wall: 'west',
    sharedWallLength: 5,
    doors: []
  };

  const mockSelectRoom = jest.fn();

  beforeEach(() => {
    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        selectedRoomId: '1',
        currentFloorplan: {
          rooms: [mockRoom1, mockRoom2],
          connections: [mockConnection],
          doors: []
        },
        selectRoom: mockSelectRoom
      })
    );
  });

  it('should render adjacent room info', () => {
    render(<AdjacentRoomsSection />);

    expect(screen.getByText('Room 2')).toBeInTheDocument();
    expect(screen.getByText(/5.00m shared/)).toBeInTheDocument();
    expect(screen.getByText(/East Wall ↔ West Wall/)).toBeInTheDocument();
  });

  it('should show "No adjacent rooms" if none exist', () => {
    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        selectedRoomId: '1',
        currentFloorplan: {
          rooms: [mockRoom1], // No other rooms or connections
          connections: [],
          doors: []
        },
        selectRoom: mockSelectRoom
      })
    );

    render(<AdjacentRoomsSection />);
    expect(screen.getByText('No adjacent rooms')).toBeInTheDocument();
  });

  it('should navigate to adjacent room on click', () => {
    render(<AdjacentRoomsSection />);

    fireEvent.click(screen.getByText('Room 2'));
    expect(mockSelectRoom).toHaveBeenCalledWith('2');
  });

  it('should have an "Add Door" button', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    render(<AdjacentRoomsSection />);

    const addButton = screen.getByText('+ Add Door');
    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);
    expect(consoleSpy).toHaveBeenCalledWith('Open add door dialog for connection', 'c1');
    consoleSpy.mockRestore();
  });
});
