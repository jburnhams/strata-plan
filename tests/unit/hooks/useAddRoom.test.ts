import { renderHook, act } from '@testing-library/react';
import { useAddRoom } from '../../../src/hooks/useAddRoom';
import { useFloorplanStore } from '../../../src/stores/floorplanStore';

// Mock store
const mockAddRoom = jest.fn();
const mockGetRoomCount = jest.fn();

// We need to mock the store hook properly or use the real store.
// Since we are testing integration with store essentially, using real store is fine
// provided we reset it.
// Or we can mock the store methods.
// Let's use the real store but reset it, to ensure the hook interacts correctly with it.

describe('useAddRoom', () => {
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

  it('adds room with defaults', () => {
    const { result } = renderHook(() => useAddRoom());

    act(() => {
      result.current.addRoomWithDefaults();
    });

    const rooms = useFloorplanStore.getState().currentFloorplan?.rooms;
    expect(rooms).toHaveLength(1);
    expect(rooms![0].name).toBe('Room 1');
    expect(rooms![0].type).toBe('other');
  });

  it('adds room with specific type', () => {
    const { result } = renderHook(() => useAddRoom());

    act(() => {
      result.current.addRoom('bedroom');
    });

    const rooms = useFloorplanStore.getState().currentFloorplan?.rooms;
    expect(rooms).toHaveLength(1);
    expect(rooms![0].type).toBe('bedroom');
    expect(rooms![0].name).toContain('Bedroom');
  });

  it('increments room name counter', () => {
    const { result } = renderHook(() => useAddRoom());

    act(() => {
      result.current.addRoom('other'); // Room 1
      result.current.addRoom('other'); // Room 2
    });

    const rooms = useFloorplanStore.getState().currentFloorplan?.rooms;
    expect(rooms).toHaveLength(2);
    expect(rooms![1].name).toBe('Room 2');
  });
});
