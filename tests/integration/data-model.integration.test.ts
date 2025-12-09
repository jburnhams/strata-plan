/**
 * Integration tests for the complete data model
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { useFloorplanStore } from '../../src/stores/floorplanStore';
import { createRoom, createDefaultRoom, cloneRoom } from '../../src/services/room/factory';
import { validateFloorplan, hasErrors } from '../../src/utils/validation';
import { getRoomBounds, doRoomsOverlap } from '../../src/services/geometry';
import type { Room } from '../../src/types';

describe('Data Model Integration', () => {
  beforeEach(() => {
    // Reset store completely
    const store = useFloorplanStore.getState();
    store.clearFloorplan();
    store.clearSelection();
    store.setEditorMode('table');
  });

  describe('Full floorplan lifecycle', () => {
    it('should create → add rooms → update room → delete room → verify state', () => {
      // Create floorplan
      let store = useFloorplanStore.getState();
      const floorplan = store.createFloorplan('My House', 'meters');

      store = useFloorplanStore.getState(); // Re-fetch after update
      expect(floorplan).not.toBeNull();
      expect(store.currentFloorplan).not.toBeNull();
      expect(store.currentFloorplan?.rooms).toHaveLength(0);

      // Add first room
      const room1: Omit<Room, 'id'> = {
        name: 'Master Bedroom',
        length: 5,
        width: 4,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      };
      const addedRoom1 = store.addRoom(room1);

      store = useFloorplanStore.getState(); // Re-fetch
      expect(store.currentFloorplan?.rooms).toHaveLength(1);
      expect(addedRoom1.id).toBeDefined();

      // Add second room
      const room2: Omit<Room, 'id'> = {
        name: 'Kitchen',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'kitchen',
        position: { x: 10, z: 0 },
        rotation: 0,
      };
      const addedRoom2 = store.addRoom(room2);

      store = useFloorplanStore.getState(); // Re-fetch
      expect(store.currentFloorplan?.rooms).toHaveLength(2);

      // Update first room
      store.updateRoom(addedRoom1.id, { name: 'Primary Bedroom', length: 6 });

      store = useFloorplanStore.getState(); // Re-fetch
      const updatedRoom = store.getRoomById(addedRoom1.id);
      expect(updatedRoom?.name).toBe('Primary Bedroom');
      expect(updatedRoom?.length).toBe(6);

      // Delete second room
      store.deleteRoom(addedRoom2.id);

      store = useFloorplanStore.getState(); // Re-fetch
      expect(store.currentFloorplan?.rooms).toHaveLength(1);
      expect(store.getRoomById(addedRoom2.id)).toBeUndefined();

      // Verify final state
      expect(store.currentFloorplan?.rooms[0].name).toBe('Primary Bedroom');
      expect(store.isDirty).toBe(true);
    });
  });

  describe('Auto-layout', () => {
    it('should lay out 5 rooms left-to-right with gaps', () => {
      let store = useFloorplanStore.getState();
      store.createFloorplan('Test Plan', 'meters');

      const rooms: Array<Omit<Room, 'id'>> = [
        { name: 'Room 1', length: 4, width: 3, height: 2.7, type: 'bedroom', position: { x: 0, z: 0 }, rotation: 0 },
        { name: 'Room 2', length: 3, width: 3, height: 2.7, type: 'kitchen', position: { x: 0, z: 0 }, rotation: 0 },
        { name: 'Room 3', length: 5, width: 4, height: 2.7, type: 'living', position: { x: 0, z: 0 }, rotation: 0 },
        { name: 'Room 4', length: 2, width: 2, height: 2.7, type: 'bathroom', position: { x: 0, z: 0 }, rotation: 0 },
        { name: 'Room 5', length: 3, width: 2, height: 2.7, type: 'office', position: { x: 0, z: 0 }, rotation: 0 },
      ];

      const addedRooms: Room[] = [];
      for (const roomData of rooms) {
        addedRooms.push(store.addRoom(roomData));
        store = useFloorplanStore.getState(); // Re-fetch after each add
      }

      // First room at origin
      expect(addedRooms[0].position.x).toBe(0);
      expect(addedRooms[0].position.z).toBe(0);

      // Second room: after first room + gap
      expect(addedRooms[1].position.x).toBe(5); // 4 + 1 gap
      expect(addedRooms[1].position.z).toBe(0);

      // Third room: after second room + gap
      expect(addedRooms[2].position.x).toBe(9); // 5 + 3 + 1 gap
      expect(addedRooms[2].position.z).toBe(0);

      // Fourth room: after third room + gap
      expect(addedRooms[3].position.x).toBe(15); // 9 + 5 + 1 gap
      expect(addedRooms[3].position.z).toBe(0);

      // Fifth room: after fourth room + gap
      expect(addedRooms[4].position.x).toBe(18); // 15 + 2 + 1 gap
      expect(addedRooms[4].position.z).toBe(0);
    });

    it('should correctly handle auto-layout with rotated rooms', () => {
      let store = useFloorplanStore.getState();
      store.createFloorplan('Test Rotated', 'meters');

      // First room: 4m × 3m, rotated 90° (so occupies 3m × 4m in world space)
      const room1 = store.addRoom({
        name: 'Room 1',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 90,
      });

      // Second room: 3m × 2m, not rotated (position should be auto-calculated)
      const room2 = store.addRoom({
        name: 'Room 2',
        length: 3,
        width: 2,
        height: 2.7,
        type: 'kitchen',
        position: { x: 0, z: 0 }, // Will be auto-positioned
        rotation: 0,
      });

      store = useFloorplanStore.getState(); // Re-fetch

      // First room should be at origin
      expect(room1.position.x).toBe(0);
      expect(room1.position.z).toBe(0);

      // Second room should be positioned after first room's ROTATED width (3m) + gap (1m)
      // For 90° rotation, the room's width becomes its world-space X extent
      const bounds1 = getRoomBounds(room1);
      const expectedX = bounds1.maxX + 1.0; // After rotated room + gap

      const actualRoom2 = store.getRoomById(room2.id);
      expect(actualRoom2?.position.x).toBe(expectedX); // Should be 3 + 1 = 4
      expect(actualRoom2?.position.z).toBe(0);
    });

    it('should handle mixed rotations in auto-layout', () => {
      let store = useFloorplanStore.getState();
      store.createFloorplan('Mixed Rotations', 'meters');

      const rooms: Array<Omit<Room, 'id'>> = [
        { name: 'Room 1', length: 4, width: 3, height: 2.7, type: 'bedroom', position: { x: 0, z: 0 }, rotation: 0 },
        { name: 'Room 2', length: 3, width: 2, height: 2.7, type: 'kitchen', position: { x: 0, z: 0 }, rotation: 90 },
        { name: 'Room 3', length: 5, width: 4, height: 2.7, type: 'living', position: { x: 0, z: 0 }, rotation: 0 },
        { name: 'Room 4', length: 3, width: 3, height: 2.7, type: 'bathroom', position: { x: 0, z: 0 }, rotation: 180 },
      ];

      const addedRooms: Room[] = [];
      for (const roomData of rooms) {
        addedRooms.push(store.addRoom(roomData));
        store = useFloorplanStore.getState();
      }

      // Verify each room is positioned correctly based on previous room's bounds
      let expectedX = 0;
      for (let i = 0; i < addedRooms.length; i++) {
        expect(addedRooms[i].position.x).toBe(expectedX);
        expect(addedRooms[i].position.z).toBe(0);

        // Calculate next position based on this room's bounds
        const bounds = getRoomBounds(addedRooms[i]);
        expectedX = bounds.maxX + 1.0; // Add gap
      }

      // Verify no rooms overlap
      for (let i = 0; i < addedRooms.length; i++) {
        for (let j = i + 1; j < addedRooms.length; j++) {
          expect(doRoomsOverlap(addedRooms[i], addedRooms[j])).toBe(false);
        }
      }
    });
  });

  describe('Selection flow', () => {
    it('should persist changes when switching selection', () => {
      let store = useFloorplanStore.getState();
      store.createFloorplan('Test', 'meters');

      // Add two rooms
      const room1 = store.addRoom(createRoom({
        name: 'Room 1',
        length: 4,
        width: 3,
        type: 'bedroom',
      }));

      const room2 = store.addRoom(createRoom({
        name: 'Room 2',
        length: 5,
        width: 4,
        type: 'kitchen',
      }));

      // Select and modify first room
      store.selectRoom(room1.id);
      store = useFloorplanStore.getState(); // Re-fetch
      expect(store.selectedRoomId).toBe(room1.id);

      store.updateRoom(room1.id, { name: 'Modified Room 1' });
      store = useFloorplanStore.getState(); // Re-fetch

      // Select second room
      store.selectRoom(room2.id);
      store = useFloorplanStore.getState(); // Re-fetch
      expect(store.selectedRoomId).toBe(room2.id);

      // Verify first room changes persisted
      const persistedRoom1 = store.getRoomById(room1.id);
      expect(persistedRoom1?.name).toBe('Modified Room 1');
    });
  });

  describe('Store persistence simulation', () => {
    it('should serialize and restore state', () => {
      let store = useFloorplanStore.getState();
      store.createFloorplan('Test Plan', 'meters');

      // Add rooms
      store.addRoom(createRoom({
        name: 'Bedroom',
        length: 4,
        width: 3,
        type: 'bedroom',
      }));

      store.addRoom(createRoom({
        name: 'Kitchen',
        length: 3,
        width: 3,
        type: 'kitchen',
      }));

      // Serialize
      store = useFloorplanStore.getState(); // Re-fetch
      const currentFloorplan = store.currentFloorplan;
      expect(currentFloorplan).not.toBeNull();

      const serialized = JSON.stringify(currentFloorplan);

      // Clear and restore
      store.clearFloorplan();
      store = useFloorplanStore.getState(); // Re-fetch
      expect(store.currentFloorplan).toBeNull();

      const restored = JSON.parse(serialized);
      // Convert date strings back to Date objects
      restored.createdAt = new Date(restored.createdAt);
      restored.updatedAt = new Date(restored.updatedAt);

      store.loadFloorplan(restored);

      store = useFloorplanStore.getState(); // Re-fetch
      // Verify restoration
      expect(store.currentFloorplan?.name).toBe('Test Plan');
      expect(store.currentFloorplan?.rooms).toHaveLength(2);
      expect(store.currentFloorplan?.rooms[0].name).toBe('Bedroom');
      expect(store.currentFloorplan?.rooms[1].name).toBe('Kitchen');
    });
  });

  describe('Validation integration', () => {
    it('should detect invalid dimensions and return validation errors', () => {
      let store = useFloorplanStore.getState();
      store.createFloorplan('Test', 'meters');

      // Add invalid room (dimensions too small)
      const invalidRoom: Omit<Room, 'id'> = {
        name: 'Invalid',
        length: 0.05, // Below minimum
        width: 0.05,
        height: 1.0, // Below minimum
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      };

      store.addRoom(invalidRoom);

      // Validate floorplan
      store = useFloorplanStore.getState(); // Re-fetch
      const currentFloorplan = store.currentFloorplan;
      expect(currentFloorplan).not.toBeNull();

      const validationResults = validateFloorplan(currentFloorplan!);
      expect(hasErrors(validationResults)).toBe(true);

      const errors = validationResults.filter((r) => !r.valid);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should detect overlapping rooms', () => {
      let store = useFloorplanStore.getState();
      store.createFloorplan('Test', 'meters');

      // Add two overlapping rooms
      store.addRoom({
        name: 'Room 1',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      });

      store.addRoom({
        name: 'Room 2',
        length: 4,
        width: 3,
        height: 2.7,
        type: 'kitchen',
        position: { x: 2, z: 1 }, // Overlaps with Room 1
        rotation: 0,
      });

      store = useFloorplanStore.getState(); // Re-fetch
      const currentFloorplan = store.currentFloorplan;
      expect(currentFloorplan).not.toBeNull();

      const validationResults = validateFloorplan(currentFloorplan!);
      const overlapErrors = validationResults.filter((r) => r.error?.includes('overlap'));

      expect(overlapErrors.length).toBeGreaterThan(0);
    });
  });

  describe('Room factory integration', () => {
    it('should create rooms with different factory methods', () => {
      let store = useFloorplanStore.getState();
      const floorplan = store.createFloorplan('Test', 'meters');
      expect(floorplan).not.toBeNull();

      // Create with createRoom
      const customRoom = createRoom({
        name: 'Custom',
        length: 5,
        width: 4,
        type: 'bedroom',
      });
      store.addRoom(customRoom);

      // Create with createDefaultRoom
      const defaultRoom = createDefaultRoom('kitchen');
      store.addRoom(defaultRoom);

      // Clone existing room
      const cloned = cloneRoom(customRoom, { x: 10, z: 0 });
      store.addRoom(cloned);

      store = useFloorplanStore.getState(); // Re-fetch
      expect(store.currentFloorplan?.rooms).toHaveLength(3);
      expect(store.currentFloorplan?.rooms[0].name).toBe('Custom');
      expect(store.currentFloorplan?.rooms[1].name).toBe('Kitchen');
      expect(store.currentFloorplan?.rooms[2].name).toBe('Custom (copy)');
      expect(store.currentFloorplan?.rooms[2].position.x).toBe(10);
    });
  });

  describe('Complex scenarios', () => {
    it('should handle complete house floorplan creation', () => {
      let store = useFloorplanStore.getState();
      store.createFloorplan('My Dream House', 'meters');

      // Add multiple rooms
      const bedroom1 = store.addRoom(createDefaultRoom('bedroom'));
      const bedroom2 = store.addRoom(createDefaultRoom('bedroom'));
      const kitchen = store.addRoom(createDefaultRoom('kitchen'));
      const living = store.addRoom(createDefaultRoom('living'));
      const bathroom = store.addRoom(createDefaultRoom('bathroom'));

      store = useFloorplanStore.getState(); // Re-fetch
      expect(store.getRoomCount()).toBe(5);

      // Calculate total area
      const totalArea = store.getTotalArea();
      expect(totalArea).toBeGreaterThan(0);

      // Update room names
      store.updateRoom(bedroom1.id, { name: 'Master Bedroom' });
      store.updateRoom(bedroom2.id, { name: 'Guest Bedroom' });

      // Validate the entire floorplan
      store = useFloorplanStore.getState(); // Re-fetch
      const currentFloorplan = store.currentFloorplan;
      expect(currentFloorplan).not.toBeNull();

      const validationResults = validateFloorplan(currentFloorplan!);
      const validRooms = validationResults.filter((r) => r.valid);

      expect(validRooms.length).toBeGreaterThan(0);
      expect(store.isDirty).toBe(true);

      // Mark as saved
      store.markClean();
      store = useFloorplanStore.getState(); // Re-fetch
      expect(store.isDirty).toBe(false);
    });
  });
});
