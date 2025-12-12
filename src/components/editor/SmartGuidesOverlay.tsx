import React from 'react';
import { SnapGuide } from '../../services/geometry/snapping';
import { useUIStore } from '../../stores/uiStore';
import { PIXELS_PER_METER } from '../../constants/defaults';

interface SmartGuidesOverlayProps {
  guides?: SnapGuide[];
}

export const SmartGuidesOverlay: React.FC<SmartGuidesOverlayProps> = ({ guides = [] }) => {
  const zoomLevel = useUIStore((state) => state.zoomLevel);

  if (!guides || guides.length === 0) return null;

  // Calculate stroke width relative to zoom (constant pixel width)
  const STROKE_WIDTH_PIXELS = 1;
  const strokeWidth = STROKE_WIDTH_PIXELS / (PIXELS_PER_METER * zoomLevel);

  return (
    <g data-testid="smart-guides-overlay" style={{ pointerEvents: 'none' }}>
      {guides.map((guide, index) => {
        if (guide.type === 'vertical') {
          return (
            <line
              key={index}
              x1={guide.offset}
              y1={guide.start}
              x2={guide.offset}
              y2={guide.end}
              stroke="#F59E0B" // amber-500
              strokeWidth={strokeWidth}
              strokeDasharray={`${strokeWidth * 4} ${strokeWidth * 4}`}
            />
          );
        } else {
          return (
            <line
              key={index}
              x1={guide.start}
              y1={guide.offset}
              x2={guide.end}
              y2={guide.offset}
              stroke="#F59E0B"
              strokeWidth={strokeWidth}
              strokeDasharray={`${strokeWidth * 4} ${strokeWidth * 4}`}
            />
          );
        }
      })}
    </g>
  );
};
