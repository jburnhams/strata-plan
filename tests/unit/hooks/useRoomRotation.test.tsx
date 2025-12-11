import { renderHook, act } from '@testing-library/react';
import { useRoomRotation } from '@/hooks/useRoomRotation';
import { useFloorplanStore } from '@/stores/floorplanStore';
import { useUIStore } from '@/stores/uiStore';
import { Room } from '@/types';

// Mock dependencies
jest.mock('@/stores/floorplanStore');
jest.mock('@/stores/uiStore');

describe('useRoomRotation', () => {
  const mockUpdateRoom = jest.fn();
  const mockGetRoomById = jest.fn();
  const mockGetSelectedRoom = jest.fn();
  const mockRoom: Room = {
    id: 'room-1',
    name: 'Test Room',
    width: 4,
    length: 5,
    height: 2.4,
    type: 'bedroom',
    position: { x: 0, z: 0 },
    rotation: 0,
    doors: [],
    windows: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup store mocks. The hook uses useFloorplanStore(selector) for some things and useFloorplanStore.getState() for others.
    // The implementation uses `useFloorplanStore((state) => state.updateRoom)` at the top level.
    // So we need to mock the implementation of the hook to return the mockUpdateRoom when the selector selects updateRoom.

    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        updateRoom: mockUpdateRoom,
        getSelectedRoom: mockGetSelectedRoom,
        getRoomById: mockGetRoomById,
      };
      return selector(state);
    });

    useFloorplanStore.getState = jest.fn().mockReturnValue({
      getRoomById: mockGetRoomById,
      updateRoom: mockUpdateRoom,
      getSelectedRoom: mockGetSelectedRoom,
    });

    (useUIStore as unknown as jest.Mock).mockReturnValue({
      zoomLevel: 1,
      panOffset: { x: 0, y: 0 },
    });

    mockGetRoomById.mockReturnValue(mockRoom);
    mockGetSelectedRoom.mockReturnValue(mockRoom);
  });

  describe('rotateSelectedRoom', () => {
    it('rotates clockwise correctly', () => {
      const { result } = renderHook(() => useRoomRotation());

      act(() => {
        result.current.rotateSelectedRoom('cw');
      });

      expect(mockUpdateRoom).toHaveBeenCalledWith('room-1', { rotation: 90 });
    });

    it('rotates counter-clockwise correctly', () => {
      const { result } = renderHook(() => useRoomRotation());

      act(() => {
        result.current.rotateSelectedRoom('ccw');
      });

      // 0 - 90 = -90 => 270
      expect(mockUpdateRoom).toHaveBeenCalledWith('room-1', { rotation: 270 });
    });

    it('cycles through 360 degrees', () => {
      mockGetSelectedRoom.mockReturnValue({ ...mockRoom, rotation: 270 });
      const { result } = renderHook(() => useRoomRotation());

      act(() => {
        result.current.rotateSelectedRoom('cw');
      });

      expect(mockUpdateRoom).toHaveBeenCalledWith('room-1', { rotation: 0 });
    });

    it('does nothing if no room selected', () => {
      mockGetSelectedRoom.mockReturnValue(null);
      const { result } = renderHook(() => useRoomRotation());

      act(() => {
        result.current.rotateSelectedRoom('cw');
      });

      expect(mockUpdateRoom).not.toHaveBeenCalled();
    });
  });

  describe('handleRotationStart', () => {
    it('starts rotation and adds event listeners', () => {
      const { result } = renderHook(() => useRoomRotation());
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        clientX: 100,
        clientY: 100,
      } as unknown as React.MouseEvent;

      const addListenerSpy = jest.spyOn(window, 'addEventListener');

      act(() => {
        result.current.handleRotationStart(mockEvent, 'room-1');
      });

      expect(result.current.isRotating).toBe(true);
      expect(addListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(addListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
    });

    // Testing the actual mousemove logic is tricky because it depends on DOM elements
    // and complex coordinate geometry which is hard to mock in jsdom without full SVG setup.
    // However, we can verifying the listeners are added/removed.

    it('cleans up listeners on mouseup', () => {
      const { result } = renderHook(() => useRoomRotation());
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      } as unknown as React.MouseEvent;

      const removeListenerSpy = jest.spyOn(window, 'removeEventListener');

      act(() => {
        result.current.handleRotationStart(mockEvent, 'room-1');
      });

      // Simulate mouseup
      const mouseupEvent = new MouseEvent('mouseup');
      act(() => {
        window.dispatchEvent(mouseupEvent);
      });

      expect(result.current.isRotating).toBe(false);
      expect(removeListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(removeListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
    });
  });
});
