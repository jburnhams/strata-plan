import { useState, useCallback, useRef } from 'react';
import { useFloorplanStore } from '../stores/floorplanStore';
import { useHistoryStore } from '../stores/historyStore';
import { useUIStore } from '../stores/uiStore';
import { Window } from '../types/window';
import { screenToWorld } from '../utils/coordinates';
import { projectPointOnLine } from '../utils/geometry';
import { getRoomWallSegments, getWallLength } from '../services/geometry';
import { WallSegment } from '../types';

export const useWindowDrag = () => {
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const draggedWindowIdRef = useRef<string | null>(null);
  const startFloorplanRef = useRef<any>(null);

  const updateWindow = useFloorplanStore((state) => state.updateWindow);
  const pushState = useHistoryStore((state) => state.pushState);

  const { zoomLevel, panOffset } = useUIStore();

  const stateRef = useRef({ zoomLevel, panOffset, updateWindow });
  stateRef.current = { zoomLevel, panOffset, updateWindow };

  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
      if (!dragStartRef.current || !draggedWindowIdRef.current) return;

      const canvas = document.querySelector('[data-testid="canvas-viewport"]');
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const { zoomLevel, panOffset, updateWindow } = stateRef.current;

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
      const windowObj = store.currentFloorplan?.windows.find(w => w.id === draggedWindowIdRef.current);
      if (!windowObj) return;

      const room = store.currentFloorplan?.rooms.find(r => r.id === windowObj.roomId);
      if (!room) return;

      const walls = getRoomWallSegments(room);
      let bestMatch: { wall: WallSegment, t: number, dist: number } | null = null;

      for (const wall of walls) {
          const { t, dist } = projectPointOnLine(worldPos, wall.from, wall.to);

          if (!bestMatch || dist < bestMatch.dist) {
              bestMatch = { wall, t, dist };
          }
      }

      if (!bestMatch) return;
      if (bestMatch.dist > 2.0) return;

      const wallLength = getWallLength(room, bestMatch.wall.wallSide);
      let newPosition = bestMatch.t;

      const snapIncrement = 0.1 / wallLength;
      newPosition = Math.round(newPosition / snapIncrement) * snapIncrement;

      const windowWidthRatio = windowObj.width / wallLength;
      const halfWindowRatio = windowWidthRatio / 2;

      const minPos = halfWindowRatio;
      const maxPos = 1 - halfWindowRatio;

      if (minPos > maxPos) {
          newPosition = 0.5;
      } else {
          newPosition = Math.max(minPos, Math.min(maxPos, newPosition));
      }

      // Check overlaps on the NEW wallSide
      const doors = store.currentFloorplan?.doors.filter(d =>
          d.roomId === windowObj.roomId &&
          d.wallSide === bestMatch!.wall.wallSide
      ) || [];

      const siblings = store.currentFloorplan?.windows.filter(w =>
          w.roomId === windowObj.roomId &&
          w.wallSide === bestMatch!.wall.wallSide &&
          w.id !== windowObj.id
      ) || [];

      let overlap = false;

      const isOverlapping = (pos: number, width: number, otherPos: number, otherWidth: number) => {
          const myStart = (pos * wallLength) - (width / 2);
          const myEnd = (pos * wallLength) + (width / 2);
          const otherStart = (otherPos * wallLength) - (otherWidth / 2);
          const otherEnd = (otherPos * wallLength) + (otherWidth / 2);

          return (myStart < otherEnd && myEnd > otherStart);
      };

      for (const sibling of siblings) {
          if (isOverlapping(newPosition, windowObj.width, sibling.position, sibling.width)) {
              overlap = true;
              break;
          }
      }

      if (!overlap) {
          for (const door of doors) {
              if (isOverlapping(newPosition, windowObj.width, door.position, door.width)) {
                  overlap = true;
                  break;
              }
          }
      }

      if (!overlap) {
           updateWindow(windowObj.id, {
               wallSide: bestMatch.wall.wallSide,
               position: newPosition
           });
      }

  }, []);

  const handleGlobalMouseUp = useCallback((e: MouseEvent) => {
     setIsDragging(false);
     dragStartRef.current = null;
     draggedWindowIdRef.current = null;

     const store = useFloorplanStore.getState();

     if (startFloorplanRef.current && store.currentFloorplan) {
         const startWindow = startFloorplanRef.current.windows.find((w: Window) => w.id === draggedWindowIdRef.current);
         const endWindow = store.currentFloorplan.windows.find(w => w.id === draggedWindowIdRef.current);

         if (startWindow && endWindow && (startWindow.position !== endWindow.position || startWindow.wallSide !== endWindow.wallSide)) {
             pushState(startFloorplanRef.current);
         }
     }
     startFloorplanRef.current = null;

     document.removeEventListener('mousemove', handleGlobalMouseMove);
     document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [handleGlobalMouseMove, pushState]);

  const handleDragStart = useCallback((e: React.MouseEvent, windowId: string) => {
       if (e.button !== 0) return;
       e.stopPropagation();
       e.preventDefault();

       const store = useFloorplanStore.getState();
       const windowObj = store.getWindowById(windowId);
       if (!windowObj) return;

       setIsDragging(true);
       dragStartRef.current = { x: e.clientX, y: e.clientY };
       draggedWindowIdRef.current = windowId;

       if (store.currentFloorplan) {
           startFloorplanRef.current = store.currentFloorplan;
       }

       store.selectWindow(windowId);

       document.addEventListener('mousemove', handleGlobalMouseMove);
       document.addEventListener('mouseup', handleGlobalMouseUp);

  }, [handleGlobalMouseMove, handleGlobalMouseUp]);

  return {
    isDragging,
    handleDragStart
  };
};
