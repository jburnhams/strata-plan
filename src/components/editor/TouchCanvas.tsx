import React, { useRef } from 'react';
import { useTouchGestures } from '../../hooks/useTouchGestures';
import { useUIStore } from '../../stores/uiStore';
import { CanvasViewport } from './CanvasViewport';
import { cn } from '../../lib/utils';

interface TouchCanvasProps {
  className?: string;
}

export function TouchCanvas({ className }: TouchCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { zoomLevel, panOffset, setZoom, setPan } = useUIStore();

  useTouchGestures(containerRef, {
    onPan: (deltaX, deltaY) => {
      const currentPan = useUIStore.getState().panOffset;
      setPan({ x: currentPan.x + deltaX, z: currentPan.z + deltaY });
    },
    onPinch: (scale, centerX, centerY) => {
      const currentZoom = useUIStore.getState().zoomLevel;
      const newZoom = Math.max(0.1, Math.min(5.0, currentZoom * scale));
      setZoom(newZoom);
    },
    onTap: (x, y) => {
      // Tap logic
    }
  });

  return (
    <div
      ref={containerRef}
      className={cn("h-full w-full relative overflow-hidden touch-none", className)}
      data-testid="touch-canvas"
    >
      <CanvasViewport />
    </div>
  );
}
