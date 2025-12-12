import { useState, useCallback, useRef } from 'react';
import { useFloorplanStore } from '../stores/floorplanStore';
import { useUIStore } from '../stores/uiStore';
import { Room } from '../types';
import { PIXELS_PER_METER } from '../constants/defaults';
import { useToast } from './use-toast';
import { validateRoomDimension } from '../utils/validation';

export type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export const useRoomResize = () => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizingRoomId, setResizingRoomId] = useState<string | null>(null);

  const resizeStartRef = useRef<{ x: number; y: number } | null>(null);
  const initialRoomRef = useRef<Room | null>(null);
  const activeHandleRef = useRef<ResizeHandle | null>(null);

  const updateRoom = useFloorplanStore((state) => state.updateRoom);
  // Note: We don't subscribe to currentFloorplan here to avoid re-renders on every update
  // We access it via getState() when needed or via refs/callbacks
  const zoomLevel = useUIStore((state) => state.zoomLevel);
  const showGrid = useUIStore((state) => state.showGrid);
  const { toast } = useToast();

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

    if (showGrid) {
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

    const isAlt = e.altKey;
    const isShift = e.shiftKey;

    let deltaL = 0;
    let deltaW = 0;

    if (handle.includes('e')) deltaL += dxMeters;
    if (handle.includes('w')) deltaL -= dxMeters;
    if (handle.includes('s')) deltaW += dyMeters;
    if (handle.includes('n')) deltaW -= dyMeters;

    if (isAlt) {
        deltaL *= 2;
        deltaW *= 2;
    }

    let newLength = initialRoom.length + deltaL;
    let newWidth = initialRoom.width + deltaW;

    if (isShift) {
        const ratio = initialRoom.width / initialRoom.length;
        const isCorner = handle.length === 2;
        const isEdge = !isCorner;

        if (isCorner) {
            if (Math.abs(dxMeters) > Math.abs(dyMeters)) {
                newWidth = newLength * ratio;
            } else {
                newLength = newWidth / ratio;
            }
        } else if (isEdge) {
            if (handle.includes('e') || handle.includes('w')) {
                newWidth = newLength * ratio;
            } else {
                newLength = newWidth / ratio;
            }
        }
    }

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

    let newX = initialRoom.position.x;
    let newZ = initialRoom.position.z;

    if (isAlt) {
        const centerX = initialRoom.position.x + initialRoom.length / 2;
        const centerZ = initialRoom.position.z + initialRoom.width / 2;

        newX = centerX - newLength / 2;
        newZ = centerZ - newWidth / 2;
    } else {
        if (handle.includes('w')) {
            const right = initialRoom.position.x + initialRoom.length;
            newX = right - newLength;
        } else if (handle.includes('e')) {
            newX = initialRoom.position.x;
        } else {
            if (isShift && (handle === 'n' || handle === 's')) {
                 const centerX = initialRoom.position.x + initialRoom.length / 2;
                 newX = centerX - newLength / 2;
            }
        }

        if (handle.includes('n')) {
            const bottom = initialRoom.position.z + initialRoom.width;
            newZ = bottom - newWidth;
        } else if (handle.includes('s')) {
            newZ = initialRoom.position.z;
        } else {
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
    // Validate on completion
    if (initialRoomRef.current) {
        const roomId = initialRoomRef.current.id;
        const currentRoom = useFloorplanStore.getState().currentFloorplan?.rooms.find(r => r.id === roomId);

        if (currentRoom) {
            const lRes = validateRoomDimension(currentRoom.length, 'Length');
            const wRes = validateRoomDimension(currentRoom.width, 'Width');

            if (lRes.warning) {
                toast({ title: 'Note', description: lRes.warning, variant: 'default' });
            }
            if (wRes.warning) {
                toast({ title: 'Note', description: wRes.warning, variant: 'default' });
            }
        }
    }

    setIsResizing(false);
    setResizingRoomId(null);
    resizeStartRef.current = null;
    initialRoomRef.current = null;
    activeHandleRef.current = null;

    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [handleGlobalMouseMove, toast]);

  const handleResizeStart = useCallback((e: React.MouseEvent, roomId: string, handle: ResizeHandle) => {
    e.stopPropagation();
    e.preventDefault();

    const store = useFloorplanStore.getState();
    const room = store.currentFloorplan?.rooms.find(r => r.id === roomId);
    if (!room) return;

    setIsResizing(true);
    setResizingRoomId(roomId);
    resizeStartRef.current = { x: e.clientX, y: e.clientY };
    initialRoomRef.current = { ...room };
    activeHandleRef.current = handle;

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
  }, [handleGlobalMouseMove, handleGlobalMouseUp]);

  return {
    isResizing,
    resizingRoomId,
    handleResizeStart
  };
};
