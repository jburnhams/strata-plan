/**
 * Zustand store for UI state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Position2D } from '../types';
import {
  DEFAULT_GRID_SIZE,
  DEFAULT_ZOOM_LEVEL,
  ZOOM_INCREMENT,
} from '../constants/defaults';
import { MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL } from '../constants/limits';
import { clamp } from '../services/geometry/bounds';

/**
 * Theme options
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * Save status indicator
 */
export type SaveStatus = 'saved' | 'saving' | 'error' | 'unsaved';

/**
 * UI store state
 */
export interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  propertiesPanelOpen: boolean;
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
  showRoomLabels: boolean;
  showMeasurements: boolean;
  zoomLevel: number;
  panOffset: Position2D;
  saveStatus: SaveStatus;
  lastSaveTime: Date | null;
}

/**
 * UI store actions
 */
export interface UIActions {
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  togglePropertiesPanel: () => void;
  toggleGrid: () => void;
  setGridSize: (size: number) => void;
  toggleSnapToGrid: () => void;
  toggleRoomLabels: () => void;
  toggleMeasurements: () => void;
  setZoom: (level: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setPan: (offset: Position2D) => void;
  resetPan: () => void;
  setSaveStatus: (status: SaveStatus) => void;
}

/**
 * Combined store type
 */
export type UIStore = UIState & UIActions;

/**
 * Initial state
 */
const initialState: UIState = {
  theme: 'system',
  sidebarOpen: true,
  propertiesPanelOpen: true,
  showGrid: true,
  gridSize: DEFAULT_GRID_SIZE,
  snapToGrid: true,
  showRoomLabels: true,
  showMeasurements: true,
  zoomLevel: DEFAULT_ZOOM_LEVEL,
  panOffset: { x: 0, z: 0 },
  saveStatus: 'saved',
  lastSaveTime: null,
};

/**
 * UI store with persistence for user preferences
 */
export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setTheme: (theme: Theme) => {
        set({ theme });
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      togglePropertiesPanel: () => {
        set((state) => ({ propertiesPanelOpen: !state.propertiesPanelOpen }));
      },

      toggleGrid: () => {
        set((state) => ({ showGrid: !state.showGrid }));
      },

      setGridSize: (size: number) => {
        set({ gridSize: size });
      },

      toggleSnapToGrid: () => {
        set((state) => ({ snapToGrid: !state.snapToGrid }));
      },

      toggleRoomLabels: () => {
        set((state) => ({ showRoomLabels: !state.showRoomLabels }));
      },

      toggleMeasurements: () => {
        set((state) => ({ showMeasurements: !state.showMeasurements }));
      },

      setZoom: (level: number) => {
        const clampedZoom = clamp(level, MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL);
        set({ zoomLevel: clampedZoom });
      },

      zoomIn: () => {
        const currentZoom = get().zoomLevel;
        const newZoom = currentZoom * ZOOM_INCREMENT;
        const clampedZoom = clamp(newZoom, MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL);
        set({ zoomLevel: clampedZoom });
      },

      zoomOut: () => {
        const currentZoom = get().zoomLevel;
        const newZoom = currentZoom / ZOOM_INCREMENT;
        const clampedZoom = clamp(newZoom, MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL);
        set({ zoomLevel: clampedZoom });
      },

      resetZoom: () => {
        set({ zoomLevel: DEFAULT_ZOOM_LEVEL });
      },

      setPan: (offset: Position2D) => {
        set({ panOffset: offset });
      },

      resetPan: () => {
        set({ panOffset: { x: 0, z: 0 } });
      },

      setSaveStatus: (status: SaveStatus) => {
        set({
          saveStatus: status,
          lastSaveTime: status === 'saved' ? new Date() : get().lastSaveTime,
        });
      },
    }),
    {
      name: 'strataPlan-ui-preferences',
      partialize: (state) => ({
        theme: state.theme,
        gridSize: state.gridSize,
        snapToGrid: state.snapToGrid,
        showGrid: state.showGrid,
        showRoomLabels: state.showRoomLabels,
        showMeasurements: state.showMeasurements,
      }),
    }
  )
);
