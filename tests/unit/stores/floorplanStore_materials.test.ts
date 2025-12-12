import { act, renderHook } from '@testing-library/react';
import { useFloorplanStore } from '../../../src/stores/floorplanStore';
import { ROOM_TYPE_MATERIALS } from '../../../src/constants/defaults';
import { FloorMaterial, WallMaterial, CeilingMaterial } from '../../../src/types/materials';
import { Room } from '../../../src/types/room';

// Mock generateUUID
jest.mock('../../../src/services/geometry', () => {
    const { jest } = require('@jest/globals');
    return {
        generateUUID: jest.fn(() => 'test-id'),
    };
});

// Mock geometry services
jest.mock('../../../src/services/geometry/room', () => {
    const { jest } = require('@jest/globals');
    return {
        calculateArea: jest.fn(() => 20),
        calculateVolume: jest.fn(() => 50),
        getRoomBounds: jest.fn(() => ({ minX: 0, maxX: 4, minZ: 0, maxZ: 5 })),
    };
});

// Mock adjacency services
jest.mock('../../../src/services/adjacency/graph', () => {
    const { jest } = require('@jest/globals');
    return {
        calculateAllConnections: jest.fn(() => []),
    };
});

describe('useFloorplanStore Materials', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useFloorplanStore());
    act(() => {
      result.current.clearFloorplan();
      result.current.createFloorplan('Test Plan', 'meters');
    });
  });

  it('should apply default materials when adding a room', () => {
    const { result } = renderHook(() => useFloorplanStore());

    let room: Room;
    act(() => {
      room = result.current.addRoom({
        name: 'Master Bedroom',
        length: 4,
        width: 5,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      });
    });

    const bedroomDefaults = ROOM_TYPE_MATERIALS['bedroom'];
    const addedRoom = result.current.getRoomById(room!.id);

    expect(addedRoom).toBeDefined();
    expect(addedRoom?.floorMaterial).toBe(bedroomDefaults.floor);
    expect(addedRoom?.wallMaterial).toBe(bedroomDefaults.wall);
    expect(addedRoom?.ceilingMaterial).toBe(bedroomDefaults.ceiling);
  });

  it('should not override provided materials when adding a room', () => {
    const { result } = renderHook(() => useFloorplanStore());

    let room: Room;
    act(() => {
      room = result.current.addRoom({
        name: 'Custom Room',
        length: 4,
        width: 5,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
        floorMaterial: 'concrete' as FloorMaterial,
        wallMaterial: 'brick-red' as WallMaterial,
      });
    });

    const addedRoom = result.current.getRoomById(room!.id);

    expect(addedRoom?.floorMaterial).toBe('concrete');
    expect(addedRoom?.wallMaterial).toBe('brick-red');
    // Ceiling should still get default since we didn't provide it
    expect(addedRoom?.ceilingMaterial).toBe(ROOM_TYPE_MATERIALS['bedroom'].ceiling);
  });

  it('should update room floor material', () => {
    const { result } = renderHook(() => useFloorplanStore());

    let room: Room;
    act(() => {
      room = result.current.addRoom({
        name: 'Test Room',
        length: 4, width: 5, height: 2.7, type: 'living',
        position: { x: 0, z: 0 }, rotation: 0,
      });
    });

    act(() => {
      result.current.setRoomFloorMaterial(room!.id, 'tile-ceramic' as FloorMaterial);
    });

    const updatedRoom = result.current.getRoomById(room!.id);
    expect(updatedRoom?.floorMaterial).toBe('tile-ceramic');
  });

  it('should update room wall material', () => {
    const { result } = renderHook(() => useFloorplanStore());

    let room: Room;
    act(() => {
      room = result.current.addRoom({
        name: 'Test Room',
        length: 4, width: 5, height: 2.7, type: 'living',
        position: { x: 0, z: 0 }, rotation: 0,
      });
    });

    act(() => {
      result.current.setRoomWallMaterial(room!.id, 'brick-white' as WallMaterial);
    });

    const updatedRoom = result.current.getRoomById(room!.id);
    expect(updatedRoom?.wallMaterial).toBe('brick-white');
  });

  it('should update room ceiling material', () => {
    const { result } = renderHook(() => useFloorplanStore());

    let room: Room;
    act(() => {
      room = result.current.addRoom({
        name: 'Test Room',
        length: 4, width: 5, height: 2.7, type: 'living',
        position: { x: 0, z: 0 }, rotation: 0,
      });
    });

    act(() => {
      result.current.setRoomCeilingMaterial(room!.id, 'wood-beam' as CeilingMaterial);
    });

    const updatedRoom = result.current.getRoomById(room!.id);
    expect(updatedRoom?.ceilingMaterial).toBe('wood-beam');
  });

  it('should set custom colors and clear material when needed', () => {
    const { result } = renderHook(() => useFloorplanStore());

    let room: Room;
    act(() => {
      room = result.current.addRoom({
        name: 'Test Room',
        length: 4, width: 5, height: 2.7, type: 'living',
        position: { x: 0, z: 0 }, rotation: 0,
      });
    });

    // Set custom floor color
    act(() => {
      result.current.setRoomCustomColor(room!.id, 'floor', '#123456');
    });

    let updatedRoom = result.current.getRoomById(room!.id);
    expect(updatedRoom?.customFloorColor).toBe('#123456');

    // Setting material should clear custom color
    act(() => {
      result.current.setRoomFloorMaterial(room!.id, 'carpet');
    });

    updatedRoom = result.current.getRoomById(room!.id);
    expect(updatedRoom?.floorMaterial).toBe('carpet');
    expect(updatedRoom?.customFloorColor).toBeUndefined();

    // Setting custom color again
    act(() => {
      result.current.setRoomCustomColor(room!.id, 'wall', '#aabbcc');
    });

    updatedRoom = result.current.getRoomById(room!.id);
    expect(updatedRoom?.customWallColor).toBe('#aabbcc');
  });
});
