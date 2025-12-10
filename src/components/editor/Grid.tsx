import React from 'react';
import { useUIStore } from '../../stores/uiStore';

// Large enough to cover most use cases (1000m radius)
const GRID_EXTENT = 1000;

export function Grid() {
  const { showGrid, zoomLevel } = useUIStore();

  if (!showGrid) return null;

  // Adaptive visibility thresholds
  const showMinor = zoomLevel > 1.0;   // 0.1m lines
  const showMedium = zoomLevel >= 0.5; // 0.5m lines

  return (
    <g className="grid-layer" data-testid="grid-layer">
      <defs>
        {/* Minor Grid Pattern (0.1m) */}
        <pattern
          id="grid-minor"
          width="0.1"
          height="0.1"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 0.1 0 L 0 0 0 0.1"
            fill="none"
            className="stroke-slate-200/50"
            vectorEffect="non-scaling-stroke"
          />
        </pattern>

        {/* Medium Grid Pattern (0.5m) */}
        <pattern
          id="grid-medium"
          width="0.5"
          height="0.5"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 0.5 0 L 0 0 0 0.5"
            fill="none"
            className="stroke-slate-300/60"
            vectorEffect="non-scaling-stroke"
          />
        </pattern>

        {/* Major Grid Pattern (1.0m) */}
        <pattern
          id="grid-major"
          width="1.0"
          height="1.0"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 1.0 0 L 0 0 0 1.0"
            fill="none"
            className="stroke-slate-400/70"
            vectorEffect="non-scaling-stroke"
          />
        </pattern>
      </defs>

      {/* Render grids from finest to coarsest */}

      {showMinor && (
        <rect
          data-testid="grid-minor-rect"
          x={-GRID_EXTENT}
          y={-GRID_EXTENT}
          width={GRID_EXTENT * 2}
          height={GRID_EXTENT * 2}
          fill="url(#grid-minor)"
          pointerEvents="none"
        />
      )}

      {showMedium && (
        <rect
          data-testid="grid-medium-rect"
          x={-GRID_EXTENT}
          y={-GRID_EXTENT}
          width={GRID_EXTENT * 2}
          height={GRID_EXTENT * 2}
          fill="url(#grid-medium)"
          pointerEvents="none"
        />
      )}

      {/* Major grid always shown if grid is enabled */}
      <rect
        data-testid="grid-major-rect"
        x={-GRID_EXTENT}
        y={-GRID_EXTENT}
        width={GRID_EXTENT * 2}
        height={GRID_EXTENT * 2}
        fill="url(#grid-major)"
        pointerEvents="none"
      />

      {/* Axis Lines (Origin) */}
      <line
        x1={-GRID_EXTENT}
        y1={0}
        x2={GRID_EXTENT}
        y2={0}
        className="stroke-slate-500"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        data-testid="grid-axis-x"
      />
      <line
        x1={0}
        y1={-GRID_EXTENT}
        x2={0}
        y2={GRID_EXTENT}
        className="stroke-slate-500"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        data-testid="grid-axis-z"
      />
    </g>
  );
}
