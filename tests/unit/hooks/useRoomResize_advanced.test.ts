import { renderHook, act } from '@testing-library/react';
import { useRoomResize } from '../../../src/hooks/useRoomResize';
import { useFloorplanStore } from '../../../src/stores/floorplanStore';
import { useUIStore } from '../../../src/stores/uiStore';
import { Room } from '../../../src/types';

describe('useRoomResize Advanced', () => {
  const mockUpdateRoom = jest.fn();

  const initialRoom: Room = {
    id: 'room-1',
    name: 'Test Room',
    length: 4,
    width: 3,
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
        version: '1.0.0'
      },
      updateRoom: mockUpdateRoom,
    });

    useUIStore.setState({
      zoomLevel: 1.0,
      showGrid: false
    });

    jest.clearAllMocks();
  });

  it('maintains aspect ratio when holding Shift (Proportional Resize) on corner', () => {
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

    // Initial: 4m x 3m (Ratio 4/3 = 1.333)
    // Move mouse +50px X (1m). Y doesn't move.
    // If proportional, width should update to match new length's ratio.
    // New Length = 5m.
    // New Width should be 5 * (3/4) = 3.75m.
    // Mouse movement in Y is 0, but forced by constraint.

    const moveEvent = new MouseEvent('mousemove', {
        clientX: 150, // +50px = +1m
        clientY: 100, // +0px
        shiftKey: true
    });

    act(() => {
        document.dispatchEvent(moveEvent);
    });

    expect(mockUpdateRoom).toHaveBeenCalledWith('room-1', expect.objectContaining({
        length: 5,
        width: 3.75,
        position: { x: 0, z: 0 }
    }));
  });

  it('resizes from center when holding Alt (Center Resize) on edge', () => {
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

    // Initial: x=0, len=4. Center x=2.
    // Move mouse +50px X (1m).
    // Alt key held.
    // Right edge moves +1m -> x=5 relative to origin?
    // Effectively, we want the room to grow by 2m (1m each side).
    // New Length = 4 + 2*1 = 6m.
    // New X = 0 - 1 = -1.
    // Center remains at 2. (-1 + 6/2 = 2).

    const moveEvent = new MouseEvent('mousemove', {
        clientX: 150, // +1m
        clientY: 100,
        altKey: true
    });

    act(() => {
        document.dispatchEvent(moveEvent);
    });

    expect(mockUpdateRoom).toHaveBeenCalledWith('room-1', expect.objectContaining({
        length: 6,
        width: 3, // Unchanged
        position: { x: -1, z: 0 }
    }));
  });

  it('combines Shift and Alt (Proportional + Center)', () => {
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

    // Initial: 4m x 3m. Center 2, 1.5.
    // Move mouse +1m X.
    // Shift: Ratio maintained.
    // Alt: From Center.

    // X change +1m.
    // Effective X change is double?
    // Center logic: deltaX applies to edge. Right edge moves +1m. Left edge moves -1m. Total width change +2m.
    // New Length = 6m.
    // New Width must match ratio 3/4.
    // New Width = 6 * 0.75 = 4.5m.
    // New Height delta = 1.5m.
    // Center stays fixed.
    // Old Center: (2, 1.5).
    // New Pos X: 2 - 6/2 = -1.
    // New Pos Z: 1.5 - 4.5/2 = 1.5 - 2.25 = -0.75.

    const moveEvent = new MouseEvent('mousemove', {
        clientX: 150, // +1m X
        clientY: 100, // 0m Y (ignored/calculated)
        shiftKey: true,
        altKey: true
    });

    act(() => {
        document.dispatchEvent(moveEvent);
    });

    expect(mockUpdateRoom).toHaveBeenCalledWith('room-1', expect.objectContaining({
        length: 6,
        width: 4.5,
        position: { x: -1, z: -0.75 }
    }));
  });
});
