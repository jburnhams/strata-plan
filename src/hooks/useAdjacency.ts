import { useEffect, useMemo } from 'react';
import { useFloorplanStore } from '../stores/floorplanStore';
import { useDebounce } from './useDebounce';
import { Room } from '../types/room';
import { RoomConnection } from '../types/floorplan';

/**
 * Hook to retrieve rooms adjacent to a given room
 */
export function useAdjacentRooms(roomId: string): Room[] {
  const getAdjacentRooms = useFloorplanStore((state) => state.getAdjacentRooms);
  // Subscribe to connections changes
  const connections = useFloorplanStore((state) => state.currentFloorplan?.connections);
  const rooms = useFloorplanStore((state) => state.currentFloorplan?.rooms);

  // Re-run selector when connections or rooms change
  return useMemo(() => {
    return getAdjacentRooms(roomId);
  }, [roomId, connections, rooms, getAdjacentRooms]);
}

/**
 * Hook to retrieve connections for a given room
 */
export function useRoomConnections(roomId: string): RoomConnection[] {
  const connections = useFloorplanStore((state) => state.currentFloorplan?.connections);

  return useMemo(() => {
    if (!connections) return [];
    return connections.filter(
      (c) => c.room1Id === roomId || c.room2Id === roomId
    );
  }, [roomId, connections]);
}

/**
 * Hook to automatically synchronize connections when rooms change (debounced)
 */
export function useConnectionSync(delay: number = 300) {
  const rooms = useFloorplanStore((state) => state.currentFloorplan?.rooms);
  const recalculateConnections = useFloorplanStore((state) => state.recalculateConnections);

  // Debounce the room list to avoid rapid recalculation during drag
  const debouncedRooms = useDebounce(rooms, delay);

  useEffect(() => {
    if (debouncedRooms) {
      recalculateConnections();
    }
  }, [debouncedRooms, recalculateConnections]);
}
