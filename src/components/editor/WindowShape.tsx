import React from 'react';
import { Window } from '../../types/window';
import { Room } from '../../types/room';
import { DEFAULT_WALL_THICKNESS } from '../../constants/defaults';
import { useWindowDrag } from '../../hooks/useWindowDrag';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { useToolStore } from '../../stores/toolStore';

interface WindowShapeProps {
  window: Window;
  room: Room;
  isSelected?: boolean;
  isHovered?: boolean;
}

export const WindowShape: React.FC<WindowShapeProps> = ({
  window,
  room,
  isSelected = false,
  isHovered = false
}) => {
  const { handleDragStart } = useWindowDrag();
  const selectWindow = useFloorplanStore(state => state.selectWindow);
  const activeTool = useToolStore(state => state.activeTool);

  let x = 0;
  let y = 0;
  let rotation = 0;

  switch (window.wallSide) {
    case 'north':
      x = room.width * window.position;
      y = 0;
      rotation = 0;
      break;
    case 'south':
      x = room.width * window.position;
      y = room.length;
      rotation = 180;
      break;
    case 'east':
      x = room.width;
      y = room.length * window.position;
      rotation = 90;
      break;
    case 'west':
      x = 0;
      y = room.length * window.position;
      rotation = 270;
      break;
  }

  const absoluteX = room.position.x + x;
  const absoluteY = room.position.z + y;
  const width = window.width;

  const strokeColor = isSelected ? '#2563eb' : isHovered ? '#3b82f6' : '#1e293b';
  const strokeWidth = isSelected || isHovered ? 0.08 : 0.05;
  const glassFill = '#e2e8f0';

  const onMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'select') {
      selectWindow(window.id);
      handleDragStart(e, window.id);
    }
  };

  const renderWindowType = () => {
    return (
      <g>
         <rect
            x={-width/2}
            y={-DEFAULT_WALL_THICKNESS/2}
            width={width}
            height={DEFAULT_WALL_THICKNESS}
            fill="white"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
         />

         <rect
            x={-width/2 + 0.05}
            y={-0.02}
            width={width - 0.1}
            height={0.04}
            fill={glassFill}
            stroke="none"
         />

         {window.frameType === 'double' && (
           <line x1={0} y1={-DEFAULT_WALL_THICKNESS/2} x2={0} y2={DEFAULT_WALL_THICKNESS/2} stroke={strokeColor} strokeWidth={strokeWidth/2} />
         )}
         {window.frameType === 'triple' && (
           <>
            <line x1={-width/6} y1={-DEFAULT_WALL_THICKNESS/2} x2={-width/6} y2={DEFAULT_WALL_THICKNESS/2} stroke={strokeColor} strokeWidth={strokeWidth/2} />
            <line x1={width/6} y1={-DEFAULT_WALL_THICKNESS/2} x2={width/6} y2={DEFAULT_WALL_THICKNESS/2} stroke={strokeColor} strokeWidth={strokeWidth/2} />
           </>
         )}
      </g>
    );
  };

  return (
    <g
      transform={`translate(${absoluteX}, ${absoluteY}) rotate(${rotation})`}
      data-testid={`window-shape-${window.id}`}
      onMouseDown={onMouseDown}
      style={{ cursor: activeTool === 'select' ? 'move' : 'default' }}
    >
      {renderWindowType()}
       {/* Hit area */}
       <rect
          x={-width/2}
          y={-DEFAULT_WALL_THICKNESS}
          width={width}
          height={DEFAULT_WALL_THICKNESS * 2}
          fill="transparent"
          stroke="none"
       />
    </g>
  );
};
