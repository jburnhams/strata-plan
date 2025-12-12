import { act, renderHook } from '@testing-library/react';
import { useFloorplanStore } from '@/stores/floorplanStore';
import { DOOR_DEFAULTS } from '@/types/door';
import { WINDOW_DEFAULTS } from '@/types/window';
import { WallSide } from '@/types/geometry';

// Mock UUID generation
jest.mock('@/services/geometry', () => ({
  generateUUID: jest.fn(() => 'test-id-' + Math.random().toString(36).substr(2, 9)),
}));

describe('Floorplan Store - Doors and Windows', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useFloorplanStore());
    act(() => {
      result.current.createFloorplan('Test Plan', 'meters');
    });
  });

  test('adds and retrieves a door', () => {
    const { result } = renderHook(() => useFloorplanStore());

    // Add a room first
    let roomId: string;
    act(() => {
      const room = result.current.addRoom({
        name: 'Room 1',
        length: 4,
        width: 4,
        height: 2.4,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      });
      roomId = room.id;
    });

    // Add a door
    let doorId: string;
    act(() => {
      const door = result.current.addDoor({
        ...DOOR_DEFAULTS,
        roomId: roomId!,
        wallSide: 'front',
        position: 0.5,
      });
      doorId = door.id;
    });

    const door = result.current.getDoorById(doorId!);
    expect(door).toBeDefined();
    expect(door?.roomId).toBe(roomId!);
    expect(door?.wallSide).toBe('front');

    const roomDoors = result.current.getDoorsByRoom(roomId!);
    expect(roomDoors).toHaveLength(1);
    expect(roomDoors[0].id).toBe(doorId!);
  });

  test('updates a door', () => {
    const { result } = renderHook(() => useFloorplanStore());

    // Add room and door
    let roomId: string;
    let doorId: string;
    act(() => {
        const room = result.current.addRoom({
            name: 'Room 1',
            length: 4,
            width: 4,
            height: 2.4,
            type: 'bedroom',
            position: { x: 0, z: 0 },
            rotation: 0,
        });
        roomId = room.id;
        const door = result.current.addDoor({
            ...DOOR_DEFAULTS,
            roomId,
            wallSide: 'front',
            position: 0.5,
        });
        doorId = door.id;
    });

    // Update door
    act(() => {
      result.current.updateDoor(doorId, { position: 0.8 });
    });

    const door = result.current.getDoorById(doorId);
    expect(door?.position).toBe(0.8);
  });

  test('deletes a door', () => {
    const { result } = renderHook(() => useFloorplanStore());

    // Add room and door
    let roomId: string;
    let doorId: string;
    act(() => {
        const room = result.current.addRoom({
            name: 'Room 1',
            length: 4,
            width: 4,
            height: 2.4,
            type: 'bedroom',
            position: { x: 0, z: 0 },
            rotation: 0,
        });
        roomId = room.id;
        const door = result.current.addDoor({
            ...DOOR_DEFAULTS,
            roomId,
            wallSide: 'front',
            position: 0.5,
        });
        doorId = door.id;
    });

    // Select door first to check selection clearing
    act(() => {
        result.current.selectDoor(doorId);
    });
    expect(result.current.selectedDoorId).toBe(doorId);

    // Delete door
    act(() => {
      result.current.deleteDoor(doorId);
    });

    const door = result.current.getDoorById(doorId);
    expect(door).toBeUndefined();
    expect(result.current.selectedDoorId).toBeNull();
  });

  test('adds and retrieves a window', () => {
      const { result } = renderHook(() => useFloorplanStore());

      // Add a room first
      let roomId: string;
      act(() => {
        const room = result.current.addRoom({
          name: 'Room 1',
          length: 4,
          width: 4,
          height: 2.4,
          type: 'bedroom',
          position: { x: 0, z: 0 },
          rotation: 0,
        });
        roomId = room.id;
      });

      // Add a window
      let windowId: string;
      act(() => {
        const window = result.current.addWindow({
          ...WINDOW_DEFAULTS,
          roomId: roomId!,
          wallSide: 'left',
          position: 0.5,
        });
        windowId = window.id;
      });

      const window = result.current.getWindowById(windowId!);
      expect(window).toBeDefined();
      expect(window?.roomId).toBe(roomId!);
      expect(window?.wallSide).toBe('left');

      const roomWindows = result.current.getWindowsByRoom(roomId!);
      expect(roomWindows).toHaveLength(1);
      expect(roomWindows[0].id).toBe(windowId!);
    });

    test('cascading delete: deleting room deletes doors and windows', () => {
        const { result } = renderHook(() => useFloorplanStore());

        // Add room
        let roomId: string;
        act(() => {
          const room = result.current.addRoom({
            name: 'Room 1',
            length: 4,
            width: 4,
            height: 2.4,
            type: 'bedroom',
            position: { x: 0, z: 0 },
            rotation: 0,
          });
          roomId = room.id;
        });

        // Add door and window
        let doorId: string;
        let windowId: string;
        act(() => {
            const door = result.current.addDoor({
                ...DOOR_DEFAULTS,
                roomId,
                wallSide: 'front',
                position: 0.5,
            });
            doorId = door.id;

            const window = result.current.addWindow({
                ...WINDOW_DEFAULTS,
                roomId,
                wallSide: 'left',
                position: 0.5,
            });
            windowId = window.id;
        });

        // Delete room
        act(() => {
            result.current.deleteRoom(roomId);
        });

        expect(result.current.getDoorById(doorId)).toBeUndefined();
        expect(result.current.getWindowById(windowId)).toBeUndefined();
    });
});
