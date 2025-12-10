import { useFloorplanStore } from '../stores/floorplanStore';
import { useDebounce } from './useDebounce';
import { Floorplan, Room } from '../types';

interface UseSceneSyncResult {
  rooms: Room[];
  floorplan: Floorplan | null;
}

export const useSceneSync = (delay = 100): UseSceneSyncResult => {
  const floorplan = useFloorplanStore(state => state.currentFloorplan);
  const debouncedFloorplan = useDebounce(floorplan, delay);

  return {
    rooms: debouncedFloorplan?.rooms || [],
    floorplan: debouncedFloorplan
  };
};
