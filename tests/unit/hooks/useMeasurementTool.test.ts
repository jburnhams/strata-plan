import { renderHook, act } from '@testing-library/react';
import { useMeasurementTool } from '../../../src/hooks/useMeasurementTool';
import { useToolStore } from '../../../src/stores/toolStore';
import { useMeasurementStore } from '../../../src/stores/measurementStore';
import { useUIStore } from '../../../src/stores/uiStore';
import * as coordinates from '../../../src/utils/coordinates';
import { createEvent } from '@testing-library/dom';

// Mock dependencies
jest.mock('../../../src/utils/coordinates', () => ({
  screenToWorld: jest.fn(),
}));

describe('useMeasurementTool', () => {
  beforeEach(() => {
    // Reset stores
    useToolStore.setState({ activeTool: 'select' });
    useMeasurementStore.setState({ activeMeasurement: null, measurements: [] });
    useUIStore.setState({ zoomLevel: 1, panOffset: { x: 0, z: 0 }, showGrid: false });

    // Reset mocks
    jest.clearAllMocks();
  });

  it('does nothing if tool is not "measure"', () => {
    const { result } = renderHook(() => useMeasurementTool());

    // Mock event
    const event = createEvent.mouseDown(document.createElement('div'), { button: 0 });
    Object.defineProperty(event, 'currentTarget', {
      value: {
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 1000, height: 1000 })
      }
    });

    act(() => {
      result.current.handleMouseDown(event as unknown as React.MouseEvent);
    });

    expect(useMeasurementStore.getState().activeMeasurement).toBeNull();
  });

  it('starts measurement on first click', () => {
    useToolStore.setState({ activeTool: 'measure' });
    (coordinates.screenToWorld as jest.Mock).mockReturnValue({ x: 10, z: 10 });

    const { result } = renderHook(() => useMeasurementTool());

    const event = createEvent.mouseDown(document.createElement('div'), { button: 0 });
    event.preventDefault = jest.fn();
    event.stopPropagation = jest.fn();
    Object.defineProperty(event, 'currentTarget', {
      value: {
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 1000, height: 1000 })
      }
    });

    act(() => {
      result.current.handleMouseDown(event as unknown as React.MouseEvent);
    });

    expect(event.preventDefault).toHaveBeenCalled();
    expect(useMeasurementStore.getState().activeMeasurement).toEqual({
      startPoint: { x: 10, z: 10 },
      endPoint: { x: 10, z: 10 },
      distance: 0
    });
  });

  it('completes measurement on second click', () => {
    useToolStore.setState({ activeTool: 'measure' });

    const { result } = renderHook(() => useMeasurementTool());

    // First click at 0,0
    (coordinates.screenToWorld as jest.Mock).mockReturnValueOnce({ x: 0, z: 0 });

    const event1 = createEvent.mouseDown(document.createElement('div'), { button: 0 });
    event1.preventDefault = jest.fn();
    Object.defineProperty(event1, 'currentTarget', {
      value: {
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 1000, height: 1000 })
      }
    });

    act(() => {
      result.current.handleMouseDown(event1 as unknown as React.MouseEvent);
    });

    // Verify active measurement started
    expect(useMeasurementStore.getState().activeMeasurement).not.toBeNull();

    // Second click at 3,4 (distance 5)
    (coordinates.screenToWorld as jest.Mock).mockReturnValueOnce({ x: 3, z: 4 });

    const event2 = createEvent.mouseDown(document.createElement('div'), { button: 0 });
    event2.preventDefault = jest.fn();
    Object.defineProperty(event2, 'currentTarget', {
      value: {
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 1000, height: 1000 })
      }
    });

    act(() => {
      result.current.handleMouseDown(event2 as unknown as React.MouseEvent);
    });

    // Verify measurement added
    const measurements = useMeasurementStore.getState().measurements;
    expect(measurements).toHaveLength(1);
    expect(measurements[0].distance).toBe(5);

    // Verify active measurement cleared
    expect(useMeasurementStore.getState().activeMeasurement).toBeNull();
  });

  it('updates active measurement on mouse move', () => {
    useToolStore.setState({ activeTool: 'measure' });

    const { result } = renderHook(() => useMeasurementTool());

    // Start measurement
    (coordinates.screenToWorld as jest.Mock).mockReturnValueOnce({ x: 0, z: 0 });

    const mouseDownEvent = createEvent.mouseDown(document.createElement('div'), { button: 0 });
    Object.defineProperty(mouseDownEvent, 'currentTarget', {
      value: {
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 1000, height: 1000 })
      }
    });

    act(() => {
      result.current.handleMouseDown(mouseDownEvent as unknown as React.MouseEvent);
    });

    // Simulate mouse move
    (coordinates.screenToWorld as jest.Mock).mockReturnValueOnce({ x: 10, z: 0 });

    const mouseMoveEvent = new MouseEvent('mousemove', { clientX: 100, clientY: 100 });

    act(() => {
        document.dispatchEvent(mouseMoveEvent);
    });

    expect(useMeasurementStore.getState().activeMeasurement).toEqual({
        startPoint: { x: 0, z: 0 },
        endPoint: { x: 10, z: 0 },
        distance: 10
    });
  });

  it('cancels measurement on Escape key', () => {
    useToolStore.setState({ activeTool: 'measure' });

    const { result } = renderHook(() => useMeasurementTool());

    // Start measurement
    (coordinates.screenToWorld as jest.Mock).mockReturnValueOnce({ x: 0, z: 0 });

    const mouseDownEvent = createEvent.mouseDown(document.createElement('div'), { button: 0 });
    Object.defineProperty(mouseDownEvent, 'currentTarget', {
      value: {
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 1000, height: 1000 })
      }
    });

    act(() => {
      result.current.handleMouseDown(mouseDownEvent as unknown as React.MouseEvent);
    });

    expect(useMeasurementStore.getState().activeMeasurement).not.toBeNull();

    // Press Escape
    const keyDownEvent = new KeyboardEvent('keydown', { key: 'Escape' });

    act(() => {
        document.dispatchEvent(keyDownEvent);
    });

    expect(useMeasurementStore.getState().activeMeasurement).toBeNull();
  });
});
