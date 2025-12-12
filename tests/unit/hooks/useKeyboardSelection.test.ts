import { renderHook, act } from '@testing-library/react';
import { useKeyboardSelection } from '../../../src/hooks/useKeyboardSelection';
import { useFloorplanStore } from '../../../src/stores/floorplanStore';
import { useToolStore } from '../../../src/stores/toolStore';
import { useUIStore } from '../../../src/stores/uiStore';

// Mock dependencies
jest.mock('../../../src/stores/floorplanStore');
jest.mock('../../../src/stores/toolStore');
jest.mock('../../../src/stores/uiStore');

describe('useKeyboardSelection', () => {
  let mockDeleteRoom: jest.Mock;
  let mockClearSelection: jest.Mock;
  let mockUpdateRoom: jest.Mock;
  let mockGetSelectedRooms: jest.Mock;
  let mockRoom: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDeleteRoom = jest.fn();
    mockClearSelection = jest.fn();
    mockUpdateRoom = jest.fn();
    mockRoom = { id: 'room1', position: { x: 0, z: 0 } };
    mockGetSelectedRooms = jest.fn().mockReturnValue([mockRoom]);

    // Setup Store Mocks
    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        selectedRoomIds: ['room1'],
        getSelectedRooms: mockGetSelectedRooms,
        deleteRoom: mockDeleteRoom,
        clearSelection: mockClearSelection,
        updateRoom: mockUpdateRoom,
      };
      return selector(state);
    });

    (useToolStore as unknown as jest.Mock).mockImplementation((selector) => {
        return selector({ activeTool: 'select' });
    });

    (useUIStore as unknown as jest.Mock).mockImplementation((selector) => {
        return selector({ gridSize: 0.5, snapToGrid: true });
    });
  });

  const fireKeyDown = (key: string, options: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, ...options });
    window.dispatchEvent(event);
  };

  it('should clear selection on Escape', () => {
    renderHook(() => useKeyboardSelection());
    fireKeyDown('Escape');
    expect(mockClearSelection).toHaveBeenCalled();
  });

  it('should delete selected rooms on Delete', () => {
    renderHook(() => useKeyboardSelection());
    fireKeyDown('Delete');
    expect(mockDeleteRoom).toHaveBeenCalledWith('room1');
  });

  it('should delete selected rooms on Backspace', () => {
    renderHook(() => useKeyboardSelection());
    fireKeyDown('Backspace');
    expect(mockDeleteRoom).toHaveBeenCalledWith('room1');
  });

  it('should move room with Arrow keys when snap is enabled', () => {
    renderHook(() => useKeyboardSelection());
    fireKeyDown('ArrowRight');
    // Default grid size is 0.5, snap enabled
    expect(mockUpdateRoom).toHaveBeenCalledWith('room1', { position: { x: 0.5, z: 0 } });
  });

  it('should move room with Arrow keys when snap is disabled', () => {
     (useUIStore as unknown as jest.Mock).mockImplementation((selector) => {
        return selector({ gridSize: 0.5, snapToGrid: false });
    });

    renderHook(() => useKeyboardSelection());
    fireKeyDown('ArrowRight');
    // Default step 0.1
    expect(mockUpdateRoom).toHaveBeenCalledWith('room1', { position: { x: 0.1, z: 0 } });
  });

  it('should move room faster with Shift key', () => {
    renderHook(() => useKeyboardSelection());
    fireKeyDown('ArrowRight', { shiftKey: true });
    // Grid size 0.5 * 5 = 2.5
    expect(mockUpdateRoom).toHaveBeenCalledWith('room1', { position: { x: 2.5, z: 0 } });
  });

  it('should not move room if not in select tool', () => {
    (useToolStore as unknown as jest.Mock).mockImplementation((selector) => {
        return selector({ activeTool: 'wall' });
    });

    renderHook(() => useKeyboardSelection());
    fireKeyDown('ArrowRight');
    expect(mockUpdateRoom).not.toHaveBeenCalled();
  });

  it('should not respond if input is focused', () => {
    renderHook(() => useKeyboardSelection());

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    // We need to dispatch the event to the input, but our listener is on window.
    // The hook checks e.target.
    // In JSDOM, dispatching to window sets target to window.
    // We need to dispatch to the input so it bubbles to window.

    const event = new KeyboardEvent('keydown', { key: 'Delete', bubbles: true });
    input.dispatchEvent(event);

    expect(mockDeleteRoom).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it('should handle multi-selection deletion', () => {
      (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        selectedRoomIds: ['room1', 'room2'],
        getSelectedRooms: mockGetSelectedRooms,
        deleteRoom: mockDeleteRoom,
        clearSelection: mockClearSelection,
        updateRoom: mockUpdateRoom,
      };
      return selector(state);
    });

    renderHook(() => useKeyboardSelection());
    fireKeyDown('Delete');
    expect(mockDeleteRoom).toHaveBeenCalledTimes(2);
    expect(mockDeleteRoom).toHaveBeenCalledWith('room1');
    expect(mockDeleteRoom).toHaveBeenCalledWith('room2');
  });

  it('should handle multi-selection movement', () => {
      const room2 = { id: 'room2', position: { x: 10, z: 10 } };
      mockGetSelectedRooms.mockReturnValue([mockRoom, room2]);

      (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        selectedRoomIds: ['room1', 'room2'],
        getSelectedRooms: mockGetSelectedRooms,
        deleteRoom: mockDeleteRoom,
        clearSelection: mockClearSelection,
        updateRoom: mockUpdateRoom,
      };
      return selector(state);
    });

    renderHook(() => useKeyboardSelection());
    fireKeyDown('ArrowDown');
    // Grid size 0.5
    expect(mockUpdateRoom).toHaveBeenCalledWith('room1', { position: { x: 0, z: 0.5 } });
    expect(mockUpdateRoom).toHaveBeenCalledWith('room2', { position: { x: 10, z: 10.5 } });
  });

});
