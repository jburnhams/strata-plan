/**
 * Zustand store for floorplan state management
 */

import { create } from 'zustand';
import type { Floorplan, Room, Wall, Door, Window, MeasurementUnit, EditorMode, RoomConnection } from '../types';
import { FloorMaterial, WallMaterial, CeilingMaterial } from '../types/materials';
import { generateUUID } from '../services/geometry';
import { calculateArea, calculateVolume, getRoomBounds } from '../services/geometry/room';
import { calculateAllConnections } from '../services/adjacency/graph';
import { createManualConnection } from '../services/adjacency/manualConnections';
import { DEFAULT_ROOM_GAP } from '../constants/defaults';

/**
 * Floorplan store state
 */
export interface FloorplanState {
  currentFloorplan: Floorplan | null;
  selectedRoomId: string | null;
  selectedRoomIds: string[];
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

  // Material operations
  setRoomFloorMaterial: (roomId: string, material: FloorMaterial) => void;
  setRoomWallMaterial: (roomId: string, material: WallMaterial) => void;
  setRoomCeilingMaterial: (roomId: string, material: CeilingMaterial) => void;
  setRoomCustomColor: (roomId: string, surface: 'floor' | 'wall' | 'ceiling', color: string) => void;

  // Wall operations
  updateWall: (id: string, updates: Partial<Wall>) => void;
  deleteWall: (id: string) => void;

  // Door operations
  updateDoor: (id: string, updates: Partial<Door>) => void;
  deleteDoor: (id: string) => void;

  // Window operations
  updateWindow: (id: string, updates: Partial<Window>) => void;
  deleteWindow: (id: string) => void;

  // Connection operations
  recalculateConnections: () => void;
  getAdjacentRooms: (roomId: string) => Room[];
  getConnection: (room1Id: string, room2Id: string) => RoomConnection | null;
  addManualConnection: (room1Id: string, room2Id: string) => void;
  removeConnection: (connectionId: string) => void;

  // Selection
  selectRoom: (id: string | null) => void;
  setRoomSelection: (ids: string[]) => void;
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
  getSelectedRooms: () => Room[];
  getRoomById: (id: string) => Room | undefined;
  getWallById: (id: string) => Wall | undefined;
  getDoorById: (id: string) => Door | undefined;
  getWindowById: (id: string) => Window | undefined;
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
  selectedRoomIds: [],
  selectedWallId: null,
  selectedDoorId: null,
  selectedWindowId: null,
  editorMode: 'table',
  isDirty: false,
};

// Material defaults by room type
const ROOM_TYPE_MATERIALS: Record<string, { floor: FloorMaterial; wall: WallMaterial; ceiling?: CeilingMaterial }> = {
  bedroom: { floor: 'hardwood', wall: 'drywall-painted' },
  kitchen: { floor: 'tile-ceramic', wall: 'drywall-painted' },
  bathroom: { floor: 'tile-porcelain', wall: 'tile-ceramic' },
  living: { floor: 'hardwood', wall: 'drywall-painted' },
  garage: { floor: 'concrete', wall: 'drywall-white' },
  dining: { floor: 'hardwood', wall: 'drywall-painted' },
  office: { floor: 'carpet', wall: 'drywall-painted' },
  hallway: { floor: 'hardwood', wall: 'drywall-painted' },
  closet: { floor: 'carpet', wall: 'drywall-painted' },
  other: { floor: 'laminate', wall: 'drywall-painted' },
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
      selectedRoomIds: [],
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

    // Apply defaults based on room type if not provided
    const defaults = ROOM_TYPE_MATERIALS[roomData.type] || ROOM_TYPE_MATERIALS['other'];
    const room: Room = {
      ...roomData,
      id: generateUUID(),
      floorMaterial: roomData.floorMaterial || defaults.floor,
      wallMaterial: roomData.wallMaterial || defaults.wall,
      ceilingMaterial: roomData.ceilingMaterial || defaults.ceiling,
    };

    // Auto-calculate position if not provided
    if (room.position.x === 0 && room.position.z === 0 && state.currentFloorplan.rooms.length > 0) {
      // Left-to-right layout with gaps
      // Use getRoomBounds to account for rotation
      const lastRoom = state.currentFloorplan.rooms[state.currentFloorplan.rooms.length - 1];
      const lastRoomBounds = getRoomBounds(lastRoom);
      room.position = {
        x: lastRoomBounds.maxX + DEFAULT_ROOM_GAP,
        z: 0,
      };
    }

    const newRooms = [...state.currentFloorplan.rooms, room];
    const newConnections = calculateAllConnections(newRooms, state.currentFloorplan.connections);

    const updatedFloorplan = {
      ...state.currentFloorplan,
      rooms: newRooms,
      connections: newConnections,
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

    // Recalculate connections (removes invalid ones)
    const updatedConnections = calculateAllConnections(updatedRooms, state.currentFloorplan.connections);

    const updatedFloorplan = {
      ...state.currentFloorplan,
      rooms: updatedRooms,
      doors: updatedDoors,
      windows: updatedWindows,
      connections: updatedConnections,
      updatedAt: new Date(),
    };

    // Update selection if deleted room was selected
    const newSelectedRoomId = state.selectedRoomId === id ? null : state.selectedRoomId;
    const newSelectedRoomIds = state.selectedRoomIds.filter(roomId => roomId !== id);

    set({
      currentFloorplan: updatedFloorplan,
      selectedRoomId: newSelectedRoomId,
      selectedRoomIds: newSelectedRoomIds,
      isDirty: true,
    });
  },

  // Material operations
  setRoomFloorMaterial: (roomId: string, material: FloorMaterial) => {
    get().updateRoom(roomId, { floorMaterial: material });
  },

  setRoomWallMaterial: (roomId: string, material: WallMaterial) => {
    get().updateRoom(roomId, { wallMaterial: material });
  },

  setRoomCeilingMaterial: (roomId: string, material: CeilingMaterial) => {
    get().updateRoom(roomId, { ceilingMaterial: material });
  },

  setRoomCustomColor: (roomId: string, surface: 'floor' | 'wall' | 'ceiling', color: string) => {
    const updates: Partial<Room> = {};
    if (surface === 'floor') updates.customFloorColor = color;
    if (surface === 'wall') updates.customWallColor = color;
    if (surface === 'ceiling') updates.customCeilingColor = color;
    get().updateRoom(roomId, updates);
  },

  // Wall operations
  updateWall: (id: string, updates: Partial<Wall>) => {
    const state = get();
    if (!state.currentFloorplan) return;

    const wallIndex = state.currentFloorplan.walls.findIndex((w) => w.id === id);
    if (wallIndex === -1) return;

    const updatedWalls = [...state.currentFloorplan.walls];
    updatedWalls[wallIndex] = {
      ...updatedWalls[wallIndex],
      ...updates,
    };

    const updatedFloorplan = {
      ...state.currentFloorplan,
      walls: updatedWalls,
      updatedAt: new Date(),
    };

    set({
      currentFloorplan: updatedFloorplan,
      isDirty: true,
    });
  },

  deleteWall: (id: string) => {
    const state = get();
    if (!state.currentFloorplan) return;

    const updatedWalls = state.currentFloorplan.walls.filter((w) => w.id !== id);

    const updatedFloorplan = {
      ...state.currentFloorplan,
      walls: updatedWalls,
      updatedAt: new Date(),
    };

    set({
      currentFloorplan: updatedFloorplan,
      selectedWallId: state.selectedWallId === id ? null : state.selectedWallId,
      isDirty: true,
    });
  },

  // Door operations
  updateDoor: (id: string, updates: Partial<Door>) => {
    const state = get();
    if (!state.currentFloorplan) return;

    const doorIndex = state.currentFloorplan.doors.findIndex((d) => d.id === id);
    if (doorIndex === -1) return;

    const updatedDoors = [...state.currentFloorplan.doors];
    updatedDoors[doorIndex] = {
      ...updatedDoors[doorIndex],
      ...updates,
    };

    const updatedFloorplan = {
      ...state.currentFloorplan,
      doors: updatedDoors,
      updatedAt: new Date(),
    };

    set({
      currentFloorplan: updatedFloorplan,
      isDirty: true,
    });
  },

  deleteDoor: (id: string) => {
    const state = get();
    if (!state.currentFloorplan) return;

    const updatedDoors = state.currentFloorplan.doors.filter((d) => d.id !== id);

    const updatedFloorplan = {
      ...state.currentFloorplan,
      doors: updatedDoors,
      updatedAt: new Date(),
    };

    set({
      currentFloorplan: updatedFloorplan,
      selectedDoorId: state.selectedDoorId === id ? null : state.selectedDoorId,
      isDirty: true,
    });
  },

  // Window operations
  updateWindow: (id: string, updates: Partial<Window>) => {
    const state = get();
    if (!state.currentFloorplan) return;

    const windowIndex = state.currentFloorplan.windows.findIndex((w) => w.id === id);
    if (windowIndex === -1) return;

    const updatedWindows = [...state.currentFloorplan.windows];
    updatedWindows[windowIndex] = {
      ...updatedWindows[windowIndex],
      ...updates,
    };

    const updatedFloorplan = {
      ...state.currentFloorplan,
      windows: updatedWindows,
      updatedAt: new Date(),
    };

    set({
      currentFloorplan: updatedFloorplan,
      isDirty: true,
    });
  },

  deleteWindow: (id: string) => {
    const state = get();
    if (!state.currentFloorplan) return;

    const updatedWindows = state.currentFloorplan.windows.filter((w) => w.id !== id);

    const updatedFloorplan = {
      ...state.currentFloorplan,
      windows: updatedWindows,
      updatedAt: new Date(),
    };

    set({
      currentFloorplan: updatedFloorplan,
      selectedWindowId: state.selectedWindowId === id ? null : state.selectedWindowId,
      isDirty: true,
    });
  },

  // Connection operations
  recalculateConnections: () => {
    const state = get();
    if (!state.currentFloorplan) return;

    const connections = calculateAllConnections(
      state.currentFloorplan.rooms,
      state.currentFloorplan.connections || []
    );

    // Check if connections actually changed to avoid unnecessary updates and dirty flag
    if (JSON.stringify(connections) === JSON.stringify(state.currentFloorplan.connections)) {
      return;
    }

    const updatedFloorplan = {
      ...state.currentFloorplan,
      connections,
      updatedAt: new Date(),
    };

    set({
      currentFloorplan: updatedFloorplan,
      isDirty: true,
    });
  },

  getAdjacentRooms: (roomId: string) => {
    const state = get();
    if (!state.currentFloorplan?.connections) return [];

    const connectedRoomIds = state.currentFloorplan.connections
      .filter((c) => c.room1Id === roomId || c.room2Id === roomId)
      .map((c) => (c.room1Id === roomId ? c.room2Id : c.room1Id));

    return state.currentFloorplan.rooms.filter((r) => connectedRoomIds.includes(r.id));
  },

  getConnection: (room1Id: string, room2Id: string) => {
    const state = get();
    if (!state.currentFloorplan?.connections) return null;

    return (
      state.currentFloorplan.connections.find(
        (c) =>
          (c.room1Id === room1Id && c.room2Id === room2Id) ||
          (c.room1Id === room2Id && c.room2Id === room1Id)
      ) || null
    );
  },

  addManualConnection: (room1Id: string, room2Id: string) => {
    const state = get();
    if (!state.currentFloorplan) return;

    // Check if connection already exists
    const existing = state.getConnection(room1Id, room2Id);
    if (existing) return;

    const newConnection = createManualConnection(room1Id, room2Id);

    const updatedConnections = [...(state.currentFloorplan.connections || []), newConnection];

    const updatedFloorplan = {
      ...state.currentFloorplan,
      connections: updatedConnections,
      updatedAt: new Date(),
    };

    set({
      currentFloorplan: updatedFloorplan,
      isDirty: true,
    });
  },

  removeConnection: (connectionId: string) => {
    const state = get();
    if (!state.currentFloorplan) return;

    const updatedConnections = state.currentFloorplan.connections.filter(c => c.id !== connectionId);

    const updatedFloorplan = {
      ...state.currentFloorplan,
      connections: updatedConnections,
      updatedAt: new Date(),
    };

    set({
      currentFloorplan: updatedFloorplan,
      isDirty: true,
    });
  },

  // Selection
  selectRoom: (id: string | null) => {
    set({
      selectedRoomId: id,
      selectedRoomIds: id ? [id] : [],
      selectedWallId: null,
      selectedDoorId: null,
      selectedWindowId: null,
    });
  },

  setRoomSelection: (ids: string[]) => {
    set({
      selectedRoomId: ids.length > 0 ? ids[ids.length - 1] : null,
      selectedRoomIds: ids,
      selectedWallId: null,
      selectedDoorId: null,
      selectedWindowId: null,
    });
  },

  selectWall: (id: string | null) => {
    set({
      selectedRoomId: null,
      selectedRoomIds: [],
      selectedWallId: id,
      selectedDoorId: null,
      selectedWindowId: null,
    });
  },

  selectDoor: (id: string | null) => {
    set({
      selectedRoomId: null,
      selectedRoomIds: [],
      selectedWallId: null,
      selectedDoorId: id,
      selectedWindowId: null,
    });
  },

  selectWindow: (id: string | null) => {
    set({
      selectedRoomId: null,
      selectedRoomIds: [],
      selectedWallId: null,
      selectedDoorId: null,
      selectedWindowId: id,
    });
  },

  clearSelection: () => {
    set({
      selectedRoomId: null,
      selectedRoomIds: [],
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

  getSelectedRooms: () => {
    const state = get();
    if (!state.currentFloorplan || state.selectedRoomIds.length === 0) return [];

    return state.currentFloorplan.rooms.filter((r) => state.selectedRoomIds.includes(r.id));
  },

  getRoomById: (id: string) => {
    const state = get();
    if (!state.currentFloorplan) return undefined;

    return state.currentFloorplan.rooms.find((r) => r.id === id);
  },

  getWallById: (id: string) => {
    const state = get();
    if (!state.currentFloorplan) return undefined;

    return state.currentFloorplan.walls.find((w) => w.id === id);
  },

  getDoorById: (id: string) => {
    const state = get();
    if (!state.currentFloorplan) return undefined;

    return state.currentFloorplan.doors.find((d) => d.id === id);
  },

  getWindowById: (id: string) => {
    const state = get();
    if (!state.currentFloorplan) return undefined;

    return state.currentFloorplan.windows.find((w) => w.id === id);
  },
}));
