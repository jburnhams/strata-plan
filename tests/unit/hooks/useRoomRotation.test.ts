import { renderHook, act } from '@testing-library/react';
import { useRoomRotation } from '../../../src/hooks/useRoomRotation';
import { useFloorplanStore } from '../../../src/stores/floorplanStore';
import { useUIStore } from '../../../src/stores/uiStore';
import { getRoomCenter } from '../../../src/services/geometry/room';

// Mock dependencies
jest.mock('../../../src/stores/floorplanStore', () => ({
  useFloorplanStore: jest.fn(),
}));

jest.mock('../../../src/stores/uiStore', () => ({
  useUIStore: jest.fn(),
}));

jest.mock('../../../src/services/geometry/room', () => ({
  getRoomCenter: jest.fn(),
}));

describe('useRoomRotation', () => {
  const mockUpdateRoom = jest.fn();
  const mockGetRoomById = jest.fn();
  const mockGetSelectedRoom = jest.fn();

  const mockZoomLevel = 1;
  const mockPanOffset = { x: 0, z: 0 };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Floorplan Store
    const floorplanStoreMock = jest.fn((selector) => {
        const state = {
          updateRoom: mockUpdateRoom,
        };
        // @ts-ignore
        if (typeof selector === 'function') {
            return selector(state);
        }
        return state;
      });

    // Attach getState to the mock function itself
    // @ts-ignore
    floorplanStoreMock.getState = jest.fn(() => ({
      getRoomById: mockGetRoomById,
      getSelectedRoom: mockGetSelectedRoom,
    }));

    (useFloorplanStore as unknown as jest.Mock).mockImplementation(floorplanStoreMock);
    // Also mock the direct property access if any
    (useFloorplanStore as any).getState = floorplanStoreMock.getState;

    // Mock UI Store
    const uiStoreMock = (selector) => {
      const state = {
        zoomLevel: mockZoomLevel,
        panOffset: mockPanOffset,
      };
      // @ts-ignore
      if (typeof selector === 'function') {
          return selector(state);
      }
      return state;
    };
    (useUIStore as unknown as jest.Mock).mockImplementation(uiStoreMock);

    // Mock document.querySelector for canvas-svg
    const mockRect = {
        width: 1000,
        height: 1000,
        left: 0,
        top: 0,
        right: 1000,
        bottom: 1000,
        x: 0,
        y: 0,
        toJSON: () => {}
    };

    jest.spyOn(document, 'querySelector').mockReturnValue({
        getBoundingClientRect: () => mockRect,
    } as unknown as Element);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('rotateSelectedRoom cw rotates 90 degrees clockwise', () => {
    const { result } = renderHook(() => useRoomRotation());

    const mockRoom = { id: 'room1', rotation: 0 };
    mockGetSelectedRoom.mockReturnValue(mockRoom);

    act(() => {
      result.current.rotateSelectedRoom('cw');
    });

    expect(mockUpdateRoom).toHaveBeenCalledWith('room1', { rotation: 90 });
  });

  it('rotateSelectedRoom cw rotates 90 degrees clockwise from 270 to 0', () => {
    const { result } = renderHook(() => useRoomRotation());

    const mockRoom = { id: 'room1', rotation: 270 };
    mockGetSelectedRoom.mockReturnValue(mockRoom);

    act(() => {
      result.current.rotateSelectedRoom('cw');
    });

    expect(mockUpdateRoom).toHaveBeenCalledWith('room1', { rotation: 0 });
  });

  it('rotateSelectedRoom ccw rotates 90 degrees counter-clockwise', () => {
    const { result } = renderHook(() => useRoomRotation());

    const mockRoom = { id: 'room1', rotation: 90 };
    mockGetSelectedRoom.mockReturnValue(mockRoom);

    act(() => {
      result.current.rotateSelectedRoom('ccw');
    });

    expect(mockUpdateRoom).toHaveBeenCalledWith('room1', { rotation: 0 });
  });

  it('rotateSelectedRoom ccw rotates 90 degrees counter-clockwise from 0 to 270', () => {
    const { result } = renderHook(() => useRoomRotation());

    const mockRoom = { id: 'room1', rotation: 0 };
    mockGetSelectedRoom.mockReturnValue(mockRoom);

    act(() => {
      result.current.rotateSelectedRoom('ccw');
    });

    expect(mockUpdateRoom).toHaveBeenCalledWith('room1', { rotation: 270 });
  });

  it('handleRotationStart initiates rotation and updates on mouse move', () => {
    const { result } = renderHook(() => useRoomRotation());

    const mockRoom = { id: 'room1', rotation: 0 };
    mockGetRoomById.mockReturnValue(mockRoom);
    (getRoomCenter as unknown as jest.Mock).mockReturnValue({ x: 0, z: 0 }); // Center at (0,0) world

    const e = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.handleRotationStart(e, 'room1');
    });

    expect(result.current.isRotating).toBe(true);

    // Simulate mouse move to (100, 0) relative to center.
    // Center of screen is (500, 500) (1000/2).
    // World (0,0) maps to Screen (500, 500).
    // We want dx=100, dy=0. So mouse at (600, 500).
    // angle = atan2(0, 100) = 0.
    // Rotation logic: angle + 90 = 90.
    // Should snap to 90.

    const moveEvent = new MouseEvent('mousemove', {
      clientX: 600,
      clientY: 500,
    });

    act(() => {
      window.dispatchEvent(moveEvent);
    });

    expect(mockUpdateRoom).toHaveBeenCalledWith('room1', { rotation: 90 });

    // Move to (500, 400). dx=0, dy=-100.
    // atan2(-100, 0) = -PI/2 = -90 deg.
    // Rotation = -90 + 90 = 0.
    // Should snap to 0.

    const moveEvent2 = new MouseEvent('mousemove', {
        clientX: 500,
        clientY: 400,
    });

    act(() => {
        window.dispatchEvent(moveEvent2);
    });

    expect(mockUpdateRoom).toHaveBeenCalledWith('room1', { rotation: 0 });

    // End rotation
    const upEvent = new MouseEvent('mouseup');
    act(() => {
      window.dispatchEvent(upEvent);
    });

    expect(result.current.isRotating).toBe(false);
  });
});
