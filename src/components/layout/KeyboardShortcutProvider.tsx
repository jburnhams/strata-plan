import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useUIStore } from '@/stores/uiStore';
import { useDialogStore } from '@/stores/dialogStore';
import { useRoomRotation } from '@/hooks/useRoomRotation';
import { useHistoryStore } from '@/stores/historyStore';
import { saveNow } from '@/services/storage/saveOperations';
import { useToast } from '@/hooks/use-toast';
import { useFloorplanStore } from '@/stores/floorplanStore';
import { useCallback } from 'react';

export function KeyboardShortcutProvider() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const togglePropertiesPanel = useUIStore((state) => state.togglePropertiesPanel);
  const toggleGrid = useUIStore((state) => state.toggleGrid);
  const zoomIn = useUIStore((state) => state.zoomIn);
  const zoomOut = useUIStore((state) => state.zoomOut);
  const setMode = useUIStore((state) => state.setMode);

  const openDialog = useDialogStore((state) => state.openDialog);
  const undo = useHistoryStore((state) => state.undo);
  const redo = useHistoryStore((state) => state.redo);
  const { toast } = useToast();

  // Retrieve current floorplan from store state directly when saving
  // We use getState() inside the callback to avoid re-renders on every floorplan change

  const { rotateSelectedRoom } = useRoomRotation();

  const handleSave = useCallback(async () => {
      const floorplan = useFloorplanStore.getState().currentFloorplan;

      if (!floorplan) {
           toast({
              title: "No project open",
              description: "There is no active project to save.",
              variant: "destructive"
          });
          return;
      }

      try {
          await saveNow(floorplan);
          toast({
              title: "Project saved",
              description: "Your changes have been saved successfully.",
          });
      } catch (error) {
          console.error("Save failed", error);
          toast({
              title: "Save failed",
              description: "There was an error saving your project.",
              variant: "destructive"
          });
      }
  }, [toast]);

  useKeyboardShortcuts({
    handlers: {
      NEW_PROJECT: () => openDialog('newProject'),
      OPEN_PROJECT: () => console.log('Open Project triggered'),
      SAVE: handleSave,
      UNDO: undo,
      REDO: redo,
      DELETE: () => console.log('Delete triggered'),
      VIEW_TABLE: () => setMode('table'),
      VIEW_2D: () => setMode('canvas'),
      VIEW_3D: () => setMode('view3d'),
      TOGGLE_GRID: toggleGrid,
      ZOOM_IN: zoomIn,
      ZOOM_OUT: zoomOut,
      ZOOM_FIT: () => console.log('Zoom Fit triggered'),
      ESCAPE: () => console.log('Escape triggered'),
      TOGGLE_SIDEBAR: toggleSidebar,
      TOGGLE_PROPERTIES: togglePropertiesPanel,
      ROTATE_CW: () => rotateSelectedRoom('cw'),
      ROTATE_CCW: () => rotateSelectedRoom('ccw'),
    }
  });

  return null;
}
