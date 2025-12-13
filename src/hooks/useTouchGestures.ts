import { useRef, useEffect, useState } from 'react';

interface TouchGesturesOptions {
  onPan?: (deltaX: number, deltaY: number) => void;
  onPinch?: (scale: number, centerX: number, centerY: number) => void;
  onTap?: (x: number, y: number) => void;
  onDoubleTap?: (x: number, y: number) => void;
  onLongPress?: (x: number, y: number) => void;
}

export function useTouchGestures(
  ref: React.RefObject<HTMLElement | null>,
  options: TouchGesturesOptions
) {
  const { onPan, onPinch, onTap, onDoubleTap, onLongPress } = options;

  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const initialPinchDistanceRef = useRef<number | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isGesturingRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      isGesturingRef.current = false;

      if (e.touches.length === 1) {
        const touch = e.touches[0];
        lastTouchRef.current = { x: touch.clientX, y: touch.clientY };

        longPressTimerRef.current = setTimeout(() => {
          if (!isGesturingRef.current && onLongPress) {
            onLongPress(touch.clientX, touch.clientY);
            isGesturingRef.current = true;
          }
        }, 500);

      } else if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        );
        initialPinchDistanceRef.current = distance;
        isGesturingRef.current = true;
        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();

      if (e.touches.length === 1 && lastTouchRef.current) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - lastTouchRef.current.x;
        const deltaY = touch.clientY - lastTouchRef.current.y;

        if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
          isGesturingRef.current = true;
          if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
          if (onPan) onPan(deltaX, deltaY);
        }

        lastTouchRef.current = { x: touch.clientX, y: touch.clientY };

      } else if (e.touches.length === 2 && initialPinchDistanceRef.current) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        );

        const scale = currentDistance / initialPinchDistanceRef.current;
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;

        if (onPinch) onPinch(scale, centerX, centerY);
        initialPinchDistanceRef.current = currentDistance;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);

      if (!isGesturingRef.current && e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const now = Date.now();
        const timeSinceLastTap = now - lastTapTimeRef.current;

        if (timeSinceLastTap < 300 && onDoubleTap) {
          onDoubleTap(touch.clientX, touch.clientY);
          lastTapTimeRef.current = 0;
        } else {
          if (onTap) onTap(touch.clientX, touch.clientY);
          lastTapTimeRef.current = now;
        }
      }

      if (e.touches.length === 0) {
        lastTouchRef.current = null;
        initialPinchDistanceRef.current = null;
        isGesturingRef.current = false;
      } else if (e.touches.length === 1) {
         const touch = e.touches[0];
         lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [ref, onPan, onPinch, onTap, onDoubleTap, onLongPress]);
}
