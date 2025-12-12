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
    const initialRoom = initialRoomRef.current;
    const handle = activeHandleRef.current;

    const dxPixels = e.clientX - resizeStartRef.current.x;
    const dyPixels = e.clientY - resizeStartRef.current.y;

    const scale = PIXELS_PER_METER * zoomLevel;
    let dxMeters = dxPixels / scale;
    let dyMeters = dyPixels / scale;

    // Grid snapping logic (simplified: snap the delta or the resulting edge?)
    // Existing logic snapped the resulting edge coordinate.
    // Let's stick to calculating target edge and snapping it, then deriving dx/dy.

    if (showGrid) {
        // Calculate where the handle *would* be
        // Only apply to primary axes involved in handle
        // E.g. 'e' involves x. 's' involves z. 'se' involves both.

        let targetX = handle.includes('e') ? initialRoom.position.x + initialRoom.length + dxMeters :
                      handle.includes('w') ? initialRoom.position.x + dxMeters : null;

        let targetZ = handle.includes('s') ? initialRoom.position.z + initialRoom.width + dyMeters :
                      handle.includes('n') ? initialRoom.position.z + dyMeters : null;

        if (targetX !== null) {
            const snappedX = Math.round(targetX / gridSize) * gridSize;
            const diffX = snappedX - targetX;
            dxMeters += diffX;
        }

        if (targetZ !== null) {
            const snappedZ = Math.round(targetZ / gridSize) * gridSize;
            const diffZ = snappedZ - targetZ;
            dyMeters += diffZ;
        }
    }

    // Logic for Dimensions
    const isAlt = e.altKey;
    const isShift = e.shiftKey;

    let deltaL = 0;
    let deltaW = 0;

    // Calculate raw deltas based on handle
    if (handle.includes('e')) deltaL += dxMeters;
    if (handle.includes('w')) deltaL -= dxMeters;
    if (handle.includes('s')) deltaW += dyMeters;
    if (handle.includes('n')) deltaW -= dyMeters;

    // Apply Alt (Center Resize)
    if (isAlt) {
        deltaL *= 2;
        deltaW *= 2;
    }

    let newLength = initialRoom.length + deltaL;
    let newWidth = initialRoom.width + deltaW;

    // Apply Shift (Proportional)
    if (isShift) {
        const ratio = initialRoom.width / initialRoom.length;

        const isCorner = handle.length === 2; // ne, nw, se, sw
        const isEdge = !isCorner;

        if (isCorner) {
            // Use dominant change
            // Compare absolute deltas? Or relative deltas?
            // Usually absolute mouse movement.
            // But dxMeters and dyMeters might be conflicting signs.
            // Let's check which dimension changed more relative to its size? Or just absolute?
            // "hold shift to maintain aspect ratio".
            // Typically driven by the axis with largest movement.
            if (Math.abs(dxMeters) > Math.abs(dyMeters)) {
                // Drive by Length
                newWidth = newLength * ratio;
            } else {
                // Drive by Width
                newLength = newWidth / ratio;
            }
        } else if (isEdge) {
            if (handle.includes('e') || handle.includes('w')) {
                // Driving Length
                newWidth = newLength * ratio;
            } else {
                // Driving Width
                newLength = newWidth / ratio;
            }
        }
    }

    // Constraints
    if (newLength < MIN_DIMENSION) {
        newLength = MIN_DIMENSION;
        if (isShift) newWidth = newLength * (initialRoom.width / initialRoom.length);
    } else if (newLength > MAX_DIMENSION) {
        newLength = MAX_DIMENSION;
        if (isShift) newWidth = newLength * (initialRoom.width / initialRoom.length);
    }

    if (newWidth < MIN_DIMENSION) {
        newWidth = MIN_DIMENSION;
        if (isShift) newLength = newWidth / (initialRoom.width / initialRoom.length);
    } else if (newWidth > MAX_DIMENSION) {
        newWidth = MAX_DIMENSION;
        if (isShift) newLength = newWidth / (initialRoom.width / initialRoom.length);
    }

    // Calculate Position
    let newX = initialRoom.position.x;
    let newZ = initialRoom.position.z;

    if (isAlt) {
        // Center Resize: Center stays fixed
        const centerX = initialRoom.position.x + initialRoom.length / 2;
        const centerZ = initialRoom.position.z + initialRoom.width / 2;

        newX = centerX - newLength / 2;
        newZ = centerZ - newWidth / 2;
    } else {
        // Normal Resize (Anchor opposite side)

        // Horizontal Logic
        if (handle.includes('w')) {
            // Anchor is Right (East)
            const right = initialRoom.position.x + initialRoom.length;
            newX = right - newLength;
        } else if (handle.includes('e')) {
            // Anchor is Left (West) - Default x
            newX = initialRoom.position.x;
        } else {
            // Handle n or s (no x change normally)
            // BUT if Shift is active on n/s edge, Width drives Length.
            // Length expands symmetrically.
            if (isShift && (handle === 'n' || handle === 's')) {
                 const centerX = initialRoom.position.x + initialRoom.length / 2;
                 newX = centerX - newLength / 2;
            }
        }

        // Vertical Logic
        if (handle.includes('n')) {
            // Anchor is Bottom (South)
            const bottom = initialRoom.position.z + initialRoom.width;
            newZ = bottom - newWidth;
        } else if (handle.includes('s')) {
            // Anchor is Top (North) - Default z
            newZ = initialRoom.position.z;
        } else {
            // Handle e or w
            // If Shift is active on e/w edge, Length drives Width.
            // Width expands symmetrically.
            if (isShift && (handle === 'e' || handle === 'w')) {
                const centerZ = initialRoom.position.z + initialRoom.width / 2;
                newZ = centerZ - newWidth / 2;
            }
        }
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
