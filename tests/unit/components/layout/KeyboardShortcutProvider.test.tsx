import { render } from '@testing-library/react';
import { KeyboardShortcutProvider } from '@/components/layout/KeyboardShortcutProvider';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useUIStore } from '@/stores/uiStore';
import { useDialogStore } from '@/stores/dialogStore';
import { useRoomRotation } from '@/hooks/useRoomRotation';

jest.mock('@/hooks/useKeyboardShortcuts', () => ({
    useKeyboardShortcuts: jest.fn()
}));
jest.mock('@/stores/uiStore', () => ({
    useUIStore: jest.fn()
}));
jest.mock('@/stores/dialogStore', () => ({
    useDialogStore: jest.fn()
}));
jest.mock('@/hooks/useRoomRotation', () => ({
    useRoomRotation: jest.fn()
}));

describe('KeyboardShortcutProvider', () => {
  const mockToggleSidebar = jest.fn();
  const mockTogglePropertiesPanel = jest.fn();
  const mockToggleGrid = jest.fn();
  const mockZoomIn = jest.fn();
  const mockZoomOut = jest.fn();
  const mockOpenDialog = jest.fn();
  const mockRotateSelectedRoom = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useUIStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        toggleSidebar: mockToggleSidebar,
        togglePropertiesPanel: mockTogglePropertiesPanel,
        toggleGrid: mockToggleGrid,
        zoomIn: mockZoomIn,
        zoomOut: mockZoomOut,
      };
      return selector(state);
    });

    (useDialogStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
            openDialog: mockOpenDialog
        };
        return selector(state);
    });

    (useRoomRotation as unknown as jest.Mock).mockReturnValue({
        rotateSelectedRoom: mockRotateSelectedRoom
    });
  });

  it('registers keyboard shortcuts', () => {
    render(<KeyboardShortcutProvider />);

    expect(useKeyboardShortcuts).toHaveBeenCalledWith(
      expect.objectContaining({
        handlers: expect.objectContaining({
          TOGGLE_SIDEBAR: mockToggleSidebar,
          TOGGLE_PROPERTIES: mockTogglePropertiesPanel,
          TOGGLE_GRID: mockToggleGrid,
          ZOOM_IN: mockZoomIn,
          ZOOM_OUT: mockZoomOut,
          NEW_PROJECT: expect.any(Function),
          ROTATE_CW: expect.any(Function),
          ROTATE_CCW: expect.any(Function),
        }),
      })
    );
  });

  it('triggers dialog on NEW_PROJECT', () => {
    render(<KeyboardShortcutProvider />);
    const handlers = (useKeyboardShortcuts as unknown as jest.Mock).mock.calls[0][0].handlers;

    handlers.NEW_PROJECT();
    expect(mockOpenDialog).toHaveBeenCalledWith('newProject');
  });

  it('triggers rotation on ROTATE_CW/CCW', () => {
    render(<KeyboardShortcutProvider />);
    const handlers = (useKeyboardShortcuts as unknown as jest.Mock).mock.calls[0][0].handlers;

    handlers.ROTATE_CW();
    expect(mockRotateSelectedRoom).toHaveBeenCalledWith('cw');

    handlers.ROTATE_CCW();
    expect(mockRotateSelectedRoom).toHaveBeenCalledWith('ccw');
  });
});
