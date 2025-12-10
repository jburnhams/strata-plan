import { renderHook, act } from '@testing-library/react';
import { useSceneSync } from '../../../src/hooks/useSceneSync';
import { useFloorplanStore } from '../../../src/stores/floorplanStore';

// Mock useFloorplanStore
jest.mock('../../../src/stores/floorplanStore');

// We use the REAL useDebounce by NOT mocking it, but we need fake timers.
// If we mock it, we assume it works.
// To integration test it properly within useSceneSync, we should rely on real implementation + timers.

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

    // Initial render - should have initial value immediately (as per useDebounce implementation)
    expect(result.current.rooms).toHaveLength(1);
    expect(result.current.rooms[0].id).toBe('r1');

    // Update store state
    currentFloorplan = { id: 'fp1', rooms: [{ id: 'r1', name: 'Room 1' }, { id: 'r2', name: 'Room 2' }] };

    // Rerender hook to pick up new state (in real app, store subscription triggers this)
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
});
