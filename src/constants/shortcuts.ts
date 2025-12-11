export interface ShortcutDef {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  category: 'General' | 'Edit' | 'View' | 'Navigation';
}

export const SHORTCUTS: Record<string, ShortcutDef> = {
  NEW_PROJECT: { key: 'n', ctrl: true, description: 'New Project', category: 'General' },
  OPEN_PROJECT: { key: 'o', ctrl: true, description: 'Open Project', category: 'General' },
  SAVE: { key: 's', ctrl: true, description: 'Save Project', category: 'General' },
  UNDO: { key: 'z', ctrl: true, description: 'Undo', category: 'Edit' },
  REDO: { key: 'y', ctrl: true, description: 'Redo', category: 'Edit' },
  DELETE: { key: 'Delete', description: 'Delete Selection', category: 'Edit' },
  VIEW_TABLE: { key: '1', ctrl: true, description: 'Table View', category: 'View' },
  VIEW_2D: { key: '2', ctrl: true, description: '2D Editor', category: 'View' },
  VIEW_3D: { key: '3', ctrl: true, description: '3D Preview', category: 'View' },
  TOGGLE_GRID: { key: 'g', description: 'Toggle Grid', category: 'View' },
  ZOOM_IN: { key: '=', description: 'Zoom In', category: 'View' },
  ZOOM_OUT: { key: '-', description: 'Zoom Out', category: 'View' },
  ZOOM_FIT: { key: '0', description: 'Zoom to Fit', category: 'View' },
  ESCAPE: { key: 'Escape', description: 'Cancel / Deselect', category: 'General' },
  TOGGLE_SIDEBAR: { key: '[', description: 'Toggle Sidebar', category: 'View' },
  TOGGLE_PROPERTIES: { key: ']', description: 'Toggle Properties', category: 'View' },
  ROTATE_CW: { key: 'r', description: 'Rotate Clockwise', category: 'Edit' },
  ROTATE_CCW: { key: 'R', shift: true, description: 'Rotate Counter-Clockwise', category: 'Edit' },
};
