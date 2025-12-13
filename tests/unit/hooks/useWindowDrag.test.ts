import { renderHook, act } from '@testing-library/react';
import { useWindowDrag } from '../../../src/hooks/useWindowDrag';
import { useFloorplanStore } from '../../../src/stores/floorplanStore';
import { useHistoryStore } from '../../../src/stores/historyStore';
import { useUIStore } from '../../../src/stores/uiStore';
import { mockWindow, mockRoom } from '../../utils/mockData';
import { createEvent } from '@testing-library/dom';
import { PIXELS_PER_METER } from '../../../src/constants/defaults';

// Mock dependencies
jest.mock('../../../src/stores/floorplanStore');
jest.mock('../../../src/stores/historyStore');
jest.mock('../../../src/stores/uiStore');

describe('useWindowDrag', () => {
  let mockUpdateWindow: jest.Mock;
  let mockSelectWindow: jest.Mock;
  let mockPushState: jest.Mock;

  const roomId = 'room-1';
  const windowId = 'window-1';

  const room = {
    ...mockRoom(),
    id: roomId,
    width: 4,  // 4 meters wide
    length: 4, // 4 meters long
  };

  const windowObj = {
    ...mockWindow(),
    id: windowId,
    roomId: roomId,
    wallSide: 'north',
    position: 0.5,
    width: 1.0,
  };

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
    (useUIStore as unknown as jest.Mock).mockReturnValue(1.0);
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useWindowDrag());
    expect(result.current.isDragging).toBe(false);
  });

  it('starts drag on handleDragStart', () => {
    const { result } = renderHook(() => useWindowDrag());

    const event = createEvent.mouseDown(document, { button: 0, clientX: 100, clientY: 100 });
    Object.defineProperty(event, 'button', { value: 0 });

    act(() => {
      result.current.handleDragStart(event as any, windowId);
    });

    expect(result.current.isDragging).toBe(true);
    expect(mockSelectWindow).toHaveBeenCalledWith(windowId);
  });

  it('updates window position on mouse move', () => {
    const { result } = renderHook(() => useWindowDrag());

    const startEvent = createEvent.mouseDown(document, { button: 0, clientX: 100, clientY: 100 });
    Object.defineProperty(startEvent, 'button', { value: 0 });

    act(() => {
      result.current.handleDragStart(startEvent as any, windowId);
    });

    const moveEvent = new MouseEvent('mousemove', {
      clientX: 100 + PIXELS_PER_METER,
      clientY: 100,
      bubbles: true
    });

    act(() => {
      document.dispatchEvent(moveEvent);
    });

    expect(mockUpdateWindow).toHaveBeenCalledWith(windowId, expect.objectContaining({
      position: 0.75
    }));
  });

  it('ends drag on mouse up', () => {
    const { result } = renderHook(() => useWindowDrag());

    const startEvent = createEvent.mouseDown(document, { button: 0, clientX: 100, clientY: 100 });
    Object.defineProperty(startEvent, 'button', { value: 0 });

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
