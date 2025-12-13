import { useHistoryStore } from '../../../src/stores/historyStore';
import { useFloorplanStore } from '../../../src/stores/floorplanStore';
import { Floorplan } from '../../../src/types';

describe('useHistoryStore Extra Coverage', () => {
  beforeEach(() => {
    useHistoryStore.getState().clear();
    useFloorplanStore.setState({ currentFloorplan: null });
  });

  const mockFloorplan: Floorplan = {
    id: 'fp-1',
    name: 'Test',
    units: 'meters',
    rooms: [],
    connections: [],
    walls: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  it('respects maxHistory limit', () => {
    // Set maxHistory to small number for testing
    useHistoryStore.setState({ maxHistory: 3 });

    // Push 4 states
    for (let i = 0; i < 4; i++) {
        useHistoryStore.getState().pushState({ ...mockFloorplan, id: `fp-${i}` });
    }

    const { past } = useHistoryStore.getState();
    expect(past.length).toBe(3);
    // Should contain fp-1, fp-2, fp-3 (fp-0 shifted out)
    expect(past[0].id).toBe('fp-1');
    expect(past[2].id).toBe('fp-3');
  });

  it('undo does nothing if past is empty', () => {
    useHistoryStore.getState().undo();
    // No error should be thrown
    expect(useHistoryStore.getState().past.length).toBe(0);
  });

  it('redo does nothing if future is empty', () => {
    useHistoryStore.getState().redo();
    expect(useHistoryStore.getState().future.length).toBe(0);
  });

  it('undo loads previous state and pushes current to future', () => {
     // Setup:
     // Current state: fp-curr
     // Past: [fp-prev]
     const fpPrev = { ...mockFloorplan, id: 'prev' };
     const fpCurr = { ...mockFloorplan, id: 'curr' };

     useFloorplanStore.setState({ currentFloorplan: fpCurr });
     useHistoryStore.setState({ past: [fpPrev] });

     // Action
     useHistoryStore.getState().undo();

     // Expectation
     // Current floorplan should be fpPrev
     expect(useFloorplanStore.getState().currentFloorplan?.id).toBe('prev');
     // Past should be empty
     expect(useHistoryStore.getState().past.length).toBe(0);
     // Future should have fpCurr
     expect(useHistoryStore.getState().future[0].id).toBe('curr');
  });

  it('redo loads next state and pushes current to past', () => {
      // Setup:
      // Current: fp-curr
      // Future: [fp-next]
      const fpCurr = { ...mockFloorplan, id: 'curr' };
      const fpNext = { ...mockFloorplan, id: 'next' };

      useFloorplanStore.setState({ currentFloorplan: fpCurr });
      useHistoryStore.setState({ future: [fpNext] });

      // Action
      useHistoryStore.getState().redo();

      // Expectation
      // Current floorplan should be fpNext
      expect(useFloorplanStore.getState().currentFloorplan?.id).toBe('next');
      // Past should have fpCurr
      expect(useHistoryStore.getState().past[0].id).toBe('curr');
      // Future should be empty
      expect(useHistoryStore.getState().future.length).toBe(0);
  });
});
