import React, { useEffect } from 'react';
import { useWindowPlacement } from '../../hooks/useWindowPlacement';
import { WINDOW_DEFAULTS } from '../../types/window';
import { Position2D } from '../../types';

interface WindowToolProps {
  cursorPosition: Position2D | null;
}

export function WindowTool({ cursorPosition }: WindowToolProps) {
  const {
    isActive,
    hoveredWall,
    isValid,
    handleMouseMove,
    handleClick
  } = useWindowPlacement();

  useEffect(() => {
    handleMouseMove(cursorPosition);
  }, [cursorPosition, handleMouseMove]);

  useEffect(() => {
    if (!isActive) return;

    const onMouseUp = (e: MouseEvent) => {
        if (e.button === 0 && isValid && hoveredWall) {
           handleClick();
        }
    };

    window.addEventListener('mouseup', onMouseUp);
    return () => window.removeEventListener('mouseup', onMouseUp);
  }, [isActive, isValid, hoveredWall, handleClick]);


  if (!isActive || !hoveredWall) return null;

  const { wall, position } = hoveredWall;
  const start = wall.from;
  const end = wall.to;

  const x = start.x + (end.x - start.x) * position;
  const z = start.z + (end.z - start.z) * position;
  const angle = Math.atan2(end.z - start.z, end.x - start.x) * (180 / Math.PI);

  const width = WINDOW_DEFAULTS.width;
  const color = isValid ? '#3b82f6' : '#ef4444'; // blue-500 : red-500

  return (
    <g transform={`translate(${x}, ${z}) rotate(${angle})`} className="pointer-events-none">
       {/* Window frame/opening preview */}
       {/* Background */}
       <rect
         x={-width / 2}
         y={-0.1}
         width={width}
         height={0.2}
         fill={color}
         opacity={0.3}
       />

       {/* Frame Outline */}
       <rect
         x={-width / 2}
         y={-0.1}
         width={width}
         height={0.2}
         fill="none"
         stroke={color}
         strokeWidth="0.02"
       />

       {/* Middle Glass/Frame Line */}
       <line
         x1={-width/2}
         y1={0}
         x2={width/2}
         y2={0}
         stroke={color}
         strokeWidth="0.02"
       />

       {/* Window pane divider (for default double window) */}
       <line
         x1={0}
         y1={-0.1}
         x2={0}
         y2={0.1}
         stroke={color}
         strokeWidth="0.02"
       />
    </g>
  );
}
