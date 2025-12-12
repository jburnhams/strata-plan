import { renderHook, act } from '@testing-library/react';
import { useRoomResize } from '../../../src/hooks/useRoomResize';
import { useFloorplanStore } from '../../../src/stores/floorplanStore';
import { useUIStore } from '../../../src/stores/uiStore';
import { Room } from '../../../src/types';

// Mock useToast
const mockToast = jest.fn();
jest.mock('../../../src/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

describe('useRoomResize', () => {
  const mockUpdateRoom = jest.fn();

  const initialRoom: Room = {
    id: 'room-1',
    name: 'Test Room',
    length: 5, // 5m
    width: 4,  // 4m
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
        name: 'Test Floorplan',
        units: 'meters',
        rooms: [initialRoom],
        connections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      updateRoom: mockUpdateRoom,
    });

    useUIStore.setState({
      zoomLevel: 1.0,
      showGrid: false
    });

    jest.clearAllMocks();
  });

  it('initializes with isResizing false', () => {
    const { result } = renderHook(() => useRoomResize());
    expect(result.current.isResizing).toBe(false);
    expect(result.current.resizingRoomId).toBeNull();
  });

  it('starts resizing on handleResizeStart', () => {
    const { result } = renderHook(() => useRoomResize());

    const event = {
        stopPropagation: jest.fn(),
        preventDefault: jest.fn(),
        clientX: 100,
        clientY: 100
    } as unknown as React.MouseEvent;

    act(() => {
        result.current.handleResizeStart(event, 'room-1', 'se');
    });

    expect(result.current.isResizing).toBe(true);
    expect(result.current.resizingRoomId).toBe('room-1');
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('resizes southeast corner correctly (length and width increase)', () => {
    const { result } = renderHook(() => useRoomResize());

    // Start resize
    const startEvent = {
        stopPropagation: jest.fn(),
        preventDefault: jest.fn(),
        clientX: 100,
        clientY: 100
    } as unknown as React.MouseEvent;

    act(() => {
        result.current.handleResizeStart(startEvent, 'room-1', 'se');
    });

    // Move mouse +50px X, +50px Y. Scale = 50 * 1 = 50px/m.
    // Should add 1m to length and width.
    const moveEvent = new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 150
    });

    act(() => {
        document.dispatchEvent(moveEvent);
    });

    expect(mockUpdateRoom).toHaveBeenCalledWith('room-1', expect.objectContaining({
        length: 6,
        width: 5,
        position: { x: 0, z: 0 }
    }));
  });

  it('resizes northwest corner correctly (position changes, length/width change)', () => {
    const { result } = renderHook(() => useRoomResize());

    // Start resize
    const startEvent = {
        stopPropagation: jest.fn(),
        preventDefault: jest.fn(),
        clientX: 100,
        clientY: 100
    } as unknown as React.MouseEvent;

    act(() => {
        result.current.handleResizeStart(startEvent, 'room-1', 'nw');
    });

    // Move mouse -50px X, -50px Y.
    // Should move position -1m, and increase length/width by 1m.
    const moveEvent = new MouseEvent('mousemove', {
        clientX: 50,
        clientY: 50
    });

    act(() => {
        document.dispatchEvent(moveEvent);
    });

    expect(mockUpdateRoom).toHaveBeenCalledWith('room-1', expect.objectContaining({
        length: 6,
        width: 5,
        position: { x: -1, z: -1 }
    }));
  });

  it('resizes east edge correctly (only length changes)', () => {
    const { result } = renderHook(() => useRoomResize());

    const startEvent = {
        stopPropagation: jest.fn(),
        preventDefault: jest.fn(),
        clientX: 100,
        clientY: 100
    } as unknown as React.MouseEvent;

    act(() => {
        result.current.handleResizeStart(startEvent, 'room-1', 'e');
    });

    // Move mouse +50px X, +50px Y (Y movement should be ignored for East handle)
    const moveEvent = new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 150
    });

    act(() => {
        document.dispatchEvent(moveEvent);
    });

    expect(mockUpdateRoom).toHaveBeenCalledWith('room-1', expect.objectContaining({
        length: 6,
        width: 4, // Unchanged
        position: { x: 0, z: 0 }
    }));
  });

  it('enforces minimum dimension constraints', () => {
    const { result } = renderHook(() => useRoomResize());

    const startEvent = {
        stopPropagation: jest.fn(),
        preventDefault: jest.fn(),
        clientX: 100,
        clientY: 100
    } as unknown as React.MouseEvent;

    act(() => {
        result.current.handleResizeStart(startEvent, 'room-1', 'w');
    });

    // Move mouse +400px X (Attempt to shrink length 5m by 8m -> -3m)
    // Should clamp at 0.1m length
    // Position should move by (Original Length - 0.1) = 4.9m
    const moveEvent = new MouseEvent('mousemove', {
        clientX: 500,
        clientY: 100
    });

    act(() => {
        document.dispatchEvent(moveEvent);
    });

    // min dimension is 0.1
    // expected length: 0.1
    // expected x: 0 + (5 - 0.1) = 4.9

    expect(mockUpdateRoom).toHaveBeenCalledWith('room-1', expect.objectContaining({
        length: 0.1,
        position: expect.objectContaining({ x: 4.9 })
    }));
  });

  it('snaps to grid when enabled', () => {
    useUIStore.setState({ showGrid: true });
    const { result } = renderHook(() => useRoomResize());

    const startEvent = {
        stopPropagation: jest.fn(),
        preventDefault: jest.fn(),
        clientX: 100,
        clientY: 100
    } as unknown as React.MouseEvent;

    act(() => {
        result.current.handleResizeStart(startEvent, 'room-1', 'e');
    });

    // Move mouse +10px (0.2m)
    // 50px/m * 0.2m = 10px.
    // New length would be 5.2m.
    // Grid is 0.5m. Nearest grid point for right edge (0+5.2=5.2) is 5.0 or 5.5?
    // 5.2 rounds to 5.0.

    // Let's move +15px (0.3m). Length 5.3m. End at 5.3. Round to 5.5.
    // 0.3m * 50 = 15px.
    const moveEvent = new MouseEvent('mousemove', {
        clientX: 115,
        clientY: 100
    });

    act(() => {
        document.dispatchEvent(moveEvent);
    });

    expect(mockUpdateRoom).toHaveBeenCalledWith('room-1', expect.objectContaining({
        length: 5.5
    }));
  });

  it('stops resizing on mouse up', () => {
    const { result } = renderHook(() => useRoomResize());

    const startEvent = {
        stopPropagation: jest.fn(),
        preventDefault: jest.fn(),
        clientX: 100,
        clientY: 100
    } as unknown as React.MouseEvent;

    act(() => {
        result.current.handleResizeStart(startEvent, 'room-1', 'se');
    });

    expect(result.current.isResizing).toBe(true);

    const upEvent = new MouseEvent('mouseup');
    act(() => {
        document.dispatchEvent(upEvent);
    });

    expect(result.current.isResizing).toBe(false);
    expect(result.current.resizingRoomId).toBeNull();
  });

  it('validates dimensions on mouse up and shows warning if unusual', () => {
    // Setup state so room is unusually large (e.g. 60m)
    // We can't easily trigger the drag to make it 60m here without lots of math
    // Instead we can just modify the store to simulate the "current" state
    // before the mouseup happens, because the hook reads from store on mouseup.

    // Mock the store to return an unusually large room
    useFloorplanStore.setState({
        currentFloorplan: {
            ...useFloorplanStore.getState().currentFloorplan!,
            rooms: [{ ...initialRoom, length: 60 }] // 60m > 50m warning
        }
    });

    const { result } = renderHook(() => useRoomResize());

    const startEvent = {
        stopPropagation: jest.fn(),
        preventDefault: jest.fn(),
        clientX: 100,
        clientY: 100
    } as unknown as React.MouseEvent;

    act(() => {
        result.current.handleResizeStart(startEvent, 'room-1', 'se');
    });

    // We don't need to move mouse, just fire mouseup,
    // it should check the *current* state in store (which we hacked to be 60m)

    const upEvent = new MouseEvent('mouseup');
    act(() => {
        document.dispatchEvent(upEvent);
    });

    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Note',
        description: expect.stringMatching(/unusually large/),
    }));
  });
});
