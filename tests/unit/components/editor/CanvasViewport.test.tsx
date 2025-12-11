import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { CanvasViewport } from '../../../../src/components/editor/CanvasViewport';
import { useUIStore } from '../../../../src/stores/uiStore';
import { useRoomInteraction } from '../../../../src/hooks/useRoomInteraction';
import 'jest-canvas-mock';

// Mock useUIStore
jest.mock('../../../../src/stores/uiStore');
// Mock useRoomInteraction
jest.mock('../../../../src/hooks/useRoomInteraction');

describe('CanvasViewport', () => {
  const setPanMock = jest.fn();
  const setZoomMock = jest.fn();
  const handleBackgroundClickMock = jest.fn();

  beforeEach(() => {
    (useUIStore as unknown as jest.Mock).mockReturnValue({
      zoomLevel: 1.0,
      panOffset: { x: 0, z: 0 },
      setPan: setPanMock,
      setZoom: setZoomMock,
    });

    (useRoomInteraction as unknown as jest.Mock).mockReturnValue({
        handleBackgroundClick: handleBackgroundClickMock
    });

    global.ResizeObserver = class {
      callback: any;
      constructor(callback: any) {
        this.callback = callback;
      }
      observe() {
         this.callback([{ contentRect: { width: 1000, height: 800 } }]);
      }
      unobserve() {}
      disconnect() {}
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<CanvasViewport />);
    expect(screen.getByTestId('canvas-viewport')).toBeInTheDocument();
  });

  it('calls handleBackgroundClick on click without drag', () => {
      render(<CanvasViewport />);
      const viewport = screen.getByTestId('canvas-viewport');

      // Click: Down -> Up -> Click
      // React handles onClick after MouseUp
      fireEvent.mouseDown(viewport, { button: 0, clientX: 100, clientY: 100 });
      fireEvent.mouseUp(viewport, { button: 0, clientX: 100, clientY: 100 });
      fireEvent.click(viewport, { button: 0, clientX: 100, clientY: 100 });

      expect(handleBackgroundClickMock).toHaveBeenCalled();
  });

  it('does NOT call handleBackgroundClick on drag', () => {
      render(<CanvasViewport />);
      const viewport = screen.getByTestId('canvas-viewport');

      // Drag: Down -> Move -> Up -> Click (drag implies click doesn't fire for background action usually, but we guard with hasMoved)
      fireEvent.mouseDown(viewport, { button: 0, clientX: 100, clientY: 100 });
      fireEvent.mouseMove(viewport, { clientX: 110, clientY: 110 });
      fireEvent.mouseUp(viewport, { button: 0, clientX: 110, clientY: 110 });
      fireEvent.click(viewport, { button: 0, clientX: 110, clientY: 110 });

      expect(handleBackgroundClickMock).not.toHaveBeenCalled();
  });

  it('calls onCursorMove when mouse moves', () => {
    const onCursorMove = jest.fn();
    render(<CanvasViewport onCursorMove={onCursorMove} />);
    const viewport = screen.getByTestId('canvas-viewport');

    fireEvent.mouseMove(viewport, { clientX: 100, clientY: 100 });

    expect(onCursorMove).toHaveBeenCalled();
  });

  it('calls onCursorMove(null) on mouse leave', () => {
    const onCursorMove = jest.fn();
    render(<CanvasViewport onCursorMove={onCursorMove} />);
    const viewport = screen.getByTestId('canvas-viewport');

    fireEvent.mouseLeave(viewport);

    expect(onCursorMove).toHaveBeenCalledWith(null);
  });
});
