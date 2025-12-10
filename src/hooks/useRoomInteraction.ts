import { useState, useRef, useEffect, useCallback } from 'react';
import { useFloorplanStore } from '../stores/floorplanStore';
import { useUIStore } from '../stores/uiStore';
import { screenToWorld } from '../utils/coordinates';
import { getRoomBounds } from '../services/geometry/room';
import { BoundingBox, Position2D } from '../types';

type InteractionMode = 'idle' | 'box_selecting' | 'room_dragging';

export function useRoomInteraction(
  viewportSize: { width: number; height: number },
  canvasRef: React.RefObject<HTMLDivElement>
) {
  const {
    currentFloorplan,
    selectRoom,
    setRoomSelection,
    selectedRoomIds,
    clearSelection
  } = useFloorplanStore();

  const { zoomLevel, panOffset } = useUIStore();

  const [mode, setMode] = useState<InteractionMode>('idle');
  const [selectionBox, setSelectionBox] = useState<BoundingBox | null>(null);

  // Refs to track drag state without re-renders
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const activeRoomIdRef = useRef<string | null>(null);

  // Helper to get mouse position relative to canvas
  const getMousePos = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, [canvasRef]);

  // Start Box Selection (Container Mouse Down)
  const onContainerMouseDown = useCallback((e: React.MouseEvent) => {
    // Only Left Click
    if (e.button !== 0) return;

    // Ignore if Alt is pressed (Pan)
    if (e.altKey) return;

    e.preventDefault();
    startPosRef.current = getMousePos(e);
    isDraggingRef.current = false;
    activeRoomIdRef.current = null;

    setMode('box_selecting');

    // Deselect if not holding shift/ctrl
    if (!e.shiftKey && !e.ctrlKey) {
        clearSelection();
    }
  }, [getMousePos, clearSelection]);

  // Start Room Interaction (Room Mouse Down)
  const onRoomMouseDown = useCallback((e: React.MouseEvent, roomId: string) => {
    if (e.button !== 0) return;

    e.stopPropagation(); // Stop bubbling to container
    e.preventDefault();

    startPosRef.current = getMousePos(e);
    isDraggingRef.current = false;
    activeRoomIdRef.current = roomId;

    setMode('room_dragging');

    // Note: We don't select immediately on down.
    // We wait for Up (Click) or Move (Drag).
    // But for visual feedback, we might want to select on down?
    // Standard behavior: Select on down. Drag on move.
    // If modifier keys, we handle logic.

    const isSelected = selectedRoomIds.includes(roomId);

    if (!e.shiftKey && !e.ctrlKey && !isSelected) {
        // If clicking an unselected room without modifiers, select it immediately
        // (and deselect others)
        selectRoom(roomId);
    }
  }, [getMousePos, selectedRoomIds, selectRoom]);

  // Global Move
  const onMouseMove = useCallback((e: MouseEvent) => {
    if (mode === 'idle' || !startPosRef.current) return;

    const currentPos = getMousePos(e);
    const dx = currentPos.x - startPosRef.current.x;
    const dy = currentPos.y - startPosRef.current.y;

    // Check drag threshold
    if (!isDraggingRef.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        isDraggingRef.current = true;
    }

    if (mode === 'box_selecting' && isDraggingRef.current) {
        // Calculate selection box in World Coordinates
        const transform = {
            zoom: zoomLevel,
            pan: panOffset,
            width: viewportSize.width,
            height: viewportSize.height
        };

        const startWorld = screenToWorld(startPosRef.current.x, startPosRef.current.y, transform);
        const currWorld = screenToWorld(currentPos.x, currentPos.y, transform);

        const minX = Math.min(startWorld.x, currWorld.x);
        const maxX = Math.max(startWorld.x, currWorld.x);
        const minZ = Math.min(startWorld.z, currWorld.z);
        const maxZ = Math.max(startWorld.z, currWorld.z);

        setSelectionBox({ minX, maxX, minZ, maxZ });
    }

    // TODO: Handle room dragging

  }, [mode, zoomLevel, panOffset, viewportSize, getMousePos]);

  // Global Up
  const onMouseUp = useCallback((e: MouseEvent) => {
    if (mode === 'idle') return;

    // Handle Click (no drag)
    if (!isDraggingRef.current) {
        if (mode === 'room_dragging' && activeRoomIdRef.current) {
            // Room Click Logic
            const roomId = activeRoomIdRef.current;
            const isSelected = selectedRoomIds.includes(roomId);

            if (e.ctrlKey) {
                // Toggle
                if (isSelected) {
                    setRoomSelection(selectedRoomIds.filter(id => id !== roomId));
                } else {
                    setRoomSelection([...selectedRoomIds, roomId]);
                }
            } else if (e.shiftKey) {
                // Add
                if (!isSelected) {
                    setRoomSelection([...selectedRoomIds, roomId]);
                }
            } else {
                // Select (already done on down for unselected, but if we clicked a selected one to deselect others?)
                // If we clicked a selected room and didn't drag, we should ensure only this room is selected
                // (unless we were preparing to drag multiple)
                selectRoom(roomId);
            }
        }
        // Container Click handled implicitly by onContainerMouseDown clearing selection
    } else {
        // Handle Drag End
        if (mode === 'box_selecting' && selectionBox && currentFloorplan) {
            // Commit Box Selection
            const hitRoomIds: string[] = [];
            currentFloorplan.rooms.forEach(room => {
                const roomBounds = getRoomBounds(room);
                // Check AABB overlap
                const overlap = (
                    selectionBox.minX < roomBounds.maxX &&
                    selectionBox.maxX > roomBounds.minX &&
                    selectionBox.minZ < roomBounds.maxZ &&
                    selectionBox.maxZ > roomBounds.minZ
                );

                if (overlap) {
                    hitRoomIds.push(room.id);
                }
            });

            if (e.shiftKey) {
                // Add unique
                const newSelection = Array.from(new Set([...selectedRoomIds, ...hitRoomIds]));
                setRoomSelection(newSelection);
            } else {
                setRoomSelection(hitRoomIds);
            }
        }
    }

    // Reset
    setMode('idle');
    setSelectionBox(null);
    startPosRef.current = null;
    isDraggingRef.current = false;
    activeRoomIdRef.current = null;

  }, [mode, selectionBox, currentFloorplan, selectedRoomIds, selectRoom, setRoomSelection]);

  // Attach global listeners
  useEffect(() => {
    if (mode !== 'idle') {
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }
  }, [mode, onMouseMove, onMouseUp]);

  return {
    onContainerMouseDown,
    onRoomMouseDown,
    selectionBox,
    mode
  };
}
