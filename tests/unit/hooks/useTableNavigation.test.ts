import { renderHook, act } from '@testing-library/react';
import { useTableNavigation } from '../../../src/hooks/useTableNavigation';
import { Room } from '../../../src/types';

describe('useTableNavigation', () => {
  const mockRooms: Room[] = [
    { id: '1', name: 'Room 1', length: 4, width: 4, height: 2.7, type: 'bedroom', position: { x: 0, z: 0 }, rotation: 0 },
    { id: '2', name: 'Room 2', length: 3, width: 3, height: 2.7, type: 'kitchen', position: { x: 0, z: 0 }, rotation: 0 },
  ];

  const onAddRoom = jest.fn();
  const onDeleteRoom = jest.fn();

  it('initializes with no focus', () => {
    const { result } = renderHook(() => useTableNavigation({ rooms: mockRooms, onAddRoom, onDeleteRoom }));
    expect(result.current.focusedCell).toBeNull();
  });

  it('moves focus on Tab', () => {
    const { result } = renderHook(() => useTableNavigation({ rooms: mockRooms, onAddRoom, onDeleteRoom }));

    act(() => {
      result.current.setFocusedCell({ roomId: '1', colIndex: 0 });
    });

    act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Tab' });
        window.dispatchEvent(event);
    });

    expect(result.current.focusedCell).toEqual({ roomId: '1', colIndex: 1 });
  });

  it('moves to next row on Tab at end of row', () => {
    const { result } = renderHook(() => useTableNavigation({ rooms: mockRooms, onAddRoom, onDeleteRoom }));

    act(() => {
      result.current.setFocusedCell({ roomId: '1', colIndex: 4 }); // Last editable col
    });

    act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Tab' });
        window.dispatchEvent(event);
    });

    expect(result.current.focusedCell).toEqual({ roomId: '2', colIndex: 0 });
  });

  it('moves focus on Shift+Tab', () => {
    const { result } = renderHook(() => useTableNavigation({ rooms: mockRooms, onAddRoom, onDeleteRoom }));

    act(() => {
      result.current.setFocusedCell({ roomId: '1', colIndex: 1 });
    });

    act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
        window.dispatchEvent(event);
    });

    expect(result.current.focusedCell).toEqual({ roomId: '1', colIndex: 0 });
  });

  it('moves to previous row on Shift+Tab at start of row', () => {
    const { result } = renderHook(() => useTableNavigation({ rooms: mockRooms, onAddRoom, onDeleteRoom }));

    act(() => {
      result.current.setFocusedCell({ roomId: '2', colIndex: 0 });
    });

    act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
        window.dispatchEvent(event);
    });

    expect(result.current.focusedCell).toEqual({ roomId: '1', colIndex: 4 });
  });

  it('moves up/down with Arrow keys', () => {
    const { result } = renderHook(() => useTableNavigation({ rooms: mockRooms, onAddRoom, onDeleteRoom }));

    act(() => {
      result.current.setFocusedCell({ roomId: '1', colIndex: 0 });
    });

    act(() => {
        const eventDown = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        window.dispatchEvent(eventDown);
    });
    expect(result.current.focusedCell).toEqual({ roomId: '2', colIndex: 0 });

    act(() => {
        const eventUp = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        window.dispatchEvent(eventUp);
    });
    expect(result.current.focusedCell).toEqual({ roomId: '1', colIndex: 0 });
  });

  it('Enter moves to next row same column', () => {
    const { result } = renderHook(() => useTableNavigation({ rooms: mockRooms, onAddRoom, onDeleteRoom }));

    act(() => {
      result.current.setFocusedCell({ roomId: '1', colIndex: 1 });
    });

    act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        window.dispatchEvent(event);
    });

    expect(result.current.focusedCell).toEqual({ roomId: '2', colIndex: 1 });
  });

  it('Enter on last row triggers add room', () => {
    const { result } = renderHook(() => useTableNavigation({ rooms: mockRooms, onAddRoom, onDeleteRoom }));

    act(() => {
      result.current.setFocusedCell({ roomId: '2', colIndex: 1 });
    });

    act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        window.dispatchEvent(event);
    });

    expect(onAddRoom).toHaveBeenCalled();
  });

  it('Ctrl+Enter triggers add room', () => {
    const { result } = renderHook(() => useTableNavigation({ rooms: mockRooms, onAddRoom, onDeleteRoom }));

    act(() => {
        result.current.setFocusedCell({ roomId: '1', colIndex: 0 });
    });

    act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true });
        window.dispatchEvent(event);
    });

    expect(onAddRoom).toHaveBeenCalled();
  });
});
