import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RoomTable } from '../../../../src/components/table/RoomTable';
import { useFloorplanStore } from '../../../../src/stores/floorplanStore';
import { RoomType } from '../../../../src/types';
import { ROOM_TYPE_COLORS } from '../../../../src/constants/colors';

// Helper to reset store
const resetStore = () => {
  useFloorplanStore.setState({
    currentFloorplan: {
      id: 'test-floorplan',
      name: 'Test Floorplan',
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
    isDirty: false,
  });
};

describe('RoomTable', () => {
  beforeEach(() => {
    resetStore();
  });

  it('renders empty state when no rooms', () => {
    render(<RoomTable />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('No rooms yet. Add your first room to get started.')).toBeInTheDocument();
  });

  it('renders correct number of rows for rooms', () => {
    const store = useFloorplanStore.getState();
    store.addRoom({
      name: 'Room 1',
      length: 4,
      width: 4,
      height: 2.7,
      type: 'bedroom',
      position: { x: 0, z: 0 },
      rotation: 0,
    });
    store.addRoom({
      name: 'Room 2',
      length: 3,
      width: 3,
      height: 2.7,
      type: 'kitchen',
      position: { x: 0, z: 0 },
      rotation: 0,
    });

    render(<RoomTable />);
    // Rows: Header(1) + Room1(1) + Room2(1) + Footer Add(1) + Footer Totals(1) = 5
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(5);
    expect(screen.getByText('Room 1')).toBeInTheDocument();
    expect(screen.getByText('Room 2')).toBeInTheDocument();
  });

  it('row colors match room types', async () => {
    const store = useFloorplanStore.getState();
    const roomType: RoomType = 'bedroom';
    store.addRoom({
      name: 'Bedroom',
      length: 4,
      width: 4,
      height: 2.7,
      type: roomType,
      position: { x: 0, z: 0 },
      rotation: 0,
    });

    render(<RoomTable />);

    const rooms = useFloorplanStore.getState().currentFloorplan?.rooms;
    expect(rooms).toBeDefined();
    expect(rooms?.length).toBe(1);

    if (rooms && rooms[0]) {
        const row = await screen.findByTestId(`room-row-${rooms[0].id}`);
        expect(row).toHaveStyle({ backgroundColor: `${ROOM_TYPE_COLORS[roomType]}20` });
    }
  });

  it('totals calculate correctly', () => {
    const store = useFloorplanStore.getState();
    store.addRoom({
      name: 'Room 1',
      length: 4,
      width: 5,
      height: 3,
      type: 'other',
      position: { x: 0, z: 0 },
      rotation: 0,
    });
    store.addRoom({
      name: 'Room 2',
      length: 2,
      width: 3,
      height: 2,
      type: 'other',
      position: { x: 0, z: 0 },
      rotation: 0,
    });

    render(<RoomTable />);

    expect(screen.getByText(/Area: 26.0/)).toBeInTheDocument();
    expect(screen.getByText(/Vol: 72.0/)).toBeInTheDocument();
    expect(screen.getByText(/2 rooms/)).toBeInTheDocument();
  });

  it('Add Room button renders in footer', () => {
    const store = useFloorplanStore.getState();
    store.addRoom({
      name: 'Room 1',
      length: 4,
      width: 4,
      height: 2.7,
      type: 'bedroom',
      position: { x: 0, z: 0 },
      rotation: 0,
    });

    render(<RoomTable />);
    const buttons = screen.getAllByText('+ Add Room');
    const footerBtn = buttons.find(b => b.classList.contains('add-room-button-footer'));
    expect(footerBtn).toBeInTheDocument();
  });

  it('Add Room button adds a room', () => {
    render(<RoomTable />);
    fireEvent.click(screen.getByText('+ Add Room'));
    expect(useFloorplanStore.getState().currentFloorplan?.rooms).toHaveLength(1);
  });

  it('Delete button removes a room', () => {
      const confirmSpy = jest.spyOn(window, 'confirm');
      confirmSpy.mockImplementation(() => true);

      const store = useFloorplanStore.getState();
      store.addRoom({
        name: 'Room 1',
        length: 4,
        width: 4,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      });

      render(<RoomTable />);
      fireEvent.click(screen.getByText('Delete'));

      expect(confirmSpy).toHaveBeenCalled();
      expect(useFloorplanStore.getState().currentFloorplan?.rooms).toHaveLength(0);

      confirmSpy.mockRestore();
  });

  it('sorts rows when header clicked', () => {
    const store = useFloorplanStore.getState();
    store.addRoom({
      name: 'Z Room',
      length: 4, width: 4, height: 2.7, type: 'bedroom', position: { x: 0, z: 0 }, rotation: 0
    });
    store.addRoom({
      name: 'A Room',
      length: 4, width: 4, height: 2.7, type: 'bedroom', position: { x: 0, z: 0 }, rotation: 0
    });

    render(<RoomTable />);

    // Initial order: Z, A
    let rows = screen.getAllByTestId(/room-row-/);
    expect(rows[0]).toHaveTextContent('Z Room');
    expect(rows[1]).toHaveTextContent('A Room');

    // Click Name header to sort Ascending
    fireEvent.click(screen.getByText('Room Name'));

    rows = screen.getAllByTestId(/room-row-/);
    expect(rows[0]).toHaveTextContent('A Room');
    expect(rows[1]).toHaveTextContent('Z Room');

    // Click again for Descending
    fireEvent.click(screen.getByText('Room Name'));

    rows = screen.getAllByTestId(/room-row-/);
    expect(rows[0]).toHaveTextContent('Z Room');
    expect(rows[1]).toHaveTextContent('A Room');
  });

  it('re-layout updates room positions', () => {
      const confirmSpy = jest.spyOn(window, 'confirm');
      confirmSpy.mockImplementation(() => true);

      const store = useFloorplanStore.getState();
      // Add rooms with manual positions
      store.addRoom({
        name: 'Room 1',
        length: 5, width: 4, height: 2.7, type: 'bedroom',
        position: { x: 0, z: 0 }, rotation: 0
      });
      store.addRoom({
        name: 'Room 2',
        length: 5, width: 4, height: 2.7, type: 'bedroom',
        position: { x: 0, z: 0 }, rotation: 0
      });

      render(<RoomTable />);

      // Click Re-layout
      const relayoutBtn = screen.getByText('Re-layout');
      fireEvent.click(relayoutBtn);

      expect(confirmSpy).toHaveBeenCalled();

      // Check store for updated positions
      const updatedState = useFloorplanStore.getState();
      const rooms = updatedState.currentFloorplan?.rooms || [];
      expect(rooms).toHaveLength(2);

      // Room 1 should be at 0,0
      expect(rooms[0].position.x).toBe(0);

      // Room 2 should be at 5 + GAP (1) = 6
      expect(rooms[1].position.x).toBe(6);

      confirmSpy.mockRestore();
  });

  it('displays validation summary in header', () => {
    const store = useFloorplanStore.getState();
    store.addRoom({
      name: '', // Error: empty name
      length: 0.05, // Error: < 0.1
      width: 0.5, // Warning: < 1
      height: 3.8, // Warning: > 3.5
      type: 'bedroom',
      position: { x: 0, z: 0 },
      rotation: 0,
    });
    // This room has:
    // Name: Error
    // Length: Error
    // Width: Warning
    // Height: Warning
    // Total: 2 Errors, 2 Warnings

    render(<RoomTable />);

    expect(screen.getByText('2 Errors')).toBeInTheDocument();
    expect(screen.getByText('2 Warnings')).toBeInTheDocument();
  });

  it('scrolls to invalid room when validation summary clicked', () => {
    const store = useFloorplanStore.getState();
    store.addRoom({
      name: '',
      length: 4, width: 4, height: 2.7, type: 'bedroom',
      position: { x: 0, z: 0 }, rotation: 0
    });

    render(<RoomTable />);

    // Mock scrollIntoView
    const scrollIntoViewMock = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

    // Click error badge
    fireEvent.click(screen.getByText(/1 Error/));

    expect(scrollIntoViewMock).toHaveBeenCalled();
  });

  it('scrolls to selected room when selection changes externally', async () => {
    const store = useFloorplanStore.getState();
    store.addRoom({
      name: 'Room 1',
      length: 4, width: 4, height: 2.7, type: 'bedroom',
      position: { x: 0, z: 0 }, rotation: 0
    });
    // The store generates IDs if not provided. We need to find the ID of the second room.
    store.addRoom({
      name: 'Room 2',
      length: 4, width: 4, height: 2.7, type: 'bedroom',
      position: { x: 0, z: 0 }, rotation: 0
    });

    const rooms = useFloorplanStore.getState().currentFloorplan?.rooms || [];
    expect(rooms).toHaveLength(2);
    const secondRoomId = rooms[1].id;

    render(<RoomTable />);

    // Mock scrollIntoView
    const scrollIntoViewMock = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

    // Trigger selection change in store
    act(() => {
        useFloorplanStore.getState().selectRoom(secondRoomId);
    });

    await waitFor(() => {
        expect(scrollIntoViewMock).toHaveBeenCalled();
    });
  });
});
