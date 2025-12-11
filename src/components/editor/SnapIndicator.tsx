import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import { Position2D } from '../../types';
import { PIXELS_PER_METER } from '../../constants/defaults';

interface SnapIndicatorProps {
  cursorPosition: Position2D | null;
}

export function SnapIndicator({ cursorPosition }: SnapIndicatorProps) {
  const { snapToGrid, gridSize, zoomLevel } = useUIStore();

  if (!cursorPosition || !snapToGrid) return null;

  // Calculate snapped position
  const snapX = Math.round(cursorPosition.x / gridSize) * gridSize;
  const snapZ = Math.round(cursorPosition.z / gridSize) * gridSize;

  // Calculate radius to maintain constant visual size (e.g., 8px diameter)
  // We want the dot to be visible but not intrusive.
  const dotPixelSize = 8;
  const radius = (dotPixelSize / 2) / (PIXELS_PER_METER * zoomLevel);

  return (
    <g className="snap-indicator" pointerEvents="none" data-testid="snap-indicator">
      {/* Outer glow/highlight */}
      <circle
        cx={snapX}
        cy={snapZ}
        r={radius}
        fill="#3b82f6" // blue-500
        opacity={0.8}
      />
      {/* Inner white dot */}
      <circle
        cx={snapX}
        cy={snapZ}
        r={radius * 0.4}
        fill="#ffffff"
      />
    </g>
  );
}
