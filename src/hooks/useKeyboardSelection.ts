import { useEffect, useCallback } from 'react';
import { useFloorplanStore } from '../stores/floorplanStore';
import { useToolStore } from '../stores/toolStore';
import { useUIStore } from '../stores/uiStore';

export const useKeyboardSelection = () => {
  const selectedRoomIds = useFloorplanStore((state) => state.selectedRoomIds);
  const getSelectedRooms = useFloorplanStore((state) => state.getSelectedRooms);
  const updateRoom = useFloorplanStore((state) => state.updateRoom);
  const deleteRoom = useFloorplanStore((state) => state.deleteRoom);
  const clearSelection = useFloorplanStore((state) => state.clearSelection);
  const activeTool = useToolStore((state) => state.activeTool);
  const gridSize = useUIStore((state) => state.gridSize);
  const snapEnabled = useUIStore((state) => state.snapToGrid);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if input/textarea is focused
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    // Escape always clears selection
    if (e.key === 'Escape') {
      clearSelection();
      return;
    }

    // Only process other keys if we have a selection
    if (selectedRoomIds.length === 0) return;

    // Delete selected rooms
    if (e.key === 'Delete' || e.key === 'Backspace') {
      // Create a copy of ids to iterate as deleteRoom might modify the selection state
      // (though it probably shouldn't trigger side effects that break this loop if we just iterate the list)
      [...selectedRoomIds].forEach(id => {
        deleteRoom(id);
      });
      return;
    }

    // Movement only allowed in Select tool
    if (activeTool !== 'select') return;

    let dx = 0;
    let dz = 0;

    // Determine step size
    // Default to 0.1m (10cm) or grid size if snap is on?
    // Let's use 0.1m for fine control, and grid size (default 0.5m) for Shift
    // OR: use grid size if snap is on.

    let step = 0.1;
    if (snapEnabled) {
       step = gridSize;
    }

    // If Shift is held, move faster (e.g. 1m or 5x step)
    if (e.shiftKey) {
        step *= 5; // e.g. 0.5m -> 2.5m, or 0.1m -> 0.5m
    }

    // We can also use exact grid snapping logic, but relative movement is usually expected for arrow keys.
    // If we want to SNAP to the grid, we need to calculate the new position and round it.
    // But arrow keys usually imply "nudge". Let's stick to nudge for now.

    switch (e.key) {
      case 'ArrowUp':
        dz = -step;
        break;
      case 'ArrowDown':
        dz = step;
        break;
      case 'ArrowLeft':
        dx = -step;
        break;
      case 'ArrowRight':
        dx = step;
        break;
      default:
        return;
    }

    if (dx !== 0 || dz !== 0) {
      e.preventDefault(); // Prevent scrolling
      const selectedRooms = getSelectedRooms();

      selectedRooms.forEach(room => {
        let newX = room.position.x + dx;
        let newZ = room.position.z + dz;

        // If snapping is enabled, we might want to ensure we land on a grid point?
        // Or just move by grid increment (which we did by setting step = gridSize).
        // However, floating point errors can accumulate.
        // Let's rely on the step being the grid size for now.

        updateRoom(room.id, {
          position: {
            x: newX,
            z: newZ
          }
        });
      });
    }

  }, [selectedRoomIds, activeTool, deleteRoom, clearSelection, updateRoom, getSelectedRooms, gridSize, snapEnabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
