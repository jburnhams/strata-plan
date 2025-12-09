import { useCallback } from 'react';
import { useFloorplanStore } from '../stores/floorplanStore';
import { RoomType, Room } from '../types';

interface UseAddRoomReturn {
  addRoom: (type?: RoomType) => Room;
  addRoomWithDefaults: () => Room;
}

export const useAddRoom = (): UseAddRoomReturn => {
  const addRoomToStore = useFloorplanStore((state) => state.addRoom);
  const getRoomCount = useFloorplanStore((state) => state.getRoomCount);

  const addRoom = useCallback((type: RoomType = 'other') => {
    const count = getRoomCount();
    // In a real hook we might read from store to see what next number is,
    // or just rely on length + 1.
    // Ideally we scan existing names to find first available "Room X".

    // For now simple increment
    const name = type === 'other' ? `Room ${count + 1}` : `${type.charAt(0).toUpperCase() + type.slice(1)} ${count + 1}`;

    return addRoomToStore({
      name,
      length: 4,
      width: 4,
      height: 2.7,
      type,
      position: { x: 0, z: 0 },
      rotation: 0,
    });
  }, [addRoomToStore, getRoomCount]);

  const addRoomWithDefaults = useCallback(() => {
    return addRoom('other');
  }, [addRoom]);

  return {
    addRoom,
    addRoomWithDefaults,
  };
};
