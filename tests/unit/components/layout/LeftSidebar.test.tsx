import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LeftSidebar } from '../../../../src/components/layout/LeftSidebar';
import { useFloorplanStore } from '../../../../src/stores/floorplanStore';
import { useUIStore } from '../../../../src/stores/uiStore';

// Mock dependencies
jest.mock('lucide-react', () => ({
  ChevronLeft: () => <div data-testid="icon-chevron-left" />,
  ChevronRight: () => <div data-testid="icon-chevron-right" />,
  LayoutDashboard: () => <div data-testid="icon-dashboard" />,
  Search: () => <div data-testid="icon-search" />,
  Plus: () => <div data-testid="icon-plus" />,
  DoorOpen: () => <div data-testid="icon-door" />,
  Maximize: () => <div data-testid="icon-maximize" />,
  Box: () => <div data-testid="icon-box" />,
  ChevronDown: () => <div data-testid="icon-chevron-down" />,
}));

// Mock useAddRoom hook
const mockAddRoom = jest.fn();
jest.mock('../../../../src/hooks/useAddRoom', () => ({
  useAddRoom: () => ({
    addRoom: mockAddRoom,
  }),
}));

describe('LeftSidebar', () => {
  const mockSelectRoom = jest.fn();
  const mockSetRoomSelection = jest.fn();
  const mockSelectWall = jest.fn();
  const mockSelectDoor = jest.fn();
  const mockSelectWindow = jest.fn();
  const mockToggleSidebar = jest.fn();

  beforeEach(() => {
    // Reset store state
    useFloorplanStore.setState({
      currentFloorplan: {
        id: 'test',
        name: 'test',
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
      selectedWallId: null,
      selectedDoorId: null,
      selectedWindowId: null,
    });

    useUIStore.setState({
      sidebarOpen: true,
    });

    // Mock store actions
    jest.spyOn(useFloorplanStore.getState(), 'selectRoom').mockImplementation(mockSelectRoom);
    jest.spyOn(useFloorplanStore.getState(), 'setRoomSelection').mockImplementation(mockSetRoomSelection);
    jest.spyOn(useFloorplanStore.getState(), 'selectWall').mockImplementation(mockSelectWall);
    jest.spyOn(useFloorplanStore.getState(), 'selectDoor').mockImplementation(mockSelectDoor);
    jest.spyOn(useFloorplanStore.getState(), 'selectWindow').mockImplementation(mockSelectWindow);
    jest.spyOn(useUIStore.getState(), 'toggleSidebar').mockImplementation(mockToggleSidebar);

    mockSelectRoom.mockClear();
    mockSetRoomSelection.mockClear();
    mockToggleSidebar.mockClear();
  });

  const setupData = () => {
    act(() => {
      useFloorplanStore.setState({
        currentFloorplan: {
          ...useFloorplanStore.getState().currentFloorplan!,
          rooms: [
            { id: '1', name: 'Room 1', type: 'bedroom' } as any,
            { id: '2', name: 'Room 2', type: 'kitchen' } as any,
            { id: '3', name: 'Room 3', type: 'living' } as any,
          ],
          walls: [
            { id: 'w1', from: {x:0,y:0}, to: {x:1,y:0} } as any
          ],
          doors: [
            { id: 'd1' } as any
          ],
          windows: [
            { id: 'win1' } as any
          ]
        }
      });
    });
  };

  it('renders collapsed state when sidebarOpen is false', () => {
    act(() => {
      useUIStore.setState({ sidebarOpen: false });
    });
    render(<LeftSidebar />);
    expect(screen.getByTestId('left-sidebar')).toHaveClass('w-[48px]');
    expect(screen.getByTestId('icon-chevron-right')).toBeInTheDocument();
  });

  it('renders expanded state when sidebarOpen is true', () => {
    render(<LeftSidebar />);
    expect(screen.getByTestId('left-sidebar')).toHaveClass('w-[280px]');
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });

  it('toggles sidebar on chevron click', () => {
    render(<LeftSidebar />);
    fireEvent.click(screen.getByLabelText('Collapse sidebar'));
    expect(mockToggleSidebar).toHaveBeenCalled();
  });

  it('filters rooms based on search input', () => {
    setupData();
    render(<LeftSidebar />);

    expect(screen.getByText('Room 1')).toBeInTheDocument();
    expect(screen.getByText('Room 2')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'Room 2' } });

    expect(screen.queryByText('Room 1')).not.toBeInTheDocument();
    expect(screen.getByText('Room 2')).toBeInTheDocument();
  });

  it('selects a single room on click', () => {
    setupData();
    render(<LeftSidebar />);

    fireEvent.click(screen.getByText('Room 1'));
    expect(mockSelectRoom).toHaveBeenCalledWith('1');
  });

  it('adds to selection on Ctrl+Click', () => {
    setupData();
    // Pre-select Room 1
    act(() => {
        useFloorplanStore.setState({ selectedRoomIds: ['1'] });
    });

    render(<LeftSidebar />);

    // Ctrl+Click Room 2
    fireEvent.click(screen.getByText('Room 2'), { ctrlKey: true });
    expect(mockSetRoomSelection).toHaveBeenLastCalledWith(['1', '2']);
  });

  it('removes from selection on Ctrl+Click', () => {
    setupData();
    // Pre-select Room 1 and 2
    act(() => {
        useFloorplanStore.setState({ selectedRoomIds: ['1', '2'] });
    });

    render(<LeftSidebar />);

    // Ctrl+Click Room 1
    fireEvent.click(screen.getByText('Room 1'), { ctrlKey: true });
    expect(mockSetRoomSelection).toHaveBeenLastCalledWith(['2']);
  });

  it('selects range on Shift+Click', () => {
    setupData();
    // Select Room 1
    act(() => {
        useFloorplanStore.setState({ selectedRoomIds: ['1'] });
    });

    render(<LeftSidebar />);

    // Shift+Click Room 3
    fireEvent.click(screen.getByText('Room 3'), { shiftKey: true });

    // Should select 1, 2, 3
    const calls = mockSetRoomSelection.mock.calls;
    const lastCallArgs = calls[calls.length - 1][0];
    expect(lastCallArgs).toHaveLength(3);
    expect(lastCallArgs).toContain('1');
    expect(lastCallArgs).toContain('2');
    expect(lastCallArgs).toContain('3');
  });

  it('adds room when button clicked', () => {
    render(<LeftSidebar />);
    fireEvent.click(screen.getByText('Add Room'));
    expect(mockAddRoom).toHaveBeenCalled();
  });

  it('renders and selects walls', () => {
    setupData();
    render(<LeftSidebar />);

    // Expand Walls section if needed. By default only Rooms is open.
    const wallsHeader = screen.getByText('Walls');
    fireEvent.click(wallsHeader);

    const wallItem = screen.getByText('Wall w1');
    expect(wallItem).toBeInTheDocument();

    fireEvent.click(wallItem);
    expect(mockSelectWall).toHaveBeenCalledWith('w1');
  });

  it('renders and selects doors', () => {
    setupData();
    render(<LeftSidebar />);

    // Expand Doors section
    const doorsHeader = screen.getByText('Doors');
    fireEvent.click(doorsHeader);

    const doorItem = screen.getByText('Door d1');
    expect(doorItem).toBeInTheDocument();

    fireEvent.click(doorItem);
    expect(mockSelectDoor).toHaveBeenCalledWith('d1');
  });

  it('renders and selects windows', () => {
    setupData();
    render(<LeftSidebar />);

    // Expand Windows section
    const windowsHeader = screen.getByText('Windows');
    fireEvent.click(windowsHeader);

    const windowItem = screen.getByText('Window win1');
    expect(windowItem).toBeInTheDocument();

    fireEvent.click(windowItem);
    expect(mockSelectWindow).toHaveBeenCalledWith('win1');
  });
});
