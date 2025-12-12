import { create } from 'zustand';
import { Floorplan } from '../types';
import { useFloorplanStore } from './floorplanStore';

interface HistoryState {
  past: Floorplan[];
  future: Floorplan[];
  maxHistory: number;
}

interface HistoryActions {
  pushState: (floorplan: Floorplan) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

export const useHistoryStore = create<HistoryState & HistoryActions>((set, get) => ({
  past: [],
  future: [],
  maxHistory: 20,

  pushState: (floorplan) => {
    const { past, maxHistory } = get();

    // Check if the new state is actually different from the last saved state to avoid duplicates
    // This is simple reference equality check which might be enough if the store uses immutable updates
    // But for safety, we might want to check ID or basic properties.
    // However, if we only push on drag end (when we know it changed), we are good.

    const newPast = [...past, floorplan];
    if (newPast.length > maxHistory) {
      newPast.shift();
    }
    set({ past: newPast, future: [] });
  },

  undo: () => {
    const { past, future } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);

    const currentFloorplan = useFloorplanStore.getState().currentFloorplan;
    if (currentFloorplan) {
      set({
        past: newPast,
        future: [currentFloorplan, ...future]
      });
      useFloorplanStore.getState().loadFloorplan(previous);
    }
  },

  redo: () => {
    const { past, future } = get();
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    const currentFloorplan = useFloorplanStore.getState().currentFloorplan;
    if (currentFloorplan) {
        set({
            past: [...past, currentFloorplan],
            future: newFuture
        });
        useFloorplanStore.getState().loadFloorplan(next);
    }
  },

  clear: () => {
    set({ past: [], future: [] });
  }
}));
