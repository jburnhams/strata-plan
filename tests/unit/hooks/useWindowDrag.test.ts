import { renderHook, act } from '@testing-library/react';
import { useWindowDrag } from '../../../src/hooks/useWindowDrag';
import { useFloorplanStore } from '../../../src/stores/floorplanStore';
import { useHistoryStore } from '../../../src/stores/historyStore';
import { useUIStore } from '../../../src/stores/uiStore';
import { mockWindow, mockRoom } from '../../utils/mockData';
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

describe('useWindowDrag', () => {
  let mockUpdateWindow: jest.Mock;
  let mockSelectWindow: jest.Mock;
  let mockPushState: jest.Mock;

  const roomId = 'room-1';
  const windowId = 'window-1';

  const room = {
    ...mockRoom(),
    id: roomId,
    width: 4,
    length: 4,
    position: { x: 0, z: 0 },
    rotation: 0
  };

  const windowObj = {
    ...mockWindow(),
    id: windowId,
    roomId: roomId,
    wallSide: 'north',
    position: 0.5,
    width: 1.2,
  };

  const mockWallSegments = [
    { from: { x: 0, z: 0 }, to: { x: 4, z: 0 }, wallSide: 'north' }, // North wall
    { from: { x: 4, z: 0 }, to: { x: 4, z: 4 }, wallSide: 'east' },
    { from: { x: 4, z: 4 }, to: { x: 0, z: 4 }, wallSide: 'south' },
    { from: { x: 0, z: 4 }, to: { x: 0, z: 0 }, wallSide: 'west' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    mockUpdateWindow = jest.fn();
    mockSelectWindow = jest.fn();
    mockPushState = jest.fn();

    (useFloorplanStore as unknown as jest.Mock).mockReturnValue(mockUpdateWindow);
    (useFloorplanStore.getState as jest.Mock).mockReturnValue({
      currentFloorplan: {
        rooms: [room],
        doors: [],
        windows: [windowObj],
      },
      updateWindow: mockUpdateWindow,
      selectWindow: mockSelectWindow,
      getWindowById: jest.fn().mockReturnValue(windowObj),
    });

    (useHistoryStore as unknown as jest.Mock).mockReturnValue(mockPushState);
    (useUIStore as unknown as jest.Mock).mockReturnValue({ zoomLevel: 1.0, panOffset: { x: 0, z: 0 } });

    (geometryService.getRoomWallSegments as jest.Mock).mockReturnValue(mockWallSegments);
    (geometryService.getWallLength as jest.Mock).mockReturnValue(4);

    (coordinateUtils.screenToWorld as jest.Mock).mockImplementation((x, y) => ({
       x: x / PIXELS_PER_METER,
       z: y / PIXELS_PER_METER
    }));

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
    const { result } = renderHook(() => useWindowDrag());
    expect(result.current.isDragging).toBe(false);
  });

  it('starts drag on handleDragStart', () => {
    const { result } = renderHook(() => useWindowDrag());

    const event = {
        button: 0,
        clientX: 100,
        clientY: 100,
        stopPropagation: jest.fn(),
        preventDefault: jest.fn()
    };

    act(() => {
      result.current.handleDragStart(event as any, windowId);
    });

    expect(result.current.isDragging).toBe(true);
    expect(mockSelectWindow).toHaveBeenCalledWith(windowId);
  });

  it('updates window position on mouse move', () => {
    const { result } = renderHook(() => useWindowDrag());

    const startEvent = {
        button: 0,
        clientX: 100,
        clientY: 100,
        stopPropagation: jest.fn(),
        preventDefault: jest.fn()
    };

    act(() => {
      result.current.handleDragStart(startEvent as any, windowId);
    });

    // Move to 3m (150px) on North wall
    // 3m / 4m = 0.75
    const moveEvent = new MouseEvent('mousemove', {
      clientX: 3 * PIXELS_PER_METER,
      clientY: 0,
      bubbles: true
    });

    act(() => {
      document.dispatchEvent(moveEvent);
    });

    expect(mockUpdateWindow).toHaveBeenCalledWith(windowId, expect.objectContaining({
      position: 0.75,
      wallSide: 'north'
    }));
  });

  it('updates window wallSide when moving to another wall', () => {
    const { result } = renderHook(() => useWindowDrag());

    act(() => {
      result.current.handleDragStart({ button: 0, stopPropagation: () => {}, preventDefault: () => {}, clientX: 0, clientY: 0 } as any, windowId);
    });

    // Move to East wall center
    const moveEvent = new MouseEvent('mousemove', {
      clientX: 4 * PIXELS_PER_METER,
      clientY: 2 * PIXELS_PER_METER,
      bubbles: true
    });

    act(() => {
      document.dispatchEvent(moveEvent);
    });

    expect(mockUpdateWindow).toHaveBeenCalledWith(windowId, expect.objectContaining({
      position: 0.5,
      wallSide: 'east'
    }));
  });

  it('ends drag on mouse up', () => {
    const { result } = renderHook(() => useWindowDrag());

    const startEvent = {
        button: 0,
        clientX: 100,
        clientY: 100,
        stopPropagation: jest.fn(),
        preventDefault: jest.fn()
    };

    act(() => {
      result.current.handleDragStart(startEvent as any, windowId);
    });

    const upEvent = new MouseEvent('mouseup', { bubbles: true });

    act(() => {
      document.dispatchEvent(upEvent);
    });

    expect(result.current.isDragging).toBe(false);
  });
});
