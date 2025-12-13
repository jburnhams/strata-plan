import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileRoomTable } from '@/components/table/MobileRoomTable';
import { useFloorplanStore } from '@/stores/floorplanStore';
import { RoomType } from '@/types/room';

// Mock icons
jest.mock('lucide-react', () => ({
  Plus: () => <div data-testid="icon-plus" />,
  ChevronDown: () => <div />,
  ChevronUp: () => <div />,
  Edit2: () => <div />,
  Trash2: () => <div />,
  Copy: () => <div />,
}));

// Mock child components
jest.mock('@/components/table/RoomCard', () => ({
  RoomCard: ({ room }: any) => <div data-testid="room-card">{room.name}</div>,
}));

jest.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/stores/floorplanStore');

describe('MobileRoomTable', () => {
  const mockAddRoom = jest.fn();

  beforeEach(() => {
    mockAddRoom.mockClear();
  });

  it('renders list of rooms', () => {
    (useFloorplanStore as unknown as jest.Mock).mockReturnValue({
      currentFloorplan: {
        rooms: [
          { id: '1', name: 'Room 1' },
          { id: '2', name: 'Room 2' },
        ],
      },
      addRoom: mockAddRoom,
    });

    render(<MobileRoomTable />);

    expect(screen.getByText('Rooms (2)')).toBeInTheDocument();
    expect(screen.getAllByTestId('room-card')).toHaveLength(2);
    expect(screen.getByText('Room 1')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    (useFloorplanStore as unknown as jest.Mock).mockReturnValue({
      currentFloorplan: {
        rooms: [],
      },
      addRoom: mockAddRoom,
    });

    render(<MobileRoomTable />);

    expect(screen.getByText('No rooms added yet.')).toBeInTheDocument();
  });

  it('adds a room when button is clicked', () => {
    (useFloorplanStore as unknown as jest.Mock).mockReturnValue({
      currentFloorplan: {
        rooms: [],
      },
      addRoom: mockAddRoom,
    });

    render(<MobileRoomTable />);

    fireEvent.click(screen.getByText('Add Room').closest('button')!);

    expect(mockAddRoom).toHaveBeenCalledWith(expect.objectContaining({
        type: 'bedroom'
    }));
  });
});
