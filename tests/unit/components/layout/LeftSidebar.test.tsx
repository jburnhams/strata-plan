import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { useUIStore } from '@/stores/uiStore';
import { useFloorplanStore } from '@/stores/floorplanStore';

// Mock stores
jest.mock('@/stores/uiStore');
jest.mock('@/stores/floorplanStore');

// Mock PointerEvent for Radix UI
if (!global.PointerEvent) {
  class MockPointerEvent extends Event {
    button: number;
    ctrlKey: boolean;
    pointerType: string;
    constructor(type: string, props: PointerEventInit) {
      super(type, props);
      this.button = props.button || 0;
      this.ctrlKey = props.ctrlKey || false;
      this.pointerType = props.pointerType || 'mouse';
    }
  }
  (global as any).PointerEvent = MockPointerEvent;
}
window.HTMLElement.prototype.scrollIntoView = jest.fn()
window.HTMLElement.prototype.releasePointerCapture = jest.fn()
window.HTMLElement.prototype.hasPointerCapture = jest.fn()

describe('LeftSidebar', () => {
  const mockToggleSidebar = jest.fn();
  const mockSelectRoom = jest.fn();
  const mockAddRoom = jest.fn();
  const mockUpdateRoom = jest.fn();
  const mockDeleteRoom = jest.fn();

  beforeEach(() => {
    (useUIStore as unknown as jest.Mock).mockReturnValue({
      sidebarOpen: true,
      toggleSidebar: mockToggleSidebar,
    });

    (useFloorplanStore as unknown as jest.Mock).mockReturnValue({
      currentFloorplan: {
        rooms: [
          { id: 'room1', name: 'Living Room', length: 5, width: 4, height: 2.4, rotation: 0, type: 'living', position: { x: 0, z: 0 } },
          { id: 'room2', name: 'Kitchen', length: 3, width: 3, height: 2.4, rotation: 0, type: 'kitchen', position: { x: 0, z: 0 } }
        ],
        walls: [],
        doors: [],
        windows: []
      },
      selectRoom: mockSelectRoom,
      addRoom: mockAddRoom,
      updateRoom: mockUpdateRoom,
      deleteRoom: mockDeleteRoom,
      selectedRoomId: null,
      selectWall: jest.fn(),
      selectDoor: jest.fn(),
      selectWindow: jest.fn(),
      selectedWallId: null,
      selectedDoorId: null,
      selectedWindowId: null,
    });

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('renders search input and sections when open', () => {
    render(<LeftSidebar />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    expect(screen.getByText('Rooms')).toBeInTheDocument();
    expect(screen.getByText('Walls')).toBeInTheDocument();
  });

  it('displays list of rooms', () => {
    render(<LeftSidebar />);
    expect(screen.getByText('Living Room')).toBeInTheDocument();
    expect(screen.getByText('Kitchen')).toBeInTheDocument();
    expect(screen.getByText('20.0m²')).toBeInTheDocument(); // 5 * 4
  });

  it('filters items based on search with debounce', async () => {
    render(<LeftSidebar />);
    const searchInput = screen.getByPlaceholderText('Search...');

    fireEvent.change(searchInput, { target: { value: 'Living' } });

    // Should NOT filter immediately
    expect(screen.getByText('Kitchen')).toBeInTheDocument();

    // Fast forward debounce
    act(() => {
        jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
        expect(screen.queryByText('Kitchen')).not.toBeInTheDocument();
        expect(screen.getByText('Living Room')).toBeInTheDocument();
    });
  });

  it('calls selectRoom when a room is clicked', () => {
    render(<LeftSidebar />);
    fireEvent.click(screen.getByText('Living Room'));
    expect(mockSelectRoom).toHaveBeenCalledWith('room1');
  });

  it('calls addRoom when Add Room button is clicked', () => {
    render(<LeftSidebar />);
    fireEvent.click(screen.getByText('Add Room'));
    expect(mockAddRoom).toHaveBeenCalled();
  });

  it('renders collapsed state correctly', () => {
    (useUIStore as unknown as jest.Mock).mockReturnValue({
      sidebarOpen: false,
      toggleSidebar: mockToggleSidebar,
    });

    render(<LeftSidebar />);

    expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
  });
});
