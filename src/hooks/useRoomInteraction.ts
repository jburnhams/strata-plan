import { useCallback } from 'react';
import { useFloorplanStore } from '../stores/floorplanStore';
import { useUIStore } from '../stores/uiStore';

export const useRoomInteraction = () => {
  const selectRoom = useFloorplanStore((state) => state.selectRoom);
  const clearSelection = useFloorplanStore((state) => state.clearSelection);
  const editorMode = useFloorplanStore((state) => state.editorMode);

  // Handle click on the canvas background
  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    // Only clear if we are in select mode (implied for now)
    // and if the click was not stopped by a room (propagation)

    // In React, if we put this on the container, bubbles will reach here.
    // RoomShape stops propagation. So if we get here, it's a background click.

    // Check if dragging (simple check: if we just panned, don't deselect)
    // This logic is usually handled by keeping track of mouse down pos vs up pos.
    // For now, let's assume a pure click.

    // NOTE: CanvasViewport handles dragging for pan. We need to distinguish pan vs click.
    // CanvasViewport might not call onClick if it decided it was a drag.

    clearSelection();
  }, [clearSelection]);

  return {
    handleBackgroundClick
  };
};
