/**
 * Zustand store for floorplan state management
 */

import { create } from 'zustand';
import type { Floorplan, Room, MeasurementUnit, EditorMode } from '../types';
import { generateUUID } from '../services/geometry';
import { calculateArea, calculateVolume, getRoomBounds } from '../services/geometry/room';
import { DEFAULT_ROOM_GAP } from '../constants/defaults';

/**
 * Floorplan store state
 */
export interface FloorplanState {
  currentFloorplan: Floorplan | null;
  selectedRoomId: string | null;
  selectedWallId: string | null;
  selectedDoorId: string | null;
  selectedWindowId: string | null;
  editorMode: EditorMode;
  isDirty: boolean;
}

/**
 * Floorplan store actions
 */
export interface FloorplanActions {
  // Floorplan CRUD
  createFloorplan: (name: string, units: MeasurementUnit) => Floorplan;
  loadFloorplan: (floorplan: Floorplan) => void;
  clearFloorplan: () => void;

  // Room operations
  addRoom: (room: Omit<Room, 'id'>) => Room;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  deleteRoom: (id: string) => void;

  // Selection
  selectRoom: (id: string | null) => void;
  selectWall: (id: string | null) => void;
  selectDoor: (id: string | null) => void;
  selectWindow: (id: string | null) => void;
  clearSelection: () => void;

  // Editor mode
  setEditorMode: (mode: EditorMode) => void;

  // Dirty state
  markDirty: () => void;
  markClean: () => void;

  // Computed getters
  getTotalArea: () => number;
  getTotalVolume: () => number;
  getRoomCount: () => number;
  getSelectedRoom: () => Room | null;
  getRoomById: (id: string) => Room | undefined;
}

/**
 * Combined store type
 */
export type FloorplanStore = FloorplanState & FloorplanActions;

/**
 * Initial state
 */
const initialState: FloorplanState = {
  currentFloorplan: null,
  selectedRoomId: null,
  selectedWallId: null,
  selectedDoorId: null,
  selectedWindowId: null,
  editorMode: 'table',
  isDirty: false,
};

/**
 * Floorplan store
 */
export const useFloorplanStore = create<FloorplanStore>((set, get) => ({
  ...initialState,

  // Floorplan CRUD
  createFloorplan: (name: string, units: MeasurementUnit) => {
    const floorplan: Floorplan = {
      id: generateUUID(),
      name,
      units,
      rooms: [],
      walls: [],
      doors: [],
      windows: [],
      connections: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0',
    };

    set({ currentFloorplan: floorplan, isDirty: false });
    return floorplan;
  },

  loadFloorplan: (floorplan: Floorplan) => {
    set({
      currentFloorplan: floorplan,
      selectedRoomId: null,
      selectedWallId: null,
      selectedDoorId: null,
      selectedWindowId: null,
      isDirty: false,
    });
  },

  clearFloorplan: () => {
    set(initialState);
  },

  // Room operations
  addRoom: (roomData: Omit<Room, 'id'>) => {
    const state = get();
    if (!state.currentFloorplan) {
      throw new Error('No floorplan loaded');
    }

    const room: Room = {
      ...roomData,
      id: generateUUID(),
    };

    // Auto-calculate position if not provided
    if (room.position.x === 0 && room.position.z === 0 && state.currentFloorplan.rooms.length > 0) {
      // Left-to-right layout with gaps
      const lastRoom = state.currentFloorplan.rooms[state.currentFloorplan.rooms.length - 1];
      const lastRoomEndX = getRoomBounds(lastRoom).maxX;
      room.position = {
        x: lastRoomEndX + DEFAULT_ROOM_GAP,
        z: 0,
      };
    }

    const updatedFloorplan = {
      ...state.currentFloorplan,
      rooms: [...state.currentFloorplan.rooms, room],
      updatedAt: new Date(),
    };

    set({
      currentFloorplan: updatedFloorplan,
      isDirty: true,
    });

    return room;
  },

  updateRoom: (id: string, updates: Partial<Room>) => {
    const state = get();
    if (!state.currentFloorplan) return;

    const roomIndex = state.currentFloorplan.rooms.findIndex((r) => r.id === id);
    if (roomIndex === -1) return;

    const updatedRooms = [...state.currentFloorplan.rooms];
    updatedRooms[roomIndex] = {
      ...updatedRooms[roomIndex],
      ...updates,
    };

    const updatedFloorplan = {
      ...state.currentFloorplan,
      rooms: updatedRooms,
      updatedAt: new Date(),
    };

    set({
      currentFloorplan: updatedFloorplan,
      isDirty: true,
    });
  },

  deleteRoom: (id: string) => {
    const state = get();
    if (!state.currentFloorplan) return;

    // Remove room
    const updatedRooms = state.currentFloorplan.rooms.filter((r) => r.id !== id);

    // Remove associated doors
    const updatedDoors = state.currentFloorplan.doors.filter((d) => d.roomId !== id);

    // Remove associated windows
    const updatedWindows = state.currentFloorplan.windows.filter((w) => w.roomId !== id);

    // Remove connections involving this room
    const updatedConnections = state.currentFloorplan.connections.filter(
      (c) => c.room1Id !== id && c.room2Id !== id
    );

    const updatedFloorplan = {
      ...state.currentFloorplan,
      rooms: updatedRooms,
      doors: updatedDoors,
      windows: updatedWindows,
      connections: updatedConnections,
      updatedAt: new Date(),
    };

    set({
      currentFloorplan: updatedFloorplan,
      selectedRoomId: state.selectedRoomId === id ? null : state.selectedRoomId,
      isDirty: true,
    });
  },

  // Selection
  selectRoom: (id: string | null) => {
    set({
      selectedRoomId: id,
      selectedWallId: null,
      selectedDoorId: null,
      selectedWindowId: null,
    });
  },

  selectWall: (id: string | null) => {
    set({
      selectedRoomId: null,
      selectedWallId: id,
      selectedDoorId: null,
      selectedWindowId: null,
    });
  },

  selectDoor: (id: string | null) => {
    set({
      selectedRoomId: null,
      selectedWallId: null,
      selectedDoorId: id,
      selectedWindowId: null,
    });
  },

  selectWindow: (id: string | null) => {
    set({
      selectedRoomId: null,
      selectedWallId: null,
      selectedDoorId: null,
      selectedWindowId: id,
    });
  },

  clearSelection: () => {
    set({
      selectedRoomId: null,
      selectedWallId: null,
      selectedDoorId: null,
      selectedWindowId: null,
    });
  },

  // Editor mode
  setEditorMode: (mode: EditorMode) => {
    set({ editorMode: mode });
  },

  // Dirty state
  markDirty: () => {
    set({ isDirty: true });
  },

  markClean: () => {
    set({ isDirty: false });
  },

  // Computed getters
  getTotalArea: () => {
    const state = get();
    if (!state.currentFloorplan) return 0;

    return state.currentFloorplan.rooms.reduce((total, room) => {
      return total + calculateArea(room.length, room.width);
    }, 0);
  },

  getTotalVolume: () => {
    const state = get();
    if (!state.currentFloorplan) return 0;

    return state.currentFloorplan.rooms.reduce((total, room) => {
      return total + room.length * room.width * room.height;
    }, 0);
  },

  getRoomCount: () => {
    const state = get();
    return state.currentFloorplan?.rooms.length ?? 0;
  },

  getSelectedRoom: () => {
    const state = get();
    if (!state.currentFloorplan || !state.selectedRoomId) return null;

    return state.currentFloorplan.rooms.find((r) => r.id === state.selectedRoomId) ?? null;
  },

  getRoomById: (id: string) => {
    const state = get();
    if (!state.currentFloorplan) return undefined;

    return state.currentFloorplan.rooms.find((r) => r.id === id);
  },
}));
