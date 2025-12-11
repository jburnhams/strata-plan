/**
 * Zustand store for UI state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Position2D, EditorMode } from '../types';
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
  showConnections: boolean;
  zoomLevel: number;
  panOffset: Position2D;
  mode: EditorMode;
  saveStatus: SaveStatus;
  lastSaveTime: Date | null;
  hoveredRoomId: string | null;

  // Path Visualization
  showPath: boolean;
  pathStartRoomId: string | null;
  pathEndRoomId: string | null;
}

/**
 * UI store actions
 */
export interface UIActions {
  setHoveredRoom: (id: string | null) => void;
  setPathVisualization: (show: boolean, startId?: string, endId?: string) => void;
  setTheme: (theme: Theme) => void;
  setMode: (mode: EditorMode) => void;
  toggleSidebar: () => void;
  togglePropertiesPanel: () => void;
  toggleGrid: () => void;
  setGridSize: (size: number) => void;
  toggleSnapToGrid: () => void;
  toggleRoomLabels: () => void;
  toggleMeasurements: () => void;
  toggleConnections: () => void;
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
  showConnections: false,
  zoomLevel: DEFAULT_ZOOM_LEVEL,
  panOffset: { x: 0, z: 0 },
  mode: 'table',
  saveStatus: 'saved',
  lastSaveTime: null,
  hoveredRoomId: null,

  showPath: false,
  pathStartRoomId: null,
  pathEndRoomId: null,
};

/**
 * UI store with persistence for user preferences
 */
export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setHoveredRoom: (id: string | null) => {
        set({ hoveredRoomId: id });
      },

      setPathVisualization: (show: boolean, startId?: string, endId?: string) => {
        set({
          showPath: show,
          pathStartRoomId: startId ?? null,
          pathEndRoomId: endId ?? null
        });
      },

      setTheme: (theme: Theme) => {
        set({ theme });
      },

      setMode: (mode: EditorMode) => {
        set({ mode });
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

      toggleConnections: () => {
        set((state) => ({ showConnections: !state.showConnections }));
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
        mode: state.mode,
        gridSize: state.gridSize,
        snapToGrid: state.snapToGrid,
        showGrid: state.showGrid,
        showRoomLabels: state.showRoomLabels,
        showMeasurements: state.showMeasurements,
        showConnections: state.showConnections,
      }),
    }
  )
);
