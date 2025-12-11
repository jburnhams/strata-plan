import { useState, useCallback, useRef } from 'react';
import { useFloorplanStore } from '../stores/floorplanStore';
import { useUIStore } from '../stores/uiStore';
import { Room } from '../types';
import { PIXELS_PER_METER } from '../constants/defaults';

export type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export const useRoomResize = () => {
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef<{ x: number; y: number } | null>(null);
  const initialRoomRef = useRef<Room | null>(null);
  const activeHandleRef = useRef<ResizeHandle | null>(null);

  const updateRoom = useFloorplanStore((state) => state.updateRoom);
  const currentFloorplan = useFloorplanStore((state) => state.currentFloorplan);
  const zoomLevel = useUIStore((state) => state.zoomLevel);
  const showGrid = useUIStore((state) => state.showGrid);
  const gridSize = 0.5; // Could be moved to store/constants

  const MIN_DIMENSION = 0.1;
  const MAX_DIMENSION = 100.0;

  // Stable state ref for event handlers
  const stateRef = useRef({ zoomLevel, showGrid, updateRoom });
  stateRef.current = { zoomLevel, showGrid, updateRoom };

  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (!resizeStartRef.current || !initialRoomRef.current || !activeHandleRef.current) return;

    const { zoomLevel, showGrid, updateRoom } = stateRef.current;

    const dxPixels = e.clientX - resizeStartRef.current.x;
    const dyPixels = e.clientY - resizeStartRef.current.y;

    const scale = PIXELS_PER_METER * zoomLevel;
    const dxMeters = dxPixels / scale;
    const dyMeters = dyPixels / scale;

    const initialRoom = initialRoomRef.current;
    const handle = activeHandleRef.current;

    let newX = initialRoom.position.x;
    let newZ = initialRoom.position.z;
    let newLength = initialRoom.length;
    let newWidth = initialRoom.width;

    // Calculate raw new dimensions based on handle
    if (handle.includes('e')) {
      newLength = initialRoom.length + dxMeters;
    }
    if (handle.includes('w')) {
      newLength = initialRoom.length - dxMeters;
      newX = initialRoom.position.x + dxMeters;
    }
    if (handle.includes('s')) {
      newWidth = initialRoom.width + dyMeters;
    }
    if (handle.includes('n')) {
      newWidth = initialRoom.width - dyMeters;
      newZ = initialRoom.position.z + dyMeters;
    }

    // Apply grid snapping to position if grid enabled
    // Note: If we snap position, we must adjust length/width to keep other edge fixed?
    // Actually, usually we snap the *moving edge* to the grid.

    if (showGrid) {
      // Calculate world coordinate of moving edges
      let rightEdge = newX + newLength;
      let bottomEdge = newZ + newWidth;
      let leftEdge = newX;
      let topEdge = newZ;

      if (handle.includes('e')) {
        rightEdge = Math.round(rightEdge / gridSize) * gridSize;
        newLength = rightEdge - newX;
      }
      if (handle.includes('w')) {
        leftEdge = Math.round(leftEdge / gridSize) * gridSize;
        const diff = leftEdge - newX; // shift amount
        newX = leftEdge;
        newLength = newLength - diff;
      }
      if (handle.includes('s')) {
        bottomEdge = Math.round(bottomEdge / gridSize) * gridSize;
        newWidth = bottomEdge - newZ;
      }
      if (handle.includes('n')) {
        topEdge = Math.round(topEdge / gridSize) * gridSize;
        const diff = topEdge - newZ;
        newZ = topEdge;
        newWidth = newWidth - diff;
      }
    }

    // Apply min/max constraints
    // If w/n (moving origin), we need to cap change so it doesn't flip or go too small

    // Length constraints
    if (newLength < MIN_DIMENSION) {
      if (handle.includes('w')) {
        // If left edge moving right, stop it at min width from right edge
        newX = (initialRoom.position.x + initialRoom.length) - MIN_DIMENSION;
      }
      newLength = MIN_DIMENSION;
    } else if (newLength > MAX_DIMENSION) {
       if (handle.includes('w')) {
         newX = (initialRoom.position.x + initialRoom.length) - MAX_DIMENSION;
       }
       newLength = MAX_DIMENSION;
    }

    // Width constraints
    if (newWidth < MIN_DIMENSION) {
      if (handle.includes('n')) {
         newZ = (initialRoom.position.z + initialRoom.width) - MIN_DIMENSION;
      }
      newWidth = MIN_DIMENSION;
    } else if (newWidth > MAX_DIMENSION) {
      if (handle.includes('n')) {
        newZ = (initialRoom.position.z + initialRoom.width) - MAX_DIMENSION;
      }
      newWidth = MAX_DIMENSION;
    }

    updateRoom(initialRoom.id, {
      position: { x: newX, z: newZ },
      length: newLength,
      width: newWidth
    });

  }, []);

  const handleGlobalMouseUp = useCallback(() => {
    setIsResizing(false);
    resizeStartRef.current = null;
    initialRoomRef.current = null;
    activeHandleRef.current = null;

    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [handleGlobalMouseMove]);

  const handleResizeStart = useCallback((e: React.MouseEvent, roomId: string, handle: ResizeHandle) => {
    e.stopPropagation();
    e.preventDefault();

    const store = useFloorplanStore.getState();
    const room = store.currentFloorplan?.rooms.find(r => r.id === roomId);
    if (!room) return;

    setIsResizing(true);
    resizeStartRef.current = { x: e.clientX, y: e.clientY };
    initialRoomRef.current = { ...room };
    activeHandleRef.current = handle;

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
  }, [handleGlobalMouseMove, handleGlobalMouseUp]);

  return {
    isResizing,
    handleResizeStart
  };
};
