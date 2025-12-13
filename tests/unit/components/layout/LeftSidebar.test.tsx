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
  Layers: () => <div data-testid="icon-layers" />,
  List: () => <div data-testid="icon-list" />,
  Copy: () => <div data-testid="icon-copy" />,
  Trash2: () => <div data-testid="icon-trash" />,
}));

// Mock DoorsList and WindowsList to avoid testing their internal structure (ContextMenu etc)
jest.mock('../../../../src/components/sidebar/DoorsList', () => ({
  DoorsList: () => {
    const { currentFloorplan, selectDoor } = require('../../../../src/stores/floorplanStore').useFloorplanStore();
    return (
      <div>
        <button>Doors</button>
        {(currentFloorplan?.doors || []).map((d: any) => (
           <div key={d.id} data-testid={`door-list-item-${d.id}`} onClick={() => selectDoor(d.id)}>
             Single Door
             <span>Door in {currentFloorplan.rooms.find((r: any) => r.id === d.roomId)?.name}</span>
           </div>
        ))}
      </div>
    );
  }
}));

jest.mock('../../../../src/components/sidebar/WindowsList', () => ({
  WindowsList: () => {
    const { currentFloorplan, selectWindow } = require('../../../../src/stores/floorplanStore').useFloorplanStore();
    return (
      <div>
        <button>Windows</button>
        {(currentFloorplan?.windows || []).map((w: any) => (
           <div key={w.id} data-testid={`window-list-item-${w.id}`} onClick={() => selectWindow(w.id)}>
             1.2m x 1.2m
             <span>Window in {currentFloorplan.rooms.find((r: any) => r.id === w.roomId)?.name}</span>
           </div>
        ))}
      </div>
    );
  }
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
            { id: 'd1', type: 'single', roomId: '1' } as any
          ],
          windows: [
            { id: 'win1', roomId: '1', width: 1.2, height: 1.2 } as any
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
    act(() => {
        useFloorplanStore.setState({ selectedRoomIds: ['1'] });
    });

    render(<LeftSidebar />);

    fireEvent.click(screen.getByText('Room 2'), { ctrlKey: true });
    expect(mockSetRoomSelection).toHaveBeenLastCalledWith(['1', '2']);
  });

  it('removes from selection on Ctrl+Click', () => {
    setupData();
    act(() => {
        useFloorplanStore.setState({ selectedRoomIds: ['1', '2'] });
    });

    render(<LeftSidebar />);

    fireEvent.click(screen.getByText('Room 1'), { ctrlKey: true });
    expect(mockSetRoomSelection).toHaveBeenLastCalledWith(['2']);
  });

  it('selects range on Shift+Click', () => {
    setupData();
    act(() => {
        useFloorplanStore.setState({ selectedRoomIds: ['1'] });
    });

    render(<LeftSidebar />);

    fireEvent.click(screen.getByText('Room 3'), { shiftKey: true });

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

    // Since we mocked DoorsList, 'Doors' button is always visible
    const doorsHeader = screen.getByText('Doors');
    fireEvent.click(doorsHeader);

    const doorType = screen.getByText('Single Door');
    expect(doorType).toBeInTheDocument();

    const roomNames = screen.getAllByText('Room 1');
    expect(roomNames.length).toBeGreaterThanOrEqual(1);

    const doorItem = screen.getByTestId('door-list-item-d1');
    fireEvent.click(doorItem);
    expect(mockSelectDoor).toHaveBeenCalledWith('d1');
  });

  it('renders and selects windows', () => {
    setupData();
    render(<LeftSidebar />);

    const windowsHeader = screen.getByText('Windows');
    fireEvent.click(windowsHeader);

    const windowItem = screen.getByText('1.2m x 1.2m');
    expect(windowItem).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('window-list-item-win1'));
    expect(mockSelectWindow).toHaveBeenCalledWith('win1');
  });
});
