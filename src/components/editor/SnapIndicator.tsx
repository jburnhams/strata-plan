import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import { screenToWorld } from '../../utils/coordinates';
import { PIXELS_PER_METER } from '../../constants/defaults';

interface SnapIndicatorProps {
  mousePos: { x: number; y: number } | null;
  viewportSize: { width: number; height: number };
}

export const SnapIndicator: React.FC<SnapIndicatorProps> = ({ mousePos, viewportSize }) => {
  const { snapToGrid, gridSize, zoomLevel, panOffset } = useUIStore();

  if (!snapToGrid || !mousePos) return null;

  const transform = {
      zoom: zoomLevel,
      pan: panOffset,
      width: viewportSize.width,
      height: viewportSize.height
  };

  const worldPos = screenToWorld(mousePos.x, mousePos.y, transform);

  // Snap to nearest grid point
  const snappedX = Math.round(worldPos.x / gridSize) * gridSize;
  const snappedZ = Math.round(worldPos.z / gridSize) * gridSize;

  // Radius logic: keep it constant on screen (e.g. 4px radius)
  const radius = 4 / (PIXELS_PER_METER * zoomLevel);

  return (
    <g className="snap-indicator" pointerEvents="none" data-testid="snap-indicator">
       <circle
         cx={snappedX}
         cy={snappedZ}
         r={radius}
         className="fill-blue-500 stroke-white"
         strokeWidth={1 / (PIXELS_PER_METER * zoomLevel)}
         opacity={0.8}
       />
    </g>
  );
};
