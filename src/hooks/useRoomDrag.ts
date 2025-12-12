import { useState, useCallback, useRef } from 'react';
import { useFloorplanStore } from '../stores/floorplanStore';
import { useUIStore } from '../stores/uiStore';
import { Position2D } from '../types';
import { PIXELS_PER_METER } from '../constants/defaults';
import { useToast } from './use-toast';
import { doRoomsOverlap } from '../services/geometry/room';

export const useRoomDrag = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [overlappingRoomIds, setOverlappingRoomIds] = useState<string[]>([]);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const initialPositionsRef = useRef<Map<string, Position2D>>(new Map());

  const selectedRoomIds = useFloorplanStore((state) => state.selectedRoomIds);
  const updateRoom = useFloorplanStore((state) => state.updateRoom);
  const selectRoom = useFloorplanStore((state) => state.selectRoom);
  const currentFloorplan = useFloorplanStore((state) => state.currentFloorplan);
  const { toast } = useToast();

  const zoomLevel = useUIStore((state) => state.zoomLevel);
  const showGrid = useUIStore((state) => state.showGrid);
  // Default grid size is 0.5m (from defaults), but we might want to get it from store if configurable
  const gridSize = 0.5;

  // Stable ref for state used in event handlers
  const stateRef = useRef({ zoomLevel, showGrid, updateRoom });
  stateRef.current = { zoomLevel, showGrid, updateRoom };

  const handleGlobalMouseMoveStable = useCallback((e: MouseEvent) => {
      if (!dragStartRef.current) return;
      const { zoomLevel, showGrid, updateRoom } = stateRef.current;

      const dxPixels = e.clientX - dragStartRef.current.x;
      const dyPixels = e.clientY - dragStartRef.current.y;

      const scale = PIXELS_PER_METER * zoomLevel;
      const dxMeters = dxPixels / scale;
      const dyMeters = dyPixels / scale;

      // Update positions
      initialPositionsRef.current.forEach((initialPos, roomId) => {
        let newX = initialPos.x + dxMeters;
        let newZ = initialPos.z + dyMeters;

        if (showGrid) {
            newX = Math.round(newX / gridSize) * gridSize;
            newZ = Math.round(newZ / gridSize) * gridSize;
        }

        updateRoom(roomId, {
            position: { x: newX, z: newZ }
        });
      });

      // Collision Detection in real-time
      const store = useFloorplanStore.getState();
      const rooms = store.currentFloorplan?.rooms || [];
      const selectedIds = store.selectedRoomIds;

      const newOverlappingIds: string[] = [];

      // Check if any selected room overlaps with any non-selected room
      for (const id of selectedIds) {
          const room = rooms.find(r => r.id === id);
          if (!room) continue;

          let roomOverlaps = false;
          for (const other of rooms) {
              if (other.id === id) continue; // Don't check against self

              if (doRoomsOverlap(room, other)) {
                  roomOverlaps = true;
                  break;
              }
          }
          if (roomOverlaps) {
              newOverlappingIds.push(id);
          }
      }

      setOverlappingRoomIds(newOverlappingIds);

  }, []); // No deps, stable

  // Wrapper to access fresh state/props without breaking add/remove listener logic
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const handleGlobalMouseUpWrapper = useCallback((e: MouseEvent) => {
     setIsDragging(false);
     dragStartRef.current = null;
     initialPositionsRef.current.clear();

     // Check fresh state from store to be sure about final overlaps
     const store = useFloorplanStore.getState();
     const rooms = store.currentFloorplan?.rooms || [];
     const selectedIds = store.selectedRoomIds;
     let anyOverlap = false;

     for (const id of selectedIds) {
          const room = rooms.find(r => r.id === id);
          if (!room) continue;
          for (const other of rooms) {
              if (other.id === id) continue;
              if (doRoomsOverlap(room, other)) {
                  anyOverlap = true;
                  break;
              }
          }
          if (anyOverlap) break;
     }

     if (anyOverlap) {
         if (typeof toastRef.current === 'function') {
             toastRef.current({
                title: "Rooms Overlapping",
                description: "Placement causes room overlap.",
                variant: "destructive"
             });
         }
     }

     setOverlappingRoomIds([]);

     document.removeEventListener('mousemove', handleGlobalMouseMoveStable);
     document.removeEventListener('mouseup', handleGlobalMouseUpWrapper);
  }, [handleGlobalMouseMoveStable]);


  // We need to bind the stable handler in start
  const handleDragStartStable = useCallback((e: React.MouseEvent, roomId: string) => {
       if (e.button !== 0) return;
       e.stopPropagation();
       e.preventDefault();

       setIsDragging(true);
       dragStartRef.current = { x: e.clientX, y: e.clientY };

       const store = useFloorplanStore.getState();
       let roomsToDragIds = store.selectedRoomIds;
       if (!roomsToDragIds.includes(roomId)) {
           store.selectRoom(roomId);
           roomsToDragIds = [roomId];
       }

       const initialMap = new Map<string, Position2D>();
       const rooms = store.currentFloorplan?.rooms || [];
       roomsToDragIds.forEach(id => {
           const room = rooms.find(r => r.id === id);
           if (room) {
               initialMap.set(id, { ...room.position });
           }
       });
       initialPositionsRef.current = initialMap;

       document.addEventListener('mousemove', handleGlobalMouseMoveStable);
       document.addEventListener('mouseup', handleGlobalMouseUpWrapper);

  }, [handleGlobalMouseMoveStable, handleGlobalMouseUpWrapper]);

  return {
    isDragging,
    overlappingRoomIds,
    handleDragStart: handleDragStartStable
  };
};
