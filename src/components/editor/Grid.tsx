import React from 'react';
import { useUIStore } from '../../stores/uiStore';

export const Grid: React.FC = () => {
  const { showGrid, zoomLevel } = useUIStore();

  if (!showGrid) return null;

  // Adaptive density thresholds
  // Zoom < 0.5: 1m lines only
  // Zoom 0.5-1.0: 1m and 0.5m lines
  // Zoom > 1.0: 1m, 0.5m, and 0.1m lines
  const show05m = zoomLevel >= 0.5;
  const show01m = zoomLevel > 1.0;

  // Grid bounds - large enough to cover typical house projects
  // Centered at 0,0
  const size = 2000;
  const start = -1000;

  return (
    <g className="grid-layer" pointerEvents="none" data-testid="grid-layer">
      <defs>
        {/* 1m Grid Pattern */}
        <pattern id="grid-1m" width="1" height="1" patternUnits="userSpaceOnUse">
          <path
            d="M 1 0 L 0 0 0 1"
            fill="none"
            className="stroke-slate-300 dark:stroke-slate-600"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </pattern>

        {/* 0.5m Grid Pattern */}
        <pattern id="grid-0.5m" width="0.5" height="0.5" patternUnits="userSpaceOnUse">
          <path
            d="M 0.5 0 L 0 0 0 0.5"
            fill="none"
            className="stroke-slate-200 dark:stroke-slate-700"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </pattern>

        {/* 0.1m Grid Pattern */}
        <pattern id="grid-0.1m" width="0.1" height="0.1" patternUnits="userSpaceOnUse">
          <path
            d="M 0.1 0 L 0 0 0 0.1"
            fill="none"
            className="stroke-slate-100 dark:stroke-slate-800"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </pattern>
      </defs>

      {/* Render 0.1m grid (finest detail) */}
      {show01m && (
        <rect
          x={start}
          y={start}
          width={size}
          height={size}
          fill="url(#grid-0.1m)"
          data-testid="grid-rect-0.1m"
        />
      )}

      {/* Render 0.5m grid (medium detail) */}
      {show05m && (
        <rect
          x={start}
          y={start}
          width={size}
          height={size}
          fill="url(#grid-0.5m)"
          data-testid="grid-rect-0.5m"
        />
      )}

      {/* Render 1m grid (major lines) - always shown if grid is on */}
      <rect
        x={start}
        y={start}
        width={size}
        height={size}
        fill="url(#grid-1m)"
        data-testid="grid-rect-1m"
      />
    </g>
  );
};
