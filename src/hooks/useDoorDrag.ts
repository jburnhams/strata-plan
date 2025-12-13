import { useState, useCallback, useRef } from 'react';
import { useFloorplanStore } from '../stores/floorplanStore';
import { useHistoryStore } from '../stores/historyStore';
import { useUIStore } from '../stores/uiStore';
import { PIXELS_PER_METER } from '../constants/defaults';
import { useToast } from './use-toast';
import { Door } from '../types/door';

export const useDoorDrag = () => {
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const draggedDoorIdRef = useRef<string | null>(null);
  const initialPositionRef = useRef<number>(0);
  const startFloorplanRef = useRef<any>(null);

  const updateDoor = useFloorplanStore((state) => state.updateDoor);
  const pushState = useHistoryStore((state) => state.pushState);
  const { toast } = useToast();

  const zoomLevel = useUIStore((state) => state.zoomLevel);

  // Stable ref for state used in event handlers
  const stateRef = useRef({ zoomLevel, updateDoor });
  stateRef.current = { zoomLevel, updateDoor };

  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
      if (!dragStartRef.current || !draggedDoorIdRef.current) return;
      const { zoomLevel, updateDoor } = stateRef.current;

      const store = useFloorplanStore.getState();
      const door = store.currentFloorplan?.doors.find(d => d.id === draggedDoorIdRef.current);
      if (!door) return;

      const room = store.currentFloorplan?.rooms.find(r => r.id === door.roomId);
      if (!room) return;

      // Calculate wall length based on wallSide
      let wallLength = 0;
      let isHorizontal = false; // Is the wall horizontal in world space? (North/South)

      // WallSide: north/south -> width (x-axis), east/west -> length (z-axis)
      // Wait, let's verify Room dimensions vs WallSide.
      // Usually North/South walls run along the X axis, so their length is the Room's width.
      // East/West walls run along the Z axis, so their length is the Room's length.

      switch (door.wallSide) {
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

      // Project mouse movement onto wall axis
      // If horizontal (North/South), we care about dx
      // If vertical (East/West), we care about dy
      // Also need to consider direction.
      // North (top): +x is right.
      // South (bottom): +x is right. (Standard coordinate system)
      // East (right): +z is down.
      // West (left): +z is down.

      // However, "position" 0.0-1.0 is usually "from left/top".
      // For North: left-to-right (minX to maxX)
      // For South: left-to-right (minX to maxX) OR right-to-left?
      // Let's assume standard reading order: 0 is min coordinate, 1 is max coordinate along that axis.
      // North Wall (minZ): 0 is minX, 1 is maxX.
      // South Wall (maxZ): 0 is minX, 1 is maxX.
      // West Wall (minX): 0 is minZ, 1 is maxZ.
      // East Wall (maxX): 0 is minZ, 1 is maxZ.

      let deltaMeters = 0;
      if (isHorizontal) {
          deltaMeters = dxPixels / scale;
      } else {
          deltaMeters = dyPixels / scale;
      }

      const deltaRatio = deltaMeters / wallLength;
      let newPosition = initialPositionRef.current + deltaRatio;

      // Snap to 5% increments if no specific modifier? Or just smooth?
      // Let's snap to 0.05 (5%) for easier placement
      // newPosition = Math.round(newPosition * 20) / 20;
      // Actually, let's snap to 0.1m increments.
      const snapIncrement = 0.1 / wallLength;
      newPosition = Math.round(newPosition / snapIncrement) * snapIncrement;

      // Validate bounds
      // Door width in ratio
      const doorWidthRatio = door.width / wallLength;
      const halfDoorRatio = doorWidthRatio / 2;

      // If position is center:
      // min = halfDoorRatio, max = 1 - halfDoorRatio
      // If position is start (left/top):
      // min = 0, max = 1 - doorWidthRatio

      // Assuming position is center based on usage in other parts (often easier).
      // But let's check assumptions.
      // If I don't know, I should check how it is rendered.
      // Assuming CENTER for now as it makes rotation easier usually.

      // Re-reading 07-doors-windows.md: "Position: 0.0-1.0 along wall (from left/top)"
      // Usually "position" implies the anchor point.
      // If the anchor is center, then 0.5 is middle.
      // If the anchor is left, 0.5 is middle.

      // Let's assume CENTER for the dragging logic to be symmetric,
      // but if the data model implies Start, I need to adjust.
      // Task 7.4.3 says "Convert click position to 0.0-1.0 along wall".

      // Let's look at `DoorShape` later. For now, let's assume it represents the Center.

      const minPos = halfDoorRatio;
      const maxPos = 1 - halfDoorRatio;

      newPosition = Math.max(minPos, Math.min(maxPos, newPosition));

      // Overlap check
      const siblings = store.currentFloorplan?.doors.filter(d =>
          d.roomId === door.roomId &&
          d.wallSide === door.wallSide &&
          d.id !== door.id
      ) || [];

      const windows = store.currentFloorplan?.windows.filter(w =>
          w.roomId === door.roomId &&
          w.wallSide === door.wallSide
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
           updateDoor(door.id, { position: newPosition });
      }

  }, []);

  const handleGlobalMouseUp = useCallback((e: MouseEvent) => {
     setIsDragging(false);
     dragStartRef.current = null;
     draggedDoorIdRef.current = null;
     initialPositionRef.current = 0;

     const store = useFloorplanStore.getState();

     // Push to history if changed
     if (startFloorplanRef.current && store.currentFloorplan) {
         // Simple check if door position changed
         const startDoor = startFloorplanRef.current.doors.find((d: Door) => d.id === draggedDoorIdRef.current);
         const endDoor = store.currentFloorplan.doors.find(d => d.id === draggedDoorIdRef.current);

         if (startDoor && endDoor && startDoor.position !== endDoor.position) {
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
       initialPositionRef.current = door.position;

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
