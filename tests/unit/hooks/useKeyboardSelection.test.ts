import { renderHook, act } from '@testing-library/react';
import { useKeyboardSelection } from '../../../src/hooks/useKeyboardSelection';
import { useFloorplanStore } from '../../../src/stores/floorplanStore';
import { useToolStore } from '../../../src/stores/toolStore';
import { useUIStore } from '../../../src/stores/uiStore';
import { Room } from '../../../src/types';

describe('useKeyboardSelection', () => {
  const mockDeleteRoom = jest.fn();
  const mockUpdateRoom = jest.fn();
  const mockClearSelection = jest.fn();
  const mockDeleteWall = jest.fn();

  const room: Room = {
    id: 'room-1',
    name: 'Room 1',
    length: 5,
    width: 4,
    height: 3,
    type: 'living',
    position: { x: 0, z: 0 },
    doors: [],
    windows: []
  };

  beforeEach(() => {
    useFloorplanStore.setState({
      currentFloorplan: {
        id: 'fp-1',
        name: 'Test',
        units: 'meters',
        rooms: [room],
        connections: [],
        walls: [], // Will set if needed
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      selectedRoomIds: [],
      selectedWallId: null,
      deleteRoom: mockDeleteRoom,
      updateRoom: mockUpdateRoom,
      clearSelection: mockClearSelection,
      deleteWall: mockDeleteWall
    });

    useToolStore.setState({ activeTool: 'select' });
    useUIStore.setState({ gridSize: 0.5, snapToGrid: true });

    jest.clearAllMocks();
  });

  it('should clear selection on Escape', () => {
    renderHook(() => useKeyboardSelection());

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(mockClearSelection).toHaveBeenCalled();
  });

  it('should delete selected rooms on Delete', () => {
    useFloorplanStore.setState({ selectedRoomIds: ['room-1'] });
    renderHook(() => useKeyboardSelection());

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }));
    });

    expect(mockDeleteRoom).toHaveBeenCalledWith('room-1');
  });

  it('should delete selected rooms on Backspace', () => {
    useFloorplanStore.setState({ selectedRoomIds: ['room-1'] });
    renderHook(() => useKeyboardSelection());

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
    });

    expect(mockDeleteRoom).toHaveBeenCalledWith('room-1');
  });

  it('should delete selected wall on Delete', () => {
    useFloorplanStore.setState({ selectedWallId: 'w1' });
    renderHook(() => useKeyboardSelection());

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }));
    });

    expect(mockDeleteWall).toHaveBeenCalledWith('w1');
  });

  it('should move room with Arrow keys when snap is enabled', () => {
    useFloorplanStore.setState({ selectedRoomIds: ['room-1'] });
    renderHook(() => useKeyboardSelection());

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    });

    // Grid size is 0.5
    expect(mockUpdateRoom).toHaveBeenCalledWith('room-1', {
      position: { x: 0.5, z: 0 }
    });
  });

  it('should move room with Arrow keys when snap is disabled', () => {
    useFloorplanStore.setState({ selectedRoomIds: ['room-1'] });
    useUIStore.setState({ snapToGrid: false });
    renderHook(() => useKeyboardSelection());

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    });

    // Step is 0.1
    expect(mockUpdateRoom).toHaveBeenCalledWith('room-1', {
      position: { x: 0.1, z: 0 }
    });
  });

  it('should move room faster with Shift key', () => {
    useFloorplanStore.setState({ selectedRoomIds: ['room-1'] });
    useUIStore.setState({ snapToGrid: false });
    renderHook(() => useKeyboardSelection());

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true }));
    });

    // Step 0.1 * 5 = 0.5
    expect(mockUpdateRoom).toHaveBeenCalledWith('room-1', {
      position: { x: 0.5, z: 0 }
    });
  });

  it('should not move room if not in select tool', () => {
    useFloorplanStore.setState({ selectedRoomIds: ['room-1'] });
    useToolStore.setState({ activeTool: 'pan' });
    renderHook(() => useKeyboardSelection());

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    });

    expect(mockUpdateRoom).not.toHaveBeenCalled();
  });

  it('should not respond if input is focused', () => {
    useFloorplanStore.setState({ selectedRoomIds: ['room-1'] });
    renderHook(() => useKeyboardSelection());

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    // We need to dispatch event to the input or handle the target check in test
    // JSDOM events bubble, so dispatching to window works, BUT the `e.target` will be window if not specified?
    // Actually we can dispatch to input directly.
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
      input.dispatchEvent(event);
    });

    expect(mockUpdateRoom).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it('should handle multi-selection deletion', () => {
    useFloorplanStore.setState({ selectedRoomIds: ['room-1', 'room-2'] });
    renderHook(() => useKeyboardSelection());

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }));
    });

    expect(mockDeleteRoom).toHaveBeenCalledTimes(2);
    expect(mockDeleteRoom).toHaveBeenCalledWith('room-1');
    expect(mockDeleteRoom).toHaveBeenCalledWith('room-2');
  });

  it('should handle multi-selection movement', () => {
      const room2 = { ...room, id: 'room-2', position: { x: 10, z: 10 } };
      useFloorplanStore.setState({
          currentFloorplan: {
             ...useFloorplanStore.getState().currentFloorplan!,
             rooms: [room, room2]
          },
          selectedRoomIds: ['room-1', 'room-2']
      });
      renderHook(() => useKeyboardSelection());

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      });

      // Grid 0.5
      expect(mockUpdateRoom).toHaveBeenCalledWith('room-1', { position: { x: 0, z: 0.5 } });
      expect(mockUpdateRoom).toHaveBeenCalledWith('room-2', { position: { x: 10, z: 10.5 } });
  });
});
