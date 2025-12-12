import { useState, useCallback, useRef } from 'react';
import { useFloorplanStore } from '../stores/floorplanStore';
import { useUIStore } from '../stores/uiStore';
import { Position2D } from '../types';
import { PIXELS_PER_METER } from '../constants/defaults';
import { useToast } from './use-toast';
import { doRoomsOverlap } from '../services/geometry/room';
import { getSnapGuides, SnapGuide } from '../services/geometry/snapping';

export const useRoomDrag = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [overlappingRoomIds, setOverlappingRoomIds] = useState<string[]>([]);
  const [activeGuides, setActiveGuides] = useState<SnapGuide[]>([]);

  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const initialPositionsRef = useRef<Map<string, Position2D>>(new Map());
  const draggedRoomIdRef = useRef<string | null>(null);

  const selectedRoomIds = useFloorplanStore((state) => state.selectedRoomIds);
  const updateRoom = useFloorplanStore((state) => state.updateRoom);
  const selectRoom = useFloorplanStore((state) => state.selectRoom);
  const currentFloorplan = useFloorplanStore((state) => state.currentFloorplan);
  const { toast } = useToast();

  const zoomLevel = useUIStore((state) => state.zoomLevel);
  const showGrid = useUIStore((state) => state.showGrid);
  const gridSize = 0.5;

  // Stable ref for state used in event handlers
  const stateRef = useRef({ zoomLevel, showGrid, updateRoom });
  stateRef.current = { zoomLevel, showGrid, updateRoom };

  const handleGlobalMouseMoveStable = useCallback((e: MouseEvent) => {
      if (!dragStartRef.current || !draggedRoomIdRef.current) return;
      const { zoomLevel, showGrid, updateRoom } = stateRef.current;

      const dxPixels = e.clientX - dragStartRef.current.x;
      const dyPixels = e.clientY - dragStartRef.current.y;

      const scale = PIXELS_PER_METER * zoomLevel;
      const dxMeters = dxPixels / scale;
      const dyMeters = dyPixels / scale;

      const store = useFloorplanStore.getState();
      const rooms = store.currentFloorplan?.rooms || [];
      const selectedIds = store.selectedRoomIds;

      // Determine primary room (the one being dragged)
      const primaryRoomId = draggedRoomIdRef.current;
      const primaryInitialPos = initialPositionsRef.current.get(primaryRoomId);
      const primaryRoom = rooms.find(r => r.id === primaryRoomId);

      if (!primaryRoom || !primaryInitialPos) return;

      // Calculate proposed position for primary room
      let proposedX = primaryInitialPos.x + dxMeters;
      let proposedZ = primaryInitialPos.z + dyMeters;

      // Apply Grid Snapping
      if (showGrid) {
          proposedX = Math.round(proposedX / gridSize) * gridSize;
          proposedZ = Math.round(proposedZ / gridSize) * gridSize;
      }

      // Identify static rooms (not being dragged)
      const staticRooms = rooms.filter(r => !selectedIds.includes(r.id));

      // Calculate Smart Guides
      const snapResult = getSnapGuides(
          primaryRoom,
          staticRooms,
          { x: proposedX, z: proposedZ },
          0.2 // Tolerance
      );

      // Update guides
      setActiveGuides(snapResult.guides);

      // Calculate actual delta based on snapped position
      const finalX = snapResult.position.x;
      const finalZ = snapResult.position.z;

      const actualDx = finalX - primaryInitialPos.x;
      const actualDy = finalZ - primaryInitialPos.z;

      // Update positions for ALL selected rooms
      initialPositionsRef.current.forEach((initialPos, roomId) => {
        updateRoom(roomId, {
            position: { x: initialPos.x + actualDx, z: initialPos.z + actualDy }
        });
      });

      // Fetch fresh state for collision detection to ensure we check updated positions
      const updatedStore = useFloorplanStore.getState();
      const updatedRooms = updatedStore.currentFloorplan?.rooms || [];

      // Collision Detection
      const newOverlappingIds: string[] = [];
      for (const id of selectedIds) {
          const room = updatedRooms.find(r => r.id === id);
          if (!room) continue;

          let roomOverlaps = false;
          for (const other of updatedRooms) {
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

  }, []);

  // Wrapper to access fresh state/props without breaking add/remove listener logic
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const handleGlobalMouseUpWrapper = useCallback((e: MouseEvent) => {
     setIsDragging(false);
     dragStartRef.current = null;
     draggedRoomIdRef.current = null;
     initialPositionsRef.current.clear();
     setActiveGuides([]);

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


  const handleDragStartStable = useCallback((e: React.MouseEvent, roomId: string) => {
       if (e.button !== 0) return;
       e.stopPropagation();
       e.preventDefault();

       setIsDragging(true);
       dragStartRef.current = { x: e.clientX, y: e.clientY };
       draggedRoomIdRef.current = roomId;

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
    activeGuides,
    handleDragStart: handleDragStartStable
  };
};
