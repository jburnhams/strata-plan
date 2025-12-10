import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { CanvasViewport } from '../../../../src/components/editor/CanvasViewport';
import { useUIStore } from '../../../../src/stores/uiStore';

// Mock useUIStore
jest.mock('../../../../src/stores/uiStore');

describe('CanvasViewport', () => {
  const setPanMock = jest.fn();
  const setZoomMock = jest.fn();

  beforeEach(() => {
    (useUIStore as unknown as jest.Mock).mockReturnValue({
      zoomLevel: 1.0,
      panOffset: { x: 0, z: 0 },
      setPan: setPanMock,
      setZoom: setZoomMock,
    });

    // Mock ResizeObserver to trigger callback
    global.ResizeObserver = class {
      callback: any;
      constructor(callback: any) {
        this.callback = callback;
      }
      observe() {
         // Simulate resize
         this.callback([{ contentRect: { width: 1000, height: 800 } }]);
      }
      unobserve() {}
      disconnect() {}
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly and handles resize', () => {
    render(<CanvasViewport />);
    expect(screen.getByTestId('canvas-viewport')).toBeInTheDocument();
    // Implicitly tests ResizeObserver callback via the mock in beforeEach
  });

  it('handles zoom with wheel', () => {
    render(<CanvasViewport />);
    const viewport = screen.getByTestId('canvas-viewport');

    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, width: 1000, height: 800, bottom: 800, right: 1000, x: 0, y: 0,
      toJSON: () => {}
    } as DOMRect);

    fireEvent.wheel(viewport, { clientX: 500, clientY: 400, deltaY: -100 });

    expect(setZoomMock).toHaveBeenCalled();
    expect(setPanMock).toHaveBeenCalled();
  });

  it('handles zoom with wheel (zoom out)', () => {
    render(<CanvasViewport />);
    const viewport = screen.getByTestId('canvas-viewport');

    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, width: 1000, height: 800, bottom: 800, right: 1000, x: 0, y: 0,
      toJSON: () => {}
    } as DOMRect);

    fireEvent.wheel(viewport, { clientX: 500, clientY: 400, deltaY: 100 });

    expect(setZoomMock).toHaveBeenCalled();
  });

  it('ignores zoom if scale is 0 (edge case)', () => {
      // Mock zoom level 0 (should not happen due to clamp but possible in store)
      (useUIStore as unknown as jest.Mock).mockReturnValue({
        zoomLevel: 0,
        panOffset: { x: 0, z: 0 },
        setPan: setPanMock,
        setZoom: setZoomMock,
      });
      render(<CanvasViewport />);
      const viewport = screen.getByTestId('canvas-viewport');

      jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
        left: 0, top: 0, width: 1000, height: 800, bottom: 800, right: 1000, x: 0, y: 0,
        toJSON: () => {}
      } as DOMRect);

      fireEvent.wheel(viewport, { clientX: 500, clientY: 400, deltaY: -100 });
      // Should return early
      expect(setZoomMock).not.toHaveBeenCalled();
  });

  it('handles pan with middle mouse button', () => {
    render(<CanvasViewport />);
    const viewport = screen.getByTestId('canvas-viewport');

    fireEvent.mouseDown(viewport, { button: 1, clientX: 100, clientY: 100 });
    fireEvent.mouseMove(viewport, { clientX: 150, clientY: 120 });

    expect(setPanMock).toHaveBeenCalledWith({ x: 50, z: 20 });

    fireEvent.mouseUp(viewport);
    setPanMock.mockClear();
    fireEvent.mouseMove(viewport, { clientX: 200, clientY: 200 });
    expect(setPanMock).not.toHaveBeenCalled();
  });

  it('stops dragging on mouse leave', () => {
    render(<CanvasViewport />);
    const viewport = screen.getByTestId('canvas-viewport');

    fireEvent.mouseDown(viewport, { button: 1, clientX: 100, clientY: 100 });
    fireEvent.mouseLeave(viewport);

    setPanMock.mockClear();
    fireEvent.mouseMove(viewport, { clientX: 200, clientY: 200 });
    expect(setPanMock).not.toHaveBeenCalled();
  });

  it('handles pan with Alt + Left Click', () => {
    render(<CanvasViewport />);
    const viewport = screen.getByTestId('canvas-viewport');

    fireEvent.mouseDown(viewport, { button: 0, altKey: true, clientX: 100, clientY: 100 });
    fireEvent.mouseMove(viewport, { clientX: 120, clientY: 100 });

    expect(setPanMock).toHaveBeenCalledWith({ x: 20, z: 0 });
  });
});
