import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RoomLayer } from '../../../../src/components/editor/RoomLayer';
import { useFloorplanStore } from '../../../../src/stores/floorplanStore';
import { useUIStore } from '../../../../src/stores/uiStore';
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
    selectedRoomIds: [],
    isDirty: false,
  });

  useUIStore.setState({
      hoveredRoomId: null
  });
};

describe('RoomLayer', () => {
  beforeEach(() => {
    resetStore();
  });

  it('renders rooms correctly', () => {
    const store = useFloorplanStore.getState();
    store.addRoom({
      name: 'Room 1',
      length: 5,
      width: 4,
      height: 2.7,
      type: 'bedroom',
      position: { x: 1, z: 2 },
      rotation: 0,
    });

    render(
        <svg>
            <RoomLayer />
        </svg>
    );

    const rooms = useFloorplanStore.getState().currentFloorplan?.rooms || [];
    const roomId = rooms[0].id;

    // getByTestId returns the <g> element
    const group = screen.getByTestId(`room-shape-${roomId}`);
    const rect = group.querySelector('rect');

    expect(rect).toBeInTheDocument();
    expect(rect).toHaveAttribute('x', '1');
    expect(rect).toHaveAttribute('y', '2');
    expect(rect).toHaveAttribute('width', '5');
    expect(rect).toHaveAttribute('height', '4');
    expect(rect).toHaveAttribute('fill', ROOM_TYPE_COLORS.bedroom);
  });

  it('handles rotation', () => {
    const store = useFloorplanStore.getState();
    store.addRoom({
      name: 'Room 1',
      length: 4,
      width: 2,
      height: 2.7,
      type: 'bedroom',
      position: { x: 10, z: 10 },
      rotation: 90,
    });

    render(
        <svg>
            <RoomLayer />
        </svg>
    );

    const rooms = useFloorplanStore.getState().currentFloorplan?.rooms || [];
    const room = rooms[0];
    const group = screen.getByTestId(`room-shape-${room.id}`);

    const cx = 10 + 2; // x + length/2
    const cy = 10 + 1; // z + width/2

    expect(group).toHaveAttribute('transform', `rotate(90, ${cx}, ${cy})`);
  });

  it('handles click selection', () => {
    const store = useFloorplanStore.getState();
    store.addRoom({
      name: 'Room 1',
      length: 4, width: 4, height: 2.7, type: 'bedroom',
      position: { x: 0, z: 0 }, rotation: 0
    });

    render(
        <svg>
            <RoomLayer />
        </svg>
    );

    const rooms = useFloorplanStore.getState().currentFloorplan?.rooms || [];
    const room = rooms[0];
    const group = screen.getByTestId(`room-shape-${room.id}`);

    fireEvent.click(group);

    expect(useFloorplanStore.getState().selectedRoomId).toBe(room.id);
  });

  it('handles multi-selection with shift click', () => {
    const store = useFloorplanStore.getState();
    store.addRoom({ name: 'R1', length: 4, width: 4, height: 2.7, type: 'other', position: { x: 0, z: 0 }, rotation: 0 });
    store.addRoom({ name: 'R2', length: 4, width: 4, height: 2.7, type: 'other', position: { x: 5, z: 0 }, rotation: 0 });

    render(
        <svg>
            <RoomLayer />
        </svg>
    );

    const rooms = useFloorplanStore.getState().currentFloorplan?.rooms || [];
    const r1 = rooms[0];
    const r2 = rooms[1];

    // Select R1
    fireEvent.click(screen.getByTestId(`room-shape-${r1.id}`));
    expect(useFloorplanStore.getState().selectedRoomIds).toEqual([r1.id]);

    // Shift+Click R2
    fireEvent.click(screen.getByTestId(`room-shape-${r2.id}`), { shiftKey: true });
    expect(useFloorplanStore.getState().selectedRoomIds).toEqual(expect.arrayContaining([r1.id, r2.id]));

    // Shift+Click R1 again (deselect)
    fireEvent.click(screen.getByTestId(`room-shape-${r1.id}`), { shiftKey: true });
    expect(useFloorplanStore.getState().selectedRoomIds).toEqual([r2.id]);
  });

  it('sorts selected rooms to top', () => {
    const store = useFloorplanStore.getState();
    store.addRoom({ name: 'R1', length: 4, width: 4, height: 2.7, type: 'other', position: { x: 0, z: 0 }, rotation: 0 });
    store.addRoom({ name: 'R2', length: 4, width: 4, height: 2.7, type: 'other', position: { x: 5, z: 0 }, rotation: 0 });

    const rooms = useFloorplanStore.getState().currentFloorplan?.rooms || [];
    const r1 = rooms[0];
    const r2 = rooms[1];

    // Initially R1 then R2
    const { rerender } = render(
      <svg>
        <RoomLayer />
      </svg>
    );

    // We check DOM order
    let shapes = screen.getAllByTestId(/^room-shape-/);
    expect(shapes[0]).toHaveAttribute('data-testid', `room-shape-${r1.id}`);
    expect(shapes[1]).toHaveAttribute('data-testid', `room-shape-${r2.id}`);

    // Select R1
    act(() => { useFloorplanStore.getState().selectRoom(r1.id); });

    rerender(
      <svg>
        <RoomLayer />
      </svg>
    );

    shapes = screen.getAllByTestId(/^room-shape-/);
    // Should be R2 then R1 (selected on top)
    expect(shapes[0]).toHaveAttribute('data-testid', `room-shape-${r2.id}`);
    expect(shapes[1]).toHaveAttribute('data-testid', `room-shape-${r1.id}`);
  });
});
