import React, { useEffect, useState } from 'react';
import { useDoorPlacement } from '../../hooks/useDoorPlacement';
import { DOOR_DEFAULTS } from '../../types/door';
import { Position2D } from '../../types';

interface DoorToolProps {
  cursorPosition: Position2D | null;
}

export function DoorTool({ cursorPosition }: DoorToolProps) {
  const {
    isActive,
    hoveredWall,
    isValid,
    handleMouseMove,
    handleClick
  } = useDoorPlacement();

  // Update hook with cursor position
  useEffect(() => {
    handleMouseMove(cursorPosition);
  }, [cursorPosition, handleMouseMove]);

  // Handle click via global listener or passed prop?
  // The hook provides handleClick, but we need to trigger it.
  // Ideally, CanvasViewport should call this, but here we can't easily hook into that.
  // Instead, we can add a transparent overlay or rely on the parent to call onClick.
  // But wait, CanvasViewport `onClick` handles selection.
  // We need to intercept clicks.

  // Actually, Canvas2D should handle the click delegation or we use a global click listener if active.
  // For now, let's assume Canvas2D will handle the click or we add a listener here.
  useEffect(() => {
    if (!isActive) return;

    const onMouseUp = (e: MouseEvent) => {
        // Only handle left click
        if (e.button === 0 && isValid && hoveredWall) {
           // We need to prevent other interactions?
           // handleClick uses store state, so it should be fine.
           handleClick();
        }
    };

    // We attach to window to catch clicks anywhere, but we should probably limit scope.
    // However, since we are in a tool mode, maybe it is acceptable.
    // Better: pass `handleClick` to Canvas2D and have it call it.
    // But refactoring Canvas2D is bigger.
    // Let's attach to the canvas container if possible, or just window for now with checks.

    window.addEventListener('mouseup', onMouseUp);
    return () => window.removeEventListener('mouseup', onMouseUp);
  }, [isActive, isValid, hoveredWall, handleClick]);


  if (!isActive || !hoveredWall) return null;

  const { wall, position } = hoveredWall;
  const start = wall.from;
  const end = wall.to;

  // Calculate position
  const x = start.x + (end.x - start.x) * position;
  const z = start.z + (end.z - start.z) * position;

  // Calculate rotation angle
  const angle = Math.atan2(end.z - start.z, end.x - start.x) * (180 / Math.PI);

  // Door width in meters (scaled later by parent SVG group)
  const width = DOOR_DEFAULTS.width;

  // Color based on validity
  const color = isValid ? '#22c55e' : '#ef4444'; // green-500 : red-500

  return (
    <g transform={`translate(${x}, ${z}) rotate(${angle})`} className="pointer-events-none">
       {/* Door frame/opening preview */}
       <rect
         x={-width / 2}
         y={-0.1} // Slight offset for wall thickness visualization
         width={width}
         height={0.2}
         fill={color}
         opacity={0.5}
       />

       {/* Swing arc preview */}
       <path
         d={`M ${-width/2} 0 A ${width} ${width} 0 0 1 ${width/2} ${width}`}
         stroke={color}
         strokeWidth="0.05"
         fill="none"
         strokeDasharray="0.1 0.1"
       />

       {/* Door panel */}
       <line
         x1={-width/2}
         y1={0}
         x2={-width/2}
         y2={width}
         stroke={color}
         strokeWidth="0.05"
       />
    </g>
  );
}
