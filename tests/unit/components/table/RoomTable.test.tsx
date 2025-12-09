import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    const rows = screen.getAllByRole('row');
    // Header + 2 rooms + footer (2 rows in footer)
    expect(rows).toHaveLength(1 + 2 + 2);
    // In text cell non-editing mode, it renders a div with text
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

    // Get the room from the store
    const rooms = useFloorplanStore.getState().currentFloorplan?.rooms;
    expect(rooms).toBeDefined();
    expect(rooms?.length).toBe(1);

    if (rooms && rooms[0]) {
        const room = rooms[0];
        const row = await screen.findByTestId(`room-row-${room.id}`);
        // We applied 10-15% opacity (hex 20), checking if the style is present
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
    // Area: 20, Volume: 60

    store.addRoom({
      name: 'Room 2',
      length: 2,
      width: 3,
      height: 2,
      type: 'other',
      position: { x: 0, z: 0 },
      rotation: 0,
    });
    // Area: 6, Volume: 12

    render(<RoomTable />);

    // Total Area: 26.0 m²
    // We updated the text format slightly in the component: "Area: 26.0 m²"
    expect(screen.getByText('Area: 26.0 m²')).toBeInTheDocument();

    // Total Volume: 72.0 m³
    // We updated the text format slightly in the component: "Vol: 72.0 m³"
    expect(screen.getByText('Vol: 72.0 m³')).toBeInTheDocument();

    // Room Count
    expect(screen.getByText('2 rooms')).toBeInTheDocument();
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
    // One in empty state (not rendered here), one in footer
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveClass('add-room-button-footer');
  });

  it('Add Room button adds a room', () => {
    render(<RoomTable />);
    fireEvent.click(screen.getByText('+ Add Room'));
    expect(useFloorplanStore.getState().currentFloorplan?.rooms).toHaveLength(1);
  });

  it('Delete button removes a room', () => {
      // Mock window.confirm
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
});
