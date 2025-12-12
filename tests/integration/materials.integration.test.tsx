import { renderHook, act } from '@testing-library/react';
import { useFloorplanStore } from '../../src/stores/floorplanStore';
import { ROOM_TYPE_MATERIALS } from '../../src/constants/defaults';
import { FloorMaterial, WallMaterial } from '../../src/types/materials';
import { Room } from '../../src/types/room';

// Mock storage to prevent IndexedDB calls
jest.mock('../../src/services/storage', () => ({
  saveProject: jest.fn(),
  loadProject: jest.fn(),
}));

describe('Materials Integration', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useFloorplanStore());
    act(() => {
      result.current.clearFloorplan();
      result.current.createFloorplan('Integration Test Project', 'meters');
    });
  });

  it('should maintain material consistency through room updates', () => {
    const { result } = renderHook(() => useFloorplanStore());

    // 1. Add a room and verify default materials
    let room: Room;
    act(() => {
      room = result.current.addRoom({
        name: 'Living Room',
        length: 5,
        width: 4,
        height: 2.7,
        type: 'living',
        position: { x: 0, z: 0 },
        rotation: 0,
      });
    });

    const defaults = ROOM_TYPE_MATERIALS['living'];
    expect(result.current.getRoomById(room!.id)?.floorMaterial).toBe(defaults.floor);

    // 2. Change floor material
    act(() => {
      result.current.setRoomFloorMaterial(room!.id, 'stone-slate' as FloorMaterial);
    });

    expect(result.current.getRoomById(room!.id)?.floorMaterial).toBe('stone-slate');

    // 3. Set custom wall color (should not affect floor material)
    act(() => {
      result.current.setRoomCustomColor(room!.id, 'wall', '#ff0000');
    });

    const updatedRoom = result.current.getRoomById(room!.id);
    expect(updatedRoom?.floorMaterial).toBe('stone-slate');
    expect(updatedRoom?.customWallColor).toBe('#ff0000');

    // 4. Verify wall material remains unchanged (default)
    expect(updatedRoom?.wallMaterial).toBe(defaults.wall);
  });

  it('should handle custom color vs material precedence', () => {
    const { result } = renderHook(() => useFloorplanStore());

    let room: Room;
    act(() => {
      room = result.current.addRoom({
        name: 'Bedroom',
        length: 4,
        width: 3.5,
        height: 2.7,
        type: 'bedroom',
        position: { x: 0, z: 0 },
        rotation: 0,
      });
    });

    // 1. Set custom floor color
    act(() => {
      result.current.setRoomCustomColor(room!.id, 'floor', '#00ff00');
    });

    expect(result.current.getRoomById(room!.id)?.customFloorColor).toBe('#00ff00');

    // 2. Set floor material - should clear custom color
    act(() => {
      result.current.setRoomFloorMaterial(room!.id, 'carpet' as FloorMaterial);
    });

    const updatedRoom = result.current.getRoomById(room!.id);
    expect(updatedRoom?.floorMaterial).toBe('carpet');
    expect(updatedRoom?.customFloorColor).toBeUndefined();
  });
});
