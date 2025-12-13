import { useState, useCallback, useRef } from 'react';
import { useFloorplanStore } from '../stores/floorplanStore';
import { useHistoryStore } from '../stores/historyStore';
import { useUIStore } from '../stores/uiStore';
import { useToast } from './use-toast';
import { Door } from '../types/door';
import { screenToWorld } from '../utils/coordinates';
import { projectPointOnLine } from '../utils/geometry';
import { getRoomWallSegments, getWallLength } from '../services/geometry';
import { WallSegment } from '../types';

export const useDoorDrag = () => {
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const draggedDoorIdRef = useRef<string | null>(null);
  const startFloorplanRef = useRef<any>(null);

  const updateDoor = useFloorplanStore((state) => state.updateDoor);
  const pushState = useHistoryStore((state) => state.pushState);
  const { toast } = useToast();

  const { zoomLevel, panOffset } = useUIStore();

  // Stable ref for state used in event handlers
  const stateRef = useRef({ zoomLevel, panOffset, updateDoor });
  stateRef.current = { zoomLevel, panOffset, updateDoor };

  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
      if (!dragStartRef.current || !draggedDoorIdRef.current) return;

      const canvas = document.querySelector('[data-testid="canvas-viewport"]');
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const { zoomLevel, panOffset, updateDoor } = stateRef.current;

      const worldPos = screenToWorld(
          e.clientX - rect.left,
          e.clientY - rect.top,
          {
              zoom: zoomLevel,
              pan: panOffset,
              width: rect.width,
              height: rect.height
          }
      );

      const store = useFloorplanStore.getState();
      const door = store.currentFloorplan?.doors.find(d => d.id === draggedDoorIdRef.current);
      if (!door) return;

      const room = store.currentFloorplan?.rooms.find(r => r.id === door.roomId);
      if (!room) return;

      // Find closest wall
      const walls = getRoomWallSegments(room);
      let bestMatch: { wall: WallSegment, t: number, dist: number } | null = null;

      for (const wall of walls) {
          const { t, dist } = projectPointOnLine(worldPos, wall.from, wall.to);

          if (!bestMatch || dist < bestMatch.dist) {
              bestMatch = { wall, t, dist };
          }
      }

      if (!bestMatch) return;

      // Only allow snapping if reasonably close (e.g. 2 meters) to avoid jumping when far away
      if (bestMatch.dist > 2.0) return;

      const wallLength = getWallLength(room, bestMatch.wall.wallSide);
      let newPosition = bestMatch.t;

      // Snap to 0.1m increments
      const snapIncrement = 0.1 / wallLength;
      newPosition = Math.round(newPosition / snapIncrement) * snapIncrement;

      // Validate bounds (keep door inside wall)
      const doorWidthRatio = door.width / wallLength;
      const halfDoorRatio = doorWidthRatio / 2;

      // Clamp position so door doesn't stick out
      const minPos = halfDoorRatio;
      const maxPos = 1 - halfDoorRatio;

      // If door is wider than wall, center it
      if (minPos > maxPos) {
          newPosition = 0.5;
      } else {
          newPosition = Math.max(minPos, Math.min(maxPos, newPosition));
      }

      // Check for overlaps with other doors/windows on the SAME wall
      // Note: We need to filter by the NEW wallSide
      const siblings = store.currentFloorplan?.doors.filter(d =>
          d.roomId === door.roomId &&
          d.wallSide === bestMatch!.wall.wallSide &&
          d.id !== door.id
      ) || [];

      const windows = store.currentFloorplan?.windows.filter(w =>
          w.roomId === door.roomId &&
          w.wallSide === bestMatch!.wall.wallSide
      ) || [];

      let overlap = false;

      const isOverlapping = (pos: number, width: number, otherPos: number, otherWidth: number) => {
          // Convert everything to meters for easier mental model
          const myStart = (pos * wallLength) - (width / 2);
          const myEnd = (pos * wallLength) + (width / 2);
          const otherStart = (otherPos * wallLength) - (otherWidth / 2);
          const otherEnd = (otherPos * wallLength) + (otherWidth / 2);

          return (myStart < otherEnd && myEnd > otherStart);
      };

      for (const sibling of siblings) {
          if (isOverlapping(newPosition, door.width, sibling.position, sibling.width)) {
              overlap = true;
              break;
          }
      }

      if (!overlap) {
          for (const win of windows) {
              if (isOverlapping(newPosition, door.width, win.position, win.width)) {
                  overlap = true;
                  break;
              }
          }
      }

      if (!overlap) {
           // Check if on shared wall
           let connectionId: string | undefined = undefined;
           let isExterior = true;

           if (store.currentFloorplan?.connections) {
              const connection = store.currentFloorplan.connections.find(c =>
                  (c.room1Id === room.id && c.room1Wall === bestMatch!.wall.wallSide) ||
                  (c.room2Id === room.id && c.room2Wall === bestMatch!.wall.wallSide)
              );

              if (connection) {
                  connectionId = connection.id;
                  isExterior = false;
              }
           }

           updateDoor(door.id, {
               wallSide: bestMatch.wall.wallSide,
               position: newPosition,
               connectionId,
               isExterior
           });
      }

  }, []);

  const handleGlobalMouseUp = useCallback((e: MouseEvent) => {
     setIsDragging(false);
     dragStartRef.current = null;
     draggedDoorIdRef.current = null;

     const store = useFloorplanStore.getState();

     // Push to history if changed
     if (startFloorplanRef.current && store.currentFloorplan) {
         const startDoor = startFloorplanRef.current.doors.find((d: Door) => d.id === draggedDoorIdRef.current);
         const endDoor = store.currentFloorplan.doors.find(d => d.id === draggedDoorIdRef.current);

         if (startDoor && endDoor && (startDoor.position !== endDoor.position || startDoor.wallSide !== endDoor.wallSide)) {
             pushState(startFloorplanRef.current);
         }
     }
     startFloorplanRef.current = null;

     document.removeEventListener('mousemove', handleGlobalMouseMove);
     document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [handleGlobalMouseMove, pushState]);

  const handleDragStart = useCallback((e: React.MouseEvent, doorId: string) => {
       if (e.button !== 0) return;
       e.stopPropagation();
       e.preventDefault();

       const store = useFloorplanStore.getState();
       const door = store.getDoorById(doorId);
       if (!door) return;

       setIsDragging(true);
       dragStartRef.current = { x: e.clientX, y: e.clientY };
       draggedDoorIdRef.current = doorId;

       if (store.currentFloorplan) {
           startFloorplanRef.current = store.currentFloorplan;
       }

       store.selectDoor(doorId);

       document.addEventListener('mousemove', handleGlobalMouseMove);
       document.addEventListener('mouseup', handleGlobalMouseUp);

  }, [handleGlobalMouseMove, handleGlobalMouseUp]);

  return {
    isDragging,
    handleDragStart
  };
};
