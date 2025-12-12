import { renderHook, act } from '@testing-library/react';
import { useSceneSync } from '../../../src/hooks/useSceneSync';
import { useFloorplanStore } from '../../../src/stores/floorplanStore';

// Mock useFloorplanStore
jest.mock('../../../src/stores/floorplanStore');

describe('useSceneSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should debounce floorplan updates', () => {
    // Setup initial store state
    let currentFloorplan = { id: 'fp1', rooms: [{ id: 'r1', name: 'Room 1' }] };

    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
        return selector({ currentFloorplan });
    });

    const { result, rerender } = renderHook(() => useSceneSync(100));

    // Initial render
    expect(result.current.rooms).toHaveLength(1);
    expect(result.current.rooms[0].id).toBe('r1');

    // Update store state
    currentFloorplan = { id: 'fp1', rooms: [{ id: 'r1', name: 'Room 1' }, { id: 'r2', name: 'Room 2' }] };

    // Rerender hook
    rerender();

    // Should NOT be updated yet (debouncing)
    expect(result.current.rooms).toHaveLength(1);

    // Advance time
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Should be updated now
    expect(result.current.rooms).toHaveLength(2);
    expect(result.current.rooms[1].id).toBe('r2');
  });

  it('should handle null floorplan gracefully', () => {
    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
        return selector({ currentFloorplan: null });
    });

    const { result } = renderHook(() => useSceneSync());

    expect(result.current.rooms).toEqual([]);
    expect(result.current.floorplan).toBeNull();
  });

  it('should increment sceneVersion when regenerateScene is called', () => {
    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
        return selector({ currentFloorplan: { rooms: [] } });
    });

    const { result } = renderHook(() => useSceneSync());

    expect(result.current.sceneVersion).toBe(0);

    act(() => {
      result.current.regenerateScene();
    });

    expect(result.current.sceneVersion).toBe(1);

    act(() => {
      result.current.regenerateScene();
    });

    expect(result.current.sceneVersion).toBe(2);
  });
});
