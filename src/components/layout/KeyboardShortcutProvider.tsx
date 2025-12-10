import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useUIStore } from '@/stores/uiStore';
import { useDialogStore } from '@/stores/dialogStore';
import { useFloorplanStore } from '@/stores/floorplanStore';

export function KeyboardShortcutProvider() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const togglePropertiesPanel = useUIStore((state) => state.togglePropertiesPanel);
  const toggleGrid = useUIStore((state) => state.toggleGrid);
  const zoomIn = useUIStore((state) => state.zoomIn);
  const zoomOut = useUIStore((state) => state.zoomOut);

  const openDialog = useDialogStore((state) => state.openDialog);

  const {
      selectedRoomIds,
      deleteRoom,
      clearSelection
  } = useFloorplanStore();

  useKeyboardShortcuts({
    handlers: {
      NEW_PROJECT: () => openDialog('newProject'),
      OPEN_PROJECT: () => console.log('Open Project triggered'),
      SAVE: () => console.log('Save triggered'),
      UNDO: () => console.log('Undo triggered'),
      REDO: () => console.log('Redo triggered'),
      DELETE: () => {
          if (selectedRoomIds.length > 0) {
              // Create a copy to avoid issues if state updates during iteration
              [...selectedRoomIds].forEach(id => deleteRoom(id));
          }
      },
      VIEW_TABLE: () => console.log('View Table triggered'),
      VIEW_2D: () => console.log('View 2D triggered'),
      VIEW_3D: () => console.log('View 3D triggered'),
      TOGGLE_GRID: toggleGrid,
      ZOOM_IN: zoomIn,
      ZOOM_OUT: zoomOut,
      ZOOM_FIT: () => console.log('Zoom Fit triggered'),
      ESCAPE: () => clearSelection(),
      TOGGLE_SIDEBAR: toggleSidebar,
      TOGGLE_PROPERTIES: togglePropertiesPanel,
    }
  });

  return null;
}
