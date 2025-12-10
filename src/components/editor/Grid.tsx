import React from 'react';
import { useUIStore } from '../../stores/uiStore';

export const Grid: React.FC = () => {
  const showGrid = useUIStore((state) => state.showGrid);
  const zoomLevel = useUIStore((state) => state.zoomLevel);

  if (!showGrid) return null;

  // Render a large enough area.
  // In a real app we might calculate viewport bounds in world space.
  // For now, -100 to 100 meters is sufficient for typical houses.
  const origin = -100;
  const size = 200;

  return (
    <g className="grid-layer" data-testid="grid-layer" pointerEvents="none">
      <defs>
        <pattern id="grid-small" width="0.1" height="0.1" patternUnits="userSpaceOnUse">
          <path d="M 0.1 0 L 0 0 0 0.1" fill="none" stroke="#e5e7eb" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </pattern>
        <pattern id="grid-medium" width="0.5" height="0.5" patternUnits="userSpaceOnUse">
          <path d="M 0.5 0 L 0 0 0 0.5" fill="none" stroke="#d1d5db" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </pattern>
        <pattern id="grid-large" width="1" height="1" patternUnits="userSpaceOnUse">
          <path d="M 1 0 L 0 0 0 1" fill="none" stroke="#9ca3af" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </pattern>
      </defs>

      {zoomLevel > 1.0 && (
        <rect x={origin} y={origin} width={size} height={size} fill="url(#grid-small)" />
      )}

      {zoomLevel >= 0.5 && (
        <rect x={origin} y={origin} width={size} height={size} fill="url(#grid-medium)" />
      )}

      <rect x={origin} y={origin} width={size} height={size} fill="url(#grid-large)" />

      {/* Origin Marker */}
      <circle cx="0" cy="0" r="0.1" fill="#ef4444" opacity="0.5" />
    </g>
  );
};
