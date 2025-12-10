import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeftSidebar } from '../../../../src/components/layout/LeftSidebar';
import { useUIStore } from '../../../../src/stores/uiStore';
import { useFloorplanStore } from '../../../../src/stores/floorplanStore';
import { useAddRoom } from '../../../../src/hooks/useAddRoom';

// Mock the Lucide icons
jest.mock('lucide-react', () => ({
  ChevronLeft: () => <div data-testid="chevron-left" />,
  ChevronRight: () => <div data-testid="chevron-right" />,
  LayoutDashboard: () => <div data-testid="layout-dashboard" />,
  Search: () => <div data-testid="search-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  DoorOpen: () => <div data-testid="door-icon" />,
  Maximize: () => <div data-testid="window-icon" />,
  Box: () => <div data-testid="box-icon" />,
  ChevronDown: () => <div data-testid="chevron-down" />,
}));

// Mock SidebarSection to avoid testing it again and focus on LeftSidebar logic
jest.mock('../../../../src/components/layout/SidebarSection', () => ({
  SidebarSection: ({ title, children, count }: any) => (
    <div data-testid={`section-${title}`}>
      <button>{title} ({count})</button>
      <div>{children}</div>
    </div>
  ),
}));

// Mock useAddRoom
jest.mock('../../../../src/hooks/useAddRoom', () => ({
  useAddRoom: jest.fn(),
}));

describe('LeftSidebar', () => {
  const initialState = useUIStore.getState();
  const mockSelectRoom = jest.fn();
  const mockSelectWall = jest.fn();
  const mockSelectDoor = jest.fn();
  const mockSelectWindow = jest.fn();
  const mockAddRoom = jest.fn();

  beforeEach(() => {
    useUIStore.setState(initialState, true);
    (useAddRoom as jest.Mock).mockReturnValue({ addRoom: mockAddRoom });
    jest.clearAllMocks();

    // Setup default floorplan store mock
    useFloorplanStore.setState({
      currentFloorplan: {
        id: '1',
        name: 'Test Plan',
        units: 'meters',
        rooms: [
          { id: 'r1', name: 'Living Room', color: '#fff', position: {x:0,z:0}, length: 4, width: 4, height: 2.4, type: 'living' },
          { id: 'r2', name: 'Kitchen', color: '#fff', position: {x:5,z:0}, length: 3, width: 3, height: 2.4, type: 'kitchen' }
        ],
        walls: [],
        doors: [],
        windows: [],
        connections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0'
      },
      selectRoom: mockSelectRoom,
      selectedRoomId: null,
      selectedWallId: null,
      selectedDoorId: null,
      selectedWindowId: null,
      selectWall: mockSelectWall,
      selectDoor: mockSelectDoor,
      selectWindow: mockSelectWindow,
    } as any);
  });

  it('renders expanded by default', () => {
    render(<LeftSidebar />);
    const sidebar = screen.getByTestId('left-sidebar');
    expect(sidebar).toHaveClass('w-[280px]');
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });

  it('renders sections with correct counts', () => {
    render(<LeftSidebar />);
    expect(screen.getByText('Rooms (2)')).toBeInTheDocument();
    expect(screen.getByText('Walls (0)')).toBeInTheDocument();
  });

  it('lists rooms', () => {
    render(<LeftSidebar />);
    expect(screen.getByText('Living Room')).toBeInTheDocument();
    expect(screen.getByText('Kitchen')).toBeInTheDocument();
  });

  it('filters rooms based on search', () => {
    render(<LeftSidebar />);
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'Living' } });

    expect(screen.getByText('Living Room')).toBeInTheDocument();
    expect(screen.queryByText('Kitchen')).not.toBeInTheDocument();
  });

  it('selects a room on click', () => {
    render(<LeftSidebar />);
    const roomItem = screen.getByText('Living Room');
    fireEvent.click(roomItem);
    expect(mockSelectRoom).toHaveBeenCalledWith('r1');
  });

  it('adds a room when button clicked', () => {
    render(<LeftSidebar />);
    const addButton = screen.getByText('Add Room');
    fireEvent.click(addButton);
    expect(mockAddRoom).toHaveBeenCalled();
  });

  it('renders walls, doors, and windows sections and allows selection', () => {
    useFloorplanStore.setState({
      currentFloorplan: {
        ...useFloorplanStore.getState().currentFloorplan!,
        walls: [{ id: 'w1', start: {x:0,z:0}, end: {x:4,z:0}, thickness: 0.2, height: 2.4 }],
        doors: [{ id: 'd1', roomId: 'r1', width: 0.8, height: 2.0, position: 0.5 }],
        windows: [{ id: 'win1', roomId: 'r1', width: 1.0, height: 1.2, position: 0.5, sillHeight: 1.0 }],
      } as any
    });

    render(<LeftSidebar />);

    // Walls
    const wallItem = screen.getByText('Wall w1');
    expect(wallItem).toBeInTheDocument();
    fireEvent.click(wallItem);
    expect(mockSelectWall).toHaveBeenCalledWith('w1');

    // Doors
    const doorItem = screen.getByText('Door d1');
    expect(doorItem).toBeInTheDocument();
    fireEvent.click(doorItem);
    expect(mockSelectDoor).toHaveBeenCalledWith('d1');

    // Windows
    const windowItem = screen.getByText('Window win1');
    expect(windowItem).toBeInTheDocument();
    fireEvent.click(windowItem);
    expect(mockSelectWindow).toHaveBeenCalledWith('win1');
  });

  it('handles empty lists correctly', () => {
     useFloorplanStore.setState({
      currentFloorplan: {
        ...useFloorplanStore.getState().currentFloorplan!,
        rooms: [],
        walls: [],
        doors: [],
        windows: []
      } as any
    });
    render(<LeftSidebar />);
    expect(screen.getByText('No rooms')).toBeInTheDocument();
    expect(screen.getByText('No walls')).toBeInTheDocument();
    expect(screen.getByText('No doors')).toBeInTheDocument();
    expect(screen.getByText('No windows')).toBeInTheDocument();
  });

   it('renders collapsed when sidebarOpen is false', () => {
    useUIStore.setState({ sidebarOpen: false });
    render(<LeftSidebar />);
    const sidebar = screen.getByTestId('left-sidebar');

    expect(sidebar).toHaveClass('w-[48px]');
    expect(screen.queryByText('Navigation')).not.toBeInTheDocument();
  });
});
