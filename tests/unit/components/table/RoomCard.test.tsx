import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoomCard } from '@/components/table/RoomCard';
import { useFloorplanStore } from '@/stores/floorplanStore';
import { RoomType } from '@/types/room';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  ChevronDown: () => <div data-testid="icon-chevron-down" />,
  ChevronUp: () => <div data-testid="icon-chevron-up" />,
  Edit2: () => <div data-testid="icon-edit" />,
  Trash2: () => <div data-testid="icon-trash" />,
  Copy: () => <div data-testid="icon-copy" />,
}));

// Mock UI components using absolute paths
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className} data-testid="card">{children}</div>,
  CardHeader: ({ children, onClick, className }: any) => <div className={className} onClick={onClick} data-testid="card-header">{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className} data-testid="card-content">{children}</div>,
  CardTitle: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

jest.mock('@/stores/floorplanStore');

describe('RoomCard', () => {
  const mockRoom = {
    id: 'room-1',
    name: 'Master Bedroom',
    length: 5,
    width: 4,
    height: 2.7,
    type: 'bedroom' as RoomType,
    position: { x: 0, z: 0 },
    doors: [],
    windows: [],
    rotation: 0 as 0 | 90 | 180 | 270,
    walls: []
  };

  const mockSetRoomSelection = jest.fn();
  const mockDeleteRoom = jest.fn();
  const mockAddRoom = jest.fn();

  beforeEach(() => {
    (useFloorplanStore as unknown as jest.Mock).mockReturnValue({
      setRoomSelection: mockSetRoomSelection,
      deleteRoom: mockDeleteRoom,
      addRoom: mockAddRoom,
      updateRoom: jest.fn(),
    });
    window.confirm = jest.fn(() => true);
  });

  it('renders room summary correctly', () => {
    render(<RoomCard room={mockRoom} />);

    expect(screen.getByText('Master Bedroom')).toBeInTheDocument();
    expect(screen.getAllByText(/bedroom/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/20\.00 m²/)).toBeInTheDocument();
  });

  it('expands on click and sets selection', () => {
    render(<RoomCard room={mockRoom} />);

    expect(screen.queryByTestId('card-content')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('card-header'));

    expect(screen.getByTestId('card-content')).toBeInTheDocument();
    expect(mockSetRoomSelection).toHaveBeenCalledWith(['room-1']);

    expect(screen.getByText('5.00')).toBeInTheDocument();
    expect(screen.getByText('4.00')).toBeInTheDocument();
  });

  it('handles delete action', () => {
    render(<RoomCard room={mockRoom} />);
    fireEvent.click(screen.getByTestId('card-header'));

    const deleteBtn = screen.getByText('Delete').closest('button');
    fireEvent.click(deleteBtn!);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockDeleteRoom).toHaveBeenCalledWith('room-1');
  });

  it('handles duplicate action', () => {
    render(<RoomCard room={mockRoom} />);
    fireEvent.click(screen.getByTestId('card-header'));

    const copyBtn = screen.getByText('Copy').closest('button');
    fireEvent.click(copyBtn!);

    expect(mockAddRoom).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Master Bedroom (Copy)',
        position: { x: 1, z: 1 }
    }));
  });
});
