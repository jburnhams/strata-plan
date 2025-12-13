import { renderHook, act } from '@testing-library/react';
import { useDoorDrag } from '../../../src/hooks/useDoorDrag';
import { useFloorplanStore } from '../../../src/stores/floorplanStore';
import { useHistoryStore } from '../../../src/stores/historyStore';
import { useUIStore } from '../../../src/stores/uiStore';
import { mockDoor, mockRoom } from '../../utils/mockData';
import { createEvent, fireEvent } from '@testing-library/dom';
import { PIXELS_PER_METER } from '../../../src/constants/defaults';

// Mock dependencies
jest.mock('../../../src/stores/floorplanStore');
jest.mock('../../../src/stores/historyStore');
jest.mock('../../../src/stores/uiStore');
jest.mock('../../../src/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() }),
}));

describe('useDoorDrag', () => {
  let mockUpdateDoor: jest.Mock;
  let mockSelectDoor: jest.Mock;
  let mockPushState: jest.Mock;

  const roomId = 'room-1';
  const doorId = 'door-1';

  const room = {
    ...mockRoom(),
    id: roomId,
    width: 4,  // 4 meters wide
    length: 4, // 4 meters long
  };

  const door = {
    ...mockDoor(),
    id: doorId,
    roomId: roomId,
    wallSide: 'north', // Horizontal wall
    position: 0.5,     // Center (2m)
    width: 1.0,        // 1 meter wide
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUpdateDoor = jest.fn();
    mockSelectDoor = jest.fn();
    mockPushState = jest.fn();

    (useFloorplanStore as unknown as jest.Mock).mockReturnValue(mockUpdateDoor);
    (useFloorplanStore.getState as jest.Mock).mockReturnValue({
      currentFloorplan: {
        rooms: [room],
        doors: [door],
        windows: [],
      },
      updateDoor: mockUpdateDoor,
      selectDoor: mockSelectDoor,
      getDoorById: jest.fn().mockReturnValue(door),
    });

    (useHistoryStore as unknown as jest.Mock).mockReturnValue(mockPushState);
    (useUIStore as unknown as jest.Mock).mockReturnValue(1.0); // zoomLevel = 1
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useDoorDrag());
    expect(result.current.isDragging).toBe(false);
  });

  it('starts drag on handleDragStart', () => {
    const { result } = renderHook(() => useDoorDrag());

    const event = createEvent.mouseDown(document, { button: 0, clientX: 100, clientY: 100 });
    Object.defineProperty(event, 'button', { value: 0 });

    act(() => {
      result.current.handleDragStart(event as any, doorId);
    });

    expect(result.current.isDragging).toBe(true);
    expect(mockSelectDoor).toHaveBeenCalledWith(doorId);
  });

  it('updates door position on mouse move', () => {
    const { result } = renderHook(() => useDoorDrag());

    // Start drag at 100, 100
    const startEvent = createEvent.mouseDown(document, { button: 0, clientX: 100, clientY: 100 });
    Object.defineProperty(startEvent, 'button', { value: 0 });

    act(() => {
      result.current.handleDragStart(startEvent as any, doorId);
    });

    // Move mouse 50 pixels to right
    // Scale = 50 pixels/m * 1 = 50 pixels/m
    // dx = 50 pixels = 1 meter
    // Wall length = 4m
    // Delta ratio = 1 / 4 = 0.25
    // Initial position = 0.5
    // New position = 0.75

    const moveEvent = new MouseEvent('mousemove', {
      clientX: 100 + PIXELS_PER_METER,
      clientY: 100,
      bubbles: true
    });

    act(() => {
      document.dispatchEvent(moveEvent);
    });

    expect(mockUpdateDoor).toHaveBeenCalledWith(doorId, expect.objectContaining({
      position: 0.75
    }));
  });

  it('prevents overlap with other doors', () => {
    const siblingDoor = {
      ...mockDoor(),
      id: 'door-2',
      roomId: roomId,
      wallSide: 'north',
      position: 0.8, // Center at 3.2m
      width: 1.0,    // Extends 2.7m to 3.7m
    };

    (useFloorplanStore.getState as jest.Mock).mockReturnValue({
      currentFloorplan: {
        rooms: [room],
        doors: [door, siblingDoor],
        windows: [],
      },
      updateDoor: mockUpdateDoor,
      selectDoor: mockSelectDoor,
      getDoorById: jest.fn().mockReturnValue(door),
    });

    const { result } = renderHook(() => useDoorDrag());

    const startEvent = createEvent.mouseDown(document, { button: 0, clientX: 100, clientY: 100 });
    Object.defineProperty(startEvent, 'button', { value: 0 });

    act(() => {
      result.current.handleDragStart(startEvent as any, doorId);
    });

    // Try to move to 0.75 (3m)
    // Overlaps with sibling at 0.8 (3.2m)
    // My new range: 2.5m - 3.5m
    // Sibling range: 2.7m - 3.7m
    // Overlap!

    const moveEvent = new MouseEvent('mousemove', {
      clientX: 100 + PIXELS_PER_METER, // +1m -> pos 0.75
      clientY: 100,
      bubbles: true
    });

    act(() => {
      document.dispatchEvent(moveEvent);
    });

    expect(mockUpdateDoor).not.toHaveBeenCalled();
  });

  it('ends drag on mouse up', () => {
    const { result } = renderHook(() => useDoorDrag());

    const startEvent = createEvent.mouseDown(document, { button: 0, clientX: 100, clientY: 100 });
    Object.defineProperty(startEvent, 'button', { value: 0 });

    act(() => {
      result.current.handleDragStart(startEvent as any, doorId);
    });

    const upEvent = new MouseEvent('mouseup', { bubbles: true });

    act(() => {
      document.dispatchEvent(upEvent);
    });

    expect(result.current.isDragging).toBe(false);
  });
});
