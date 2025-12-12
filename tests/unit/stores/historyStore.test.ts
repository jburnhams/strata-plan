import { act, renderHook } from '@testing-library/react';
import { useHistoryStore } from '@/stores/historyStore';
import { useFloorplanStore } from '@/stores/floorplanStore';
import { Floorplan } from '@/types';

describe('useHistoryStore', () => {
  const initialFloorplan: Floorplan = {
    id: 'test-id',
    name: 'Test Project',
    units: 'meters',
    rooms: [],
    walls: [],
    doors: [],
    windows: [],
    connections: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    version: '1.0.0',
  };

  beforeEach(() => {
    useHistoryStore.getState().clear();
    useFloorplanStore.getState().clearFloorplan();
    useFloorplanStore.getState().loadFloorplan(initialFloorplan);
  });

  it('should initialize with empty past and future', () => {
    const { result } = renderHook(() => useHistoryStore());
    expect(result.current.past).toEqual([]);
    expect(result.current.future).toEqual([]);
  });

  it('should push state to past', () => {
    const { result } = renderHook(() => useHistoryStore());

    act(() => {
      result.current.pushState(initialFloorplan);
    });

    expect(result.current.past).toHaveLength(1);
    expect(result.current.past[0]).toBe(initialFloorplan);
  });

  it('should undo and restore previous state', () => {
    const { result } = renderHook(() => useHistoryStore());

    // Simulate a change:
    // 1. Initial state is already in store
    // 2. We change the store to state2
    // 3. Before changing, we push initial state to history

    const state2 = { ...initialFloorplan, name: 'State 2' };

    act(() => {
      result.current.pushState(initialFloorplan); // Push 'undo' point
      useFloorplanStore.getState().loadFloorplan(state2);
    });

    expect(result.current.past).toHaveLength(1);
    expect(useFloorplanStore.getState().currentFloorplan?.name).toBe('State 2');

    // Undo
    act(() => {
      result.current.undo();
    });

    // Should restore initial
    expect(useFloorplanStore.getState().currentFloorplan?.name).toBe('Test Project');
    // Future should have state2
    expect(result.current.future).toHaveLength(1);
    expect(result.current.future[0].name).toBe('State 2');
    // Past should be empty
    expect(result.current.past).toHaveLength(0);
  });

  it('should redo and restore future state', () => {
    const { result } = renderHook(() => useHistoryStore());
    const state2 = { ...initialFloorplan, name: 'State 2' };

    act(() => {
      result.current.pushState(initialFloorplan);
      useFloorplanStore.getState().loadFloorplan(state2);
    });

    act(() => {
      result.current.undo();
    });

    // Now back to initial
    expect(useFloorplanStore.getState().currentFloorplan?.name).toBe('Test Project');

    // Redo
    act(() => {
      result.current.redo();
    });

    // Should be state 2
    expect(useFloorplanStore.getState().currentFloorplan?.name).toBe('State 2');
    // Past should have initial
    expect(result.current.past).toHaveLength(1);
    // Future should be empty
    expect(result.current.future).toHaveLength(0);
  });

  it('should limit history size', () => {
     const { result } = renderHook(() => useHistoryStore());
     useHistoryStore.setState({ maxHistory: 2 });

     act(() => {
         result.current.pushState({ ...initialFloorplan, id: '1' });
         result.current.pushState({ ...initialFloorplan, id: '2' });
         result.current.pushState({ ...initialFloorplan, id: '3' });
     });

     expect(result.current.past).toHaveLength(2);
     expect(result.current.past[0].id).toBe('2'); // 1 should be dropped
     expect(result.current.past[1].id).toBe('3');
  });
});
