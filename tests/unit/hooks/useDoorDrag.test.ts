import { renderHook, act } from '@testing-library/react';
import { useDoorDrag } from '../../../src/hooks/useDoorDrag';
import { useFloorplanStore } from '../../../src/stores/floorplanStore';
import { useHistoryStore } from '../../../src/stores/historyStore';
import { useUIStore } from '../../../src/stores/uiStore';
import { mockDoor, mockRoom } from '../../utils/mockData';
import { createEvent } from '@testing-library/dom';
import { PIXELS_PER_METER } from '../../../src/constants/defaults';
import * as geometryService from '../../../src/services/geometry';
import * as coordinateUtils from '../../../src/utils/coordinates';

// Mock dependencies
jest.mock('../../../src/stores/floorplanStore');
jest.mock('../../../src/stores/historyStore');
jest.mock('../../../src/stores/uiStore');
jest.mock('../../../src/services/geometry');
jest.mock('../../../src/utils/coordinates');
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
    position: { x: 0, z: 0 },
    rotation: 0
  };

  const door = {
    ...mockDoor(),
    id: doorId,
    roomId: roomId,
    wallSide: 'north', // Horizontal wall at z=0, x=0 to 4
    position: 0.5,     // Center (2m)
    width: 1.0,        // 1 meter wide
  };

  // Mock wall segments
  const mockWallSegments = [
    { from: { x: 0, z: 0 }, to: { x: 4, z: 0 }, wallSide: 'north' }, // North wall
    { from: { x: 4, z: 0 }, to: { x: 4, z: 4 }, wallSide: 'east' },
    { from: { x: 4, z: 4 }, to: { x: 0, z: 4 }, wallSide: 'south' },
    { from: { x: 0, z: 4 }, to: { x: 0, z: 0 }, wallSide: 'west' }
  ];

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
    (useUIStore as unknown as jest.Mock).mockReturnValue({ zoomLevel: 1.0, panOffset: { x: 0, z: 0 } });

    // Mock geometry services
    (geometryService.getRoomWallSegments as jest.Mock).mockReturnValue(mockWallSegments);
    (geometryService.getWallLength as jest.Mock).mockReturnValue(4);

    // Mock screenToWorld to return simple mapping for test
    // Screen (100, 100) -> World (2, 0) (Center of North wall)
    (coordinateUtils.screenToWorld as jest.Mock).mockImplementation((x, y) => {
      // Simple mock: assume origin is at screen 0,0 for simplicity in some tests,
      // but here we are simulating explicit moves.
      return { x: x / PIXELS_PER_METER, z: y / PIXELS_PER_METER };
    });

    // Mock DOM
    const mockCanvas = document.createElement('div');
    mockCanvas.setAttribute('data-testid', 'canvas-viewport');
    jest.spyOn(mockCanvas, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      left: 0,
      width: 800,
      height: 600,
      bottom: 600,
      right: 800,
      x: 0,
      y: 0,
      toJSON: () => {}
    });
    jest.spyOn(document, 'querySelector').mockReturnValue(mockCanvas);
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
    // Setup screenToWorld to map explicitly
    (coordinateUtils.screenToWorld as jest.Mock).mockImplementation((x, y) => ({
       x: x / PIXELS_PER_METER,
       z: y / PIXELS_PER_METER
    }));

    const { result } = renderHook(() => useDoorDrag());

    // Start drag
    const startEvent = createEvent.mouseDown(document, { button: 0, clientX: 100, clientY: 0 });
    Object.defineProperty(startEvent, 'button', { value: 0 });

    act(() => {
      result.current.handleDragStart(startEvent as any, doorId);
    });

    // Move to x=3m (150px), z=0 (0px) -> North wall, pos 3/4 = 0.75
    // 150 pixels = 3 meters
    const moveEvent = new MouseEvent('mousemove', {
      clientX: 3 * PIXELS_PER_METER,
      clientY: 0,
      bubbles: true
    });

    act(() => {
      document.dispatchEvent(moveEvent);
    });

    expect(mockUpdateDoor).toHaveBeenCalledWith(doorId, expect.objectContaining({
      position: 0.75,
      wallSide: 'north'
    }));
  });

  it('updates door wallSide when moving to another wall', () => {
    (coordinateUtils.screenToWorld as jest.Mock).mockImplementation((x, y) => ({
       x: x / PIXELS_PER_METER,
       z: y / PIXELS_PER_METER
    }));

    const { result } = renderHook(() => useDoorDrag());

    act(() => {
      result.current.handleDragStart({ button: 0, stopPropagation: () => {}, preventDefault: () => {}, clientX: 0, clientY: 0 } as any, doorId);
    });

    // Move to x=4m, z=2m -> East wall center (pos 0.5)
    // 4m = 200px, 2m = 100px
    const moveEvent = new MouseEvent('mousemove', {
      clientX: 4 * PIXELS_PER_METER,
      clientY: 2 * PIXELS_PER_METER,
      bubbles: true
    });

    act(() => {
      document.dispatchEvent(moveEvent);
    });

    expect(mockUpdateDoor).toHaveBeenCalledWith(doorId, expect.objectContaining({
      position: 0.5,
      wallSide: 'east'
    }));
  });

  it('prevents overlap with other doors', () => {
     (coordinateUtils.screenToWorld as jest.Mock).mockImplementation((x, y) => ({
       x: x / PIXELS_PER_METER,
       z: y / PIXELS_PER_METER
    }));

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

    act(() => {
      result.current.handleDragStart({ button: 0, stopPropagation: () => {}, preventDefault: () => {}, clientX: 0, clientY: 0 } as any, doorId);
    });

    // Try to move to 3m (0.75) on north wall
    // 3m * 50 = 150px
    // 0.75 range: 2.5m - 3.5m
    // Sibling (0.8) range: 2.7m - 3.7m
    // Overlap!

    const moveEvent = new MouseEvent('mousemove', {
      clientX: 3 * PIXELS_PER_METER,
      clientY: 0,
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
