import { renderHook } from '@testing-library/react';
import { useTouchGestures } from '../../../src/hooks/useTouchGestures';
import { fireEvent } from '@testing-library/dom';

describe('useTouchGestures', () => {
  let element: HTMLElement;
  let ref: { current: HTMLElement | null };

  beforeEach(() => {
    element = document.createElement('div');
    ref = { current: element };
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const createTouch = (target: Element, x: number, y: number, identifier = 0) => {
    return {
      identifier,
      target,
      clientX: x,
      clientY: y,
      pageX: x,
      pageY: y,
    } as unknown as Touch;
  };

  it('handles tap gestures', () => {
    const onTap = jest.fn();
    renderHook(() => useTouchGestures(ref, { onTap }));

    const touch = createTouch(element, 100, 100);

    // Start
    fireEvent.touchStart(element, { touches: [touch], targetTouches: [touch], changedTouches: [touch] });

    // End (no movement)
    fireEvent.touchEnd(element, { touches: [], targetTouches: [], changedTouches: [touch] });

    expect(onTap).toHaveBeenCalledWith(100, 100);
  });

  it('handles double tap gestures', () => {
    const onDoubleTap = jest.fn();
    const onTap = jest.fn();
    renderHook(() => useTouchGestures(ref, { onDoubleTap, onTap }));

    const touch = createTouch(element, 100, 100);

    // First tap
    fireEvent.touchStart(element, { touches: [touch], targetTouches: [touch], changedTouches: [touch] });
    fireEvent.touchEnd(element, { touches: [], targetTouches: [], changedTouches: [touch] });

    expect(onTap).toHaveBeenCalled();

    // Second tap immediately
    fireEvent.touchStart(element, { touches: [touch], targetTouches: [touch], changedTouches: [touch] });
    fireEvent.touchEnd(element, { touches: [], targetTouches: [], changedTouches: [touch] });

    expect(onDoubleTap).toHaveBeenCalledWith(100, 100);
  });

  it('handles pan gestures', () => {
    const onPan = jest.fn();
    renderHook(() => useTouchGestures(ref, { onPan }));

    const startTouch = createTouch(element, 100, 100);
    fireEvent.touchStart(element, { touches: [startTouch], targetTouches: [startTouch], changedTouches: [startTouch] });

    const moveTouch = createTouch(element, 110, 105); // +10, +5
    fireEvent.touchMove(element, { touches: [moveTouch], targetTouches: [moveTouch], changedTouches: [moveTouch] });

    expect(onPan).toHaveBeenCalledWith(10, 5);
  });

  it('handles pinch gestures', () => {
    const onPinch = jest.fn();
    renderHook(() => useTouchGestures(ref, { onPinch }));

    // Start with 2 fingers, dist = 100
    const startTouch1 = createTouch(element, 0, 0, 0);
    const startTouch2 = createTouch(element, 100, 0, 1);
    fireEvent.touchStart(element, { touches: [startTouch1, startTouch2], targetTouches: [startTouch1, startTouch2], changedTouches: [startTouch1, startTouch2] });

    // Move to expand, dist = 200
    const moveTouch1 = createTouch(element, -50, 0, 0);
    const moveTouch2 = createTouch(element, 150, 0, 1);
    fireEvent.touchMove(element, { touches: [moveTouch1, moveTouch2], targetTouches: [moveTouch1, moveTouch2], changedTouches: [moveTouch1, moveTouch2] });

    // Scale should be 200 / 100 = 2
    // Center should be (50, 0)
    expect(onPinch).toHaveBeenCalledWith(2, 50, 0);
  });

  it('handles long press', () => {
    const onLongPress = jest.fn();
    renderHook(() => useTouchGestures(ref, { onLongPress }));

    const touch = createTouch(element, 100, 100);
    fireEvent.touchStart(element, { touches: [touch], targetTouches: [touch], changedTouches: [touch] });

    jest.advanceTimersByTime(600); // Wait > 500ms

    expect(onLongPress).toHaveBeenCalledWith(100, 100);
  });
});
