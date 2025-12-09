/**
 * Unit tests for floorplan store
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { useFloorplanStore } from '../../../src/stores/floorplanStore';
import type { Room } from '../../../src/types';

describe('Floorplan Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useFloorplanStore.getState().clearFloorplan();
  });

  describe('createFloorplan', () => {
    it('should create floorplan with correct defaults', () => {
      const floorplan = useFloorplanStore.getState().createFloorplan('My House', 'meters');

      expect(floorplan.id).toBeDefined();
      expect(floorplan.name).toBe('My House');
      expect(floorplan.units).toBe('meters');
      expect(floorplan.rooms).toEqual([]);
      expect(floorplan.walls).toEqual([]);
      expect(floorplan.doors).toEqual([]);
      expect(floorplan.windows).toEqual([]);
      expect(floorplan.connections).toEqual([]);
      expect(floorplan.version).toBe('1.0.0');
      expect(floorplan.createdAt).toBeInstanceOf(Date);
      expect(floorplan.updatedAt).toBeInstanceOf(Date);
    });

    it('should set currentFloorplan in state', () => {
      useFloorplanStore.getState().createFloorplan('Test', 'meters');
      const state = useFloorplanStore.getState();

      expect(state.currentFloorplan).not.toBeNull();
      expect(state.currentFloorplan?.name).toBe('Test');
      expect(state.isDirty).toBe(false);
    });
  });

  describe('loadFloorplan', () => {
    it('should load floorplan and reset selection', () => {
      const floorplan = useFloorplanStore.getState().createFloorplan('Test', 'meters');

      useFloorplanStore.getState().loadFloorplan(floorplan);
      const state = useFloorplanStore.getState();

      expect(state.currentFloorplan).toEqual(floorplan);
      expect(state.selectedRoomId).toBeNull();
      expect(state.isDirty).toBe(false);
    });
  });

  describe('clearFloorplan', () => {
    it('should reset to initial state', () => {
      useFloorplanStore.getState().createFloorplan('Test', 'meters');
      useFloorplanStore.getState().clearFloorplan();

      const state = useFloorplanStore.getState();
      expect(state.currentFloorplan).toBeNull();
      expect(state.selectedRoomId).toBeNull();
      expect(state.isDirty).toBe(false);
    });
  });

  describe('addRoom', () => {
    beforeEach(() => {
      useFloorplanStore.getState().createFloorplan('Test', 'meters');
    });

    it('should add room with generated ID', () => {
      const roomData: Omit<Room, 'id'> = {
        name: 'Bedroom',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      };

      const room = useFloorplanStore.getState().addRoom(roomData);

      expect(room.id).toBeDefined();
      expect(room.name).toBe('Bedroom');

      const state = useFloorplanStore.getState();
      expect(state.currentFloorplan?.rooms).toHaveLength(1);
      expect(state.isDirty).toBe(true);
    });

    it('should generate unique IDs for each room', () => {
      const roomData: Omit<Room, 'id'> = {
        name: 'Room',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      };

      const room1 = useFloorplanStore.getState().addRoom(roomData);
      const room2 = useFloorplanStore.getState().addRoom(roomData);

      expect(room1.id).not.toBe(room2.id);
    });

    it('should auto-position rooms when position is at origin and rooms exist', () => {
      const room1Data: Omit<Room, 'id'> = {
        name: 'Room 1',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      };

      const room2Data: Omit<Room, 'id'> = {
        name: 'Room 2',
        length: 3,
        width: 3,
        height: 2.7,
        type: 'kitchen',
        position: { x: 0, z: 0 },
        rotation: 0,
      };

      useFloorplanStore.getState().addRoom(room1Data);
      const room2 = useFloorplanStore.getState().addRoom(room2Data);

      // Room 2 should be positioned to the right of Room 1 with gap
      expect(room2.position.x).toBe(5.0); // 4 (room1 length) + 1 (gap)
      expect(room2.position.z).toBe(0);
    });

    it('should throw error if no floorplan is loaded', () => {
      useFloorplanStore.getState().clearFloorplan();
      const roomData: Omit<Room, 'id'> = {
        name: 'Room',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      };

      expect(() => useFloorplanStore.getState().addRoom(roomData)).toThrow('No floorplan loaded');
    });
  });

  describe('updateRoom', () => {
    beforeEach(() => {
      useFloorplanStore.getState().createFloorplan('Test', 'meters');
    });

    it('should return early if no floorplan is loaded', () => {
      useFloorplanStore.getState().clearFloorplan();
      // Should not throw
      useFloorplanStore.getState().updateRoom('some-id', { name: 'New Name' });
    });

    it('should merge partial updates correctly', () => {
      const roomData: Omit<Room, 'id'> = {
        name: 'Bedroom',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      };

      const room = useFloorplanStore.getState().addRoom(roomData);

      useFloorplanStore.getState().updateRoom(room.id, {
        name: 'Master Bedroom',
        length: 5,
      });

      const state = useFloorplanStore.getState();
      const updatedRoom = state.currentFloorplan?.rooms[0];

      expect(updatedRoom?.name).toBe('Master Bedroom');
      expect(updatedRoom?.length).toBe(5);
      expect(updatedRoom?.width).toBe(3); // Unchanged
      expect(state.isDirty).toBe(true);
    });

    it('should be no-op for invalid room ID', () => {
      const initialState = useFloorplanStore.getState();
      useFloorplanStore.getState().updateRoom('invalid-id', { name: 'Test' });

      const finalState = useFloorplanStore.getState();
      expect(finalState.currentFloorplan).toEqual(initialState.currentFloorplan);
    });
  });

  describe('deleteRoom', () => {
    beforeEach(() => {
      useFloorplanStore.getState().createFloorplan('Test', 'meters');
    });

    it('should return early if no floorplan is loaded', () => {
      useFloorplanStore.getState().clearFloorplan();
      // Should not throw
      useFloorplanStore.getState().deleteRoom('some-id');
    });

    it('should remove room from array', () => {
      const roomData: Omit<Room, 'id'> = {
        name: 'Bedroom',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      };

      const room = useFloorplanStore.getState().addRoom(roomData);
      useFloorplanStore.getState().deleteRoom(room.id);

      const state = useFloorplanStore.getState();
      expect(state.currentFloorplan?.rooms).toHaveLength(0);
      expect(state.isDirty).toBe(true);
    });

    it('should remove associated doors, windows, and connections', () => {
      // Setup room
      const roomData: Omit<Room, 'id'> = {
        name: 'Bedroom',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      };
      const room = useFloorplanStore.getState().addRoom(roomData);

      // Manually add door and window for testing (since we don't have helper methods yet)
      const store = useFloorplanStore.getState();
      const newDoor = { id: 'door-1', roomId: room.id } as any;
      const newWindow = { id: 'window-1', roomId: room.id } as any;
      const newConnection = { id: 'conn-1', room1Id: room.id, room2Id: 'other' } as any;

      if (store.currentFloorplan) {
         store.currentFloorplan.doors.push(newDoor);
         store.currentFloorplan.windows.push(newWindow);
         store.currentFloorplan.connections.push(newConnection);
      }

      useFloorplanStore.getState().deleteRoom(room.id);

      const state = useFloorplanStore.getState();
      expect(state.currentFloorplan?.rooms).toHaveLength(0);
      expect(state.currentFloorplan?.doors).toHaveLength(0);
      expect(state.currentFloorplan?.windows).toHaveLength(0);
      expect(state.currentFloorplan?.connections).toHaveLength(0);
    });

    it('should clear selection if deleted room was selected', () => {
      const roomData: Omit<Room, 'id'> = {
        name: 'Bedroom',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      };

      const room = useFloorplanStore.getState().addRoom(roomData);
      useFloorplanStore.getState().selectRoom(room.id);
      useFloorplanStore.getState().deleteRoom(room.id);

      const state = useFloorplanStore.getState();
      expect(state.selectedRoomId).toBeNull();
    });
  });

  describe('Selection', () => {
    it('should select room and clear other selections', () => {
      useFloorplanStore.getState().selectRoom('room-1');

      const state = useFloorplanStore.getState();
      expect(state.selectedRoomId).toBe('room-1');
      expect(state.selectedWallId).toBeNull();
      expect(state.selectedDoorId).toBeNull();
      expect(state.selectedWindowId).toBeNull();
    });

    it('should ensure selections are mutually exclusive', () => {
      useFloorplanStore.getState().selectRoom('room-1');
      useFloorplanStore.getState().selectWall('wall-1');

      const state = useFloorplanStore.getState();
      expect(state.selectedRoomId).toBeNull();
      expect(state.selectedWallId).toBe('wall-1');
    });

    it('should select door', () => {
      useFloorplanStore.getState().selectDoor('door-1');
      const state = useFloorplanStore.getState();
      expect(state.selectedDoorId).toBe('door-1');
      expect(state.selectedRoomId).toBeNull();
    });

    it('should select window', () => {
      useFloorplanStore.getState().selectWindow('window-1');
      const state = useFloorplanStore.getState();
      expect(state.selectedWindowId).toBe('window-1');
      expect(state.selectedRoomId).toBeNull();
    });

    it('should clear all selections', () => {
      useFloorplanStore.getState().selectRoom('room-1');
      useFloorplanStore.getState().clearSelection();

      const state = useFloorplanStore.getState();
      expect(state.selectedRoomId).toBeNull();
      expect(state.selectedWallId).toBeNull();
      expect(state.selectedDoorId).toBeNull();
      expect(state.selectedWindowId).toBeNull();
    });
  });

  describe('Editor Mode', () => {
    it('should set editor mode', () => {
      useFloorplanStore.getState().setEditorMode('graph');
      expect(useFloorplanStore.getState().editorMode).toBe('graph');
    });
  });

  describe('Computed getters', () => {
    beforeEach(() => {
      useFloorplanStore.getState().createFloorplan('Test', 'meters');
    });

    it('should return 0 area if no floorplan', () => {
      useFloorplanStore.getState().clearFloorplan();
      expect(useFloorplanStore.getState().getTotalArea()).toBe(0);
    });

    it('should calculate total area', () => {
      const room1Data: Omit<Room, 'id'> = {
        name: 'Room 1',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      };

      const room2Data: Omit<Room, 'id'> = {
        name: 'Room 2',
        length: 5,
        width: 2,
        height: 2.7,
        type: 'kitchen',
        position: { x: 10, z: 0 },
        rotation: 0,
      };

      useFloorplanStore.getState().addRoom(room1Data);
      useFloorplanStore.getState().addRoom(room2Data);

      const totalArea = useFloorplanStore.getState().getTotalArea();
      expect(totalArea).toBe(22); // (4*3) + (5*2) = 12 + 10 = 22
    });

    it('should return 0 volume if no floorplan', () => {
      useFloorplanStore.getState().clearFloorplan();
      expect(useFloorplanStore.getState().getTotalVolume()).toBe(0);
    });

    it('should calculate total volume', () => {
      const room1Data: Omit<Room, 'id'> = {
        name: 'Room 1',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      };

      useFloorplanStore.getState().addRoom(room1Data);

      const totalVolume = useFloorplanStore.getState().getTotalVolume();
      expect(totalVolume).toBeCloseTo(32.4); // 4*3*2.7
    });

    it('should get room count', () => {
      const roomData: Omit<Room, 'id'> = {
        name: 'Room',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      };

      useFloorplanStore.getState().addRoom(roomData);
      useFloorplanStore.getState().addRoom(roomData);

      expect(useFloorplanStore.getState().getRoomCount()).toBe(2);
    });

    it('should get selected room', () => {
      const roomData: Omit<Room, 'id'> = {
        name: 'Bedroom',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      };

      const room = useFloorplanStore.getState().addRoom(roomData);
      useFloorplanStore.getState().selectRoom(room.id);

      const selectedRoom = useFloorplanStore.getState().getSelectedRoom();
      expect(selectedRoom).not.toBeNull();
      expect(selectedRoom?.id).toBe(room.id);
    });

    it('should get room by ID', () => {
      const roomData: Omit<Room, 'id'> = {
        name: 'Bedroom',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      };

      const room = useFloorplanStore.getState().addRoom(roomData);
      const foundRoom = useFloorplanStore.getState().getRoomById(room.id);

      expect(foundRoom).toBeDefined();
      expect(foundRoom?.id).toBe(room.id);
    });

    it('should return undefined if room ID not found', () => {
      const foundRoom = useFloorplanStore.getState().getRoomById('non-existent');
      expect(foundRoom).toBeUndefined();
    });

    it('should return undefined from getRoomById if no floorplan', () => {
      useFloorplanStore.getState().clearFloorplan();
      const foundRoom = useFloorplanStore.getState().getRoomById('some-id');
      expect(foundRoom).toBeUndefined();
    });
  });

  describe('Dirty flag', () => {
    beforeEach(() => {
      useFloorplanStore.getState().createFloorplan('Test', 'meters');
    });

    it('should mark dirty on mutations', () => {
      const roomData: Omit<Room, 'id'> = {
        name: 'Bedroom',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      };

      useFloorplanStore.getState().addRoom(roomData);
      expect(useFloorplanStore.getState().isDirty).toBe(true);
    });

    it('should clear dirty flag with markClean', () => {
      useFloorplanStore.getState().markDirty();
      expect(useFloorplanStore.getState().isDirty).toBe(true);

      useFloorplanStore.getState().markClean();
      expect(useFloorplanStore.getState().isDirty).toBe(false);
    });
  });
});
