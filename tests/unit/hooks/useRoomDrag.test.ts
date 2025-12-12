import { renderHook, act } from '@testing-library/react';
import { useRoomDrag } from '../../../src/hooks/useRoomDrag';
import { useFloorplanStore } from '../../../src/stores/floorplanStore';
import { useUIStore } from '../../../src/stores/uiStore';
import { useToast } from '../../../src/hooks/use-toast';
import { doRoomsOverlap } from '../../../src/services/geometry/room';

// Mock dependencies
jest.mock('../../../src/stores/floorplanStore');
jest.mock('../../../src/stores/uiStore');
jest.mock('../../../src/hooks/use-toast');
jest.mock('../../../src/services/geometry/room');

describe('useRoomDrag', () => {
  let mockUpdateRoom: jest.Mock;
  let mockSelectRoom: jest.Mock;
  let mockToast: jest.Mock;
  let mockDoRoomsOverlap: jest.Mock;

  const mockRoom = {
    id: 'room1',
    name: 'Room 1',
    position: { x: 0, z: 0 },
    length: 5,
    width: 4,
    rotation: 0
  };

  const mockRoom2 = {
    id: 'room2',
    name: 'Room 2',
    position: { x: 10, z: 0 },
    length: 5,
    width: 4,
    rotation: 0
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUpdateRoom = jest.fn();
    mockSelectRoom = jest.fn();
    mockToast = jest.fn();
    mockDoRoomsOverlap = (doRoomsOverlap as jest.Mock);

    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast
    });

    (useUIStore as unknown as jest.Mock).mockImplementation((selector) => {
        return selector({
            zoomLevel: 1.0,
            showGrid: true
        });
    });

    // Setup Store Mocks with getState support
    const storeState = {
        selectedRoomIds: ['room1'],
        currentFloorplan: {
            rooms: [mockRoom, mockRoom2],
            connections: []
        },
        updateRoom: mockUpdateRoom,
        selectRoom: mockSelectRoom,
    };

    (useFloorplanStore as unknown as jest.Mock).mockImplementation((selector) => {
        return selector(storeState);
    });

    // Mock getState
    (useFloorplanStore as unknown as any).getState = jest.fn().mockReturnValue(storeState);
  });

  it('should check for collisions on mouse up and show warning if overlapping', () => {
    const { result } = renderHook(() => useRoomDrag());

    // Start drag
    const mockEvent = {
      button: 0,
      clientX: 0,
      clientY: 0,
      stopPropagation: jest.fn(),
      preventDefault: jest.fn(),
    } as unknown as React.MouseEvent;

    act(() => {
        result.current.handleDragStart(mockEvent, 'room1');
    });

    // Mock overlap to be true
    mockDoRoomsOverlap.mockReturnValue(true);

    // End drag (trigger global mouse up)
    act(() => {
        const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });
        document.dispatchEvent(mouseUpEvent);
    });

    expect(mockDoRoomsOverlap).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith({
      title: "Rooms Overlapping",
      description: "Placement causes room overlap.",
      variant: "destructive"
    });
  });

  it('should not show warning if no overlap', () => {
    const { result } = renderHook(() => useRoomDrag());

    // Start drag
    const mockEvent = {
      button: 0,
      clientX: 0,
      clientY: 0,
      stopPropagation: jest.fn(),
      preventDefault: jest.fn(),
    } as unknown as React.MouseEvent;

    act(() => {
        result.current.handleDragStart(mockEvent, 'room1');
    });

    // Mock overlap to be false
    mockDoRoomsOverlap.mockReturnValue(false);

    // End drag
    act(() => {
        const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });
        document.dispatchEvent(mouseUpEvent);
    });

    expect(mockDoRoomsOverlap).toHaveBeenCalled();
    expect(mockToast).not.toHaveBeenCalled();
  });

});
