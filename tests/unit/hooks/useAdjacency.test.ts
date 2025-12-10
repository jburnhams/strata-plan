import { renderHook, act } from '@testing-library/react';
import { useConnectionSync, useAdjacentRooms } from '../../../src/hooks/useAdjacency';
import { useFloorplanStore } from '../../../src/stores/floorplanStore';
import { Room } from '../../../src/types/room';

describe('useAdjacency hooks', () => {
  beforeEach(() => {
    act(() => {
        useFloorplanStore.getState().createFloorplan('Test', 'meters');
    });
  });

  afterEach(() => {
    act(() => {
        useFloorplanStore.getState().clearFloorplan();
    });
  });

  const room1Data: Omit<Room, 'id'> = {
    name: 'Room 1',
    length: 5,
    width: 5,
    height: 3,
    type: 'bedroom',
    position: { x: 0, z: 0 },
    rotation: 0,
    doors: [],
    windows: []
  };

  const room2Data: Omit<Room, 'id'> = {
    name: 'Room 2',
    length: 5,
    width: 5,
    height: 3,
    type: 'kitchen',
    position: { x: 5, z: 0 },
    rotation: 0,
    doors: [],
    windows: []
  };

  it('useAdjacentRooms returns correct rooms', () => {
    let r1: Room;
    act(() => {
        r1 = useFloorplanStore.getState().addRoom(room1Data);
        useFloorplanStore.getState().addRoom(room2Data);
    });

    const { result } = renderHook(() => useAdjacentRooms(r1.id));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('Room 2');
  });

  it('useConnectionSync triggers recalculation on room update', async () => {
    jest.useFakeTimers();

    // Add two rooms apart
    let r1: Room, r2: Room;
    act(() => {
        r1 = useFloorplanStore.getState().addRoom(room1Data);
        r2 = useFloorplanStore.getState().addRoom({ ...room2Data, position: { x: 10, z: 0 } });
    });

    // Initial: 0 connections
    expect(useFloorplanStore.getState().currentFloorplan?.connections).toHaveLength(0);

    // Setup hook
    renderHook(() => useConnectionSync(300));

    // Move room 2 to be adjacent
    act(() => {
        useFloorplanStore.getState().updateRoom(r2.id, { position: { x: 5, z: 0 } });
    });

    // Immediate: still 0 (debounced)
    expect(useFloorplanStore.getState().currentFloorplan?.connections).toHaveLength(0);

    // Advance time
    act(() => {
        jest.advanceTimersByTime(300);
    });

    // Should have recalculated
    expect(useFloorplanStore.getState().currentFloorplan?.connections).toHaveLength(1);

    jest.useRealTimers();
  });
});
