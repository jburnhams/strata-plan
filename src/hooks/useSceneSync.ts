import { useState, useCallback } from 'react';
import { useFloorplanStore } from '../stores/floorplanStore';
import { useDebounce } from './useDebounce';
import { Floorplan, Room } from '../types';

interface UseSceneSyncResult {
  rooms: Room[];
  floorplan: Floorplan | null;
  sceneVersion: number;
  regenerateScene: () => void;
}

export const useSceneSync = (delay = 100): UseSceneSyncResult => {
  const floorplan = useFloorplanStore(state => state.currentFloorplan);
  const debouncedFloorplan = useDebounce(floorplan, delay);
  const [sceneVersion, setSceneVersion] = useState(0);

  const regenerateScene = useCallback(() => {
    setSceneVersion(v => v + 1);
  }, []);

  return {
    rooms: debouncedFloorplan?.rooms || [],
    floorplan: debouncedFloorplan,
    sceneVersion,
    regenerateScene
  };
};
