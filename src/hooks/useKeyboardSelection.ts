import { useEffect, useCallback } from 'react';
import { useFloorplanStore } from '../stores/floorplanStore';
import { useToolStore } from '../stores/toolStore';
import { useUIStore } from '../stores/uiStore';

export const useKeyboardSelection = () => {
  const selectedRoomIds = useFloorplanStore((state) => state.selectedRoomIds);
  const selectedWallId = useFloorplanStore((state) => state.selectedWallId);
  const getSelectedRooms = useFloorplanStore((state) => state.getSelectedRooms);
  const updateRoom = useFloorplanStore((state) => state.updateRoom);
  const deleteRoom = useFloorplanStore((state) => state.deleteRoom);
  const deleteWall = useFloorplanStore((state) => state.deleteWall);
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

    // Delete selected items
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedRoomIds.length > 0) {
        [...selectedRoomIds].forEach(id => {
            deleteRoom(id);
        });
      }

      if (selectedWallId) {
          deleteWall(selectedWallId);
      }

      return;
    }

    // Movement only allowed in Select tool
    if (activeTool !== 'select') return;

    // Only move rooms for now
    if (selectedRoomIds.length === 0) return;

    let dx = 0;
    let dz = 0;
    let step = 0.1;
    if (snapEnabled) {
       step = gridSize;
    }
    if (e.shiftKey) {
        step *= 5;
    }

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
      e.preventDefault();
      const selectedRooms = getSelectedRooms();

      selectedRooms.forEach(room => {
        let newX = room.position.x + dx;
        let newZ = room.position.z + dz;

        updateRoom(room.id, {
          position: {
            x: newX,
            z: newZ
          }
        });
      });
    }

  }, [selectedRoomIds, selectedWallId, activeTool, deleteRoom, deleteWall, clearSelection, updateRoom, getSelectedRooms, gridSize, snapEnabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
