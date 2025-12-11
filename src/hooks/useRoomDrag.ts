import { useState, useCallback, useRef } from 'react';
import { useFloorplanStore } from '../stores/floorplanStore';
import { useUIStore } from '../stores/uiStore';
import { Position2D } from '../types';
import { PIXELS_PER_METER } from '../constants/defaults';

export const useRoomDrag = () => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const initialPositionsRef = useRef<Map<string, Position2D>>(new Map());

  const selectedRoomIds = useFloorplanStore((state) => state.selectedRoomIds);
  const updateRoom = useFloorplanStore((state) => state.updateRoom);
  const selectRoom = useFloorplanStore((state) => state.selectRoom);
  const currentFloorplan = useFloorplanStore((state) => state.currentFloorplan);

  const zoomLevel = useUIStore((state) => state.zoomLevel);
  const showGrid = useUIStore((state) => state.showGrid);
  // Default grid size is 0.5m (from defaults), but we might want to get it from store if configurable
  const gridSize = 0.5;

  const handleDragStart = useCallback((e: React.MouseEvent, roomId: string) => {
    // Only left click
    if (e.button !== 0) return;

    e.stopPropagation();
    e.preventDefault();

    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    // If dragging a room that is NOT in selection, select it (and deselect others)
    // If dragging a room in selection, keep selection
    let roomsToDragIds = selectedRoomIds;
    if (!selectedRoomIds.includes(roomId)) {
        selectRoom(roomId);
        roomsToDragIds = [roomId];
    }

    // Capture initial positions
    const initialMap = new Map<string, Position2D>();
    const rooms = currentFloorplan?.rooms || [];

    roomsToDragIds.forEach(id => {
        const room = rooms.find(r => r.id === id);
        if (room) {
            initialMap.set(id, { ...room.position });
        }
    });
    initialPositionsRef.current = initialMap;

    // Add global listeners
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
  }, [selectedRoomIds, currentFloorplan, selectRoom]);

  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (!dragStartRef.current) return;

    const dxPixels = e.clientX - dragStartRef.current.x;
    const dyPixels = e.clientY - dragStartRef.current.y;

    // Convert pixels to meters
    // delta_meters = delta_pixels / (PIXELS_PER_METER * zoomLevel)
    const scale = PIXELS_PER_METER * zoomLevel;
    const dxMeters = dxPixels / scale;
    const dyMeters = dyPixels / scale;

    initialPositionsRef.current.forEach((initialPos, roomId) => {
        let newX = initialPos.x + dxMeters;
        let newZ = initialPos.z + dyMeters;

        // Grid snapping
        if (showGrid) {
            newX = Math.round(newX / gridSize) * gridSize;
            newZ = Math.round(newZ / gridSize) * gridSize;
        }

        updateRoom(roomId, {
            position: { x: newX, z: newZ }
        });
    });

  }, [zoomLevel, showGrid, updateRoom]); // Dependencies might be stale if closure?
  // useCallback captures deps. document listener needs stable reference?
  // We use a ref for the listener so we can remove it.

  // The issue with useCallback here is that if zoomLevel changes during drag (unlikely but possible via wheel),
  // the listener attached to document is the OLD one.
  // Standard pattern: use a ref for the handler or use a persistent effect.
  // But since we add/remove on start/end, we just need to ensure the handler has access to fresh state.
  // Refs for state (zoomLevel, showGrid) or `useEvent` pattern.

  // For simplicity, let's use refs for the changing values needed inside the event handler
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
  }, []); // No deps, stable

  const handleGlobalMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
    initialPositionsRef.current.clear();

    document.removeEventListener('mousemove', handleGlobalMouseMoveStable);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [handleGlobalMouseMoveStable]);

  // We need to bind the stable handler in start
  const handleDragStartStable = useCallback((e: React.MouseEvent, roomId: string) => {
      // Re-implement start logic here to access stable move handler
       if (e.button !== 0) return;
       e.stopPropagation(); // Prevent canvas pan
       // Note: we don't preventDefault here if we want focus? But usually yes to prevent text selection.
       e.preventDefault();

       setIsDragging(true);
       dragStartRef.current = { x: e.clientX, y: e.clientY };

       // Access store state via getState to avoid deps?
       // We can rely on component re-render to update the closure of this function
       // IF we pass it down.
       // But wait, if I use `useCallback` with deps, it changes.
       // The event listener needs the exact function reference to remove it later.
       // `handleGlobalMouseUp` uses `handleGlobalMouseMoveStable`.

       // Logic for selection
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
       document.addEventListener('mouseup', handleGlobalMouseUp);

  }, [handleGlobalMouseMoveStable, handleGlobalMouseUp]);

  return {
    isDragging,
    handleDragStart: handleDragStartStable
  };
};
