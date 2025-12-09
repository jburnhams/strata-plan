import { renderHook, act } from '@testing-library/react';
import { useFloorplanStore } from '../../../src/stores/floorplanStore';
import { useAddRoom } from '../../../src/hooks/useAddRoom';

describe('Auto-Positioning', () => {
  beforeEach(() => {
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
      isDirty: false
    });
  });

  it('positions first room at 0,0', () => {
    const { result } = renderHook(() => useAddRoom());

    act(() => {
      result.current.addRoom();
    });

    const rooms = useFloorplanStore.getState().currentFloorplan?.rooms;
    expect(rooms).toHaveLength(1);
    expect(rooms![0].position).toEqual({ x: 0, z: 0 });
  });

  it('positions second room after first room + gap', () => {
    const { result } = renderHook(() => useAddRoom());

    act(() => {
      // Room 1: 4x4 at 0,0
      result.current.addRoom();
    });

    act(() => {
        // Room 2: 4x4
        result.current.addRoom();
    });

    const rooms = useFloorplanStore.getState().currentFloorplan?.rooms;
    expect(rooms).toHaveLength(2);

    // Room 1 ends at x=4. Default gap is 1. Room 2 should start at x=5.
    expect(rooms![1].position.x).toBeCloseTo(5);
    expect(rooms![1].position.z).toBe(0);
  });

  it('positions third room after second room + gap', () => {
    const { result } = renderHook(() => useAddRoom());

    act(() => {
      result.current.addRoom(); // x=0, length=4 -> ends 4
      result.current.addRoom(); // x=5, length=4 -> ends 9
      result.current.addRoom(); // x=10
    });

    const rooms = useFloorplanStore.getState().currentFloorplan?.rooms;
    expect(rooms).toHaveLength(3);

    expect(rooms![2].position.x).toBeCloseTo(10);
  });
});
