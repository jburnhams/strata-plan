import { useState, useCallback, useRef } from 'react';
import { useFloorplanStore } from '../stores/floorplanStore';
import { useHistoryStore } from '../stores/historyStore';
import { useUIStore } from '../stores/uiStore';
import { PIXELS_PER_METER } from '../constants/defaults';
import { Window } from '../types/window';

export const useWindowDrag = () => {
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const draggedWindowIdRef = useRef<string | null>(null);
  const initialPositionRef = useRef<number>(0);
  const startFloorplanRef = useRef<any>(null);

  const updateWindow = useFloorplanStore((state) => state.updateWindow);
  const pushState = useHistoryStore((state) => state.pushState);

  const zoomLevel = useUIStore((state) => state.zoomLevel);

  const stateRef = useRef({ zoomLevel, updateWindow });
  stateRef.current = { zoomLevel, updateWindow };

  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
      if (!dragStartRef.current || !draggedWindowIdRef.current) return;
      const { zoomLevel, updateWindow } = stateRef.current;

      const store = useFloorplanStore.getState();
      const windowObj = store.currentFloorplan?.windows.find(w => w.id === draggedWindowIdRef.current);
      if (!windowObj) return;

      const room = store.currentFloorplan?.rooms.find(r => r.id === windowObj.roomId);
      if (!room) return;

      let wallLength = 0;
      let isHorizontal = false;

      switch (windowObj.wallSide) {
          case 'north':
          case 'south':
              wallLength = room.width;
              isHorizontal = true;
              break;
          case 'east':
          case 'west':
              wallLength = room.length;
              isHorizontal = false;
              break;
      }

      const dxPixels = e.clientX - dragStartRef.current.x;
      const dyPixels = e.clientY - dragStartRef.current.y;
      const scale = PIXELS_PER_METER * zoomLevel;

      let deltaMeters = 0;
      if (isHorizontal) {
          deltaMeters = dxPixels / scale;
      } else {
          deltaMeters = dyPixels / scale;
      }

      const deltaRatio = deltaMeters / wallLength;
      let newPosition = initialPositionRef.current + deltaRatio;

      const snapIncrement = 0.1 / wallLength;
      newPosition = Math.round(newPosition / snapIncrement) * snapIncrement;

      const windowWidthRatio = windowObj.width / wallLength;
      const halfWindowRatio = windowWidthRatio / 2;

      const minPos = halfWindowRatio;
      const maxPos = 1 - halfWindowRatio;

      newPosition = Math.max(minPos, Math.min(maxPos, newPosition));

      // Overlap check
      const doors = store.currentFloorplan?.doors.filter(d =>
          d.roomId === windowObj.roomId &&
          d.wallSide === windowObj.wallSide
      ) || [];

      const siblings = store.currentFloorplan?.windows.filter(w =>
          w.roomId === windowObj.roomId &&
          w.wallSide === windowObj.wallSide &&
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
           updateWindow(windowObj.id, { position: newPosition });
      }

  }, []);

  const handleGlobalMouseUp = useCallback((e: MouseEvent) => {
     setIsDragging(false);
     dragStartRef.current = null;
     draggedWindowIdRef.current = null;
     initialPositionRef.current = 0;

     const store = useFloorplanStore.getState();

     if (startFloorplanRef.current && store.currentFloorplan) {
         const startWindow = startFloorplanRef.current.windows.find((w: Window) => w.id === draggedWindowIdRef.current);
         const endWindow = store.currentFloorplan.windows.find(w => w.id === draggedWindowIdRef.current);

         if (startWindow && endWindow && startWindow.position !== endWindow.position) {
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
       initialPositionRef.current = windowObj.position;

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
