import React from 'react';
import { Door } from '../../types/door';
import { Room } from '../../types/room';
import { WallSide } from '../../types/geometry';
import { DEFAULT_WALL_THICKNESS } from '../../constants/defaults';

interface DoorShapeProps {
  door: Door;
  room: Room;
  isSelected?: boolean;
  isHovered?: boolean;
}

export const DoorShape: React.FC<DoorShapeProps> = ({
  door,
  room,
  isSelected = false,
  isHovered = false
}) => {
  let x = 0;
  let y = 0;
  let rotation = 0;

  const halfWall = DEFAULT_WALL_THICKNESS / 2;

  switch (door.wallSide) {
    case 'north':
      x = room.length * door.position;
      y = 0;
      rotation = 0;
      break;
    case 'south':
      x = room.length * door.position;
      y = room.width;
      rotation = 180;
      break;
    case 'east':
      x = room.length;
      y = room.width * door.position;
      rotation = 90;
      break;
    case 'west':
      x = 0;
      y = room.width * door.position;
      rotation = 270;
      break;
  }

  const absoluteX = room.position.x + x;
  const absoluteY = room.position.z + y;
  const width = door.width;
  const strokeColor = isSelected ? '#2563eb' : isHovered ? '#3b82f6' : '#1e293b';
  const strokeWidth = isSelected || isHovered ? 0.08 : 0.05;
  const arcFill = 'none';

  const renderDoorType = () => {
    const swingScaleY = door.swing === 'outward' ? -1 : 1;
    const handleScaleX = door.handleSide === 'right' ? -1 : 1;
    const transform = `scale(${handleScaleX}, ${swingScaleY})`;

    switch (door.type) {
      case 'double':
        return (
          <g transform={transform}>
            <path d={`M ${-width/2} 0 A ${width/2} ${width/2} 0 0 1 0 ${width/2}`} fill={arcFill} stroke={strokeColor} strokeWidth={strokeWidth/2} strokeDasharray="0.1 0.1" />
            <line x1={-width/2} y1={0} x2={-width/2} y2={width/2} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d={`M ${width/2} 0 A ${width/2} ${width/2} 0 0 0 0 ${width/2}`} fill={arcFill} stroke={strokeColor} strokeWidth={strokeWidth/2} strokeDasharray="0.1 0.1" />
            <line x1={width/2} y1={0} x2={width/2} y2={width/2} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );
      case 'sliding':
        return (
           <g>
             <line x1={-width/2} y1={-0.05} x2={0} y2={-0.05} stroke={strokeColor} strokeWidth={strokeWidth} />
             <line x1={0} y1={0.05} x2={width/2} y2={0.05} stroke={strokeColor} strokeWidth={strokeWidth} />
             <path d="M -0.1 -0.05 L 0 -0.05 L -0.05 -0.02" fill="none" stroke={strokeColor} strokeWidth={strokeWidth/2} transform="scale(0.5)" />
           </g>
        );
      case 'pocket':
        return (
           <g transform={transform}>
             <line x1={-width/2} y1={0} x2={width/2} y2={0} stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray="0.1 0.1" />
             <line x1={-width/2} y1={0} x2={0} y2={0} stroke={strokeColor} strokeWidth={strokeWidth} />
           </g>
        );
      case 'bifold':
         return (
           <g transform={transform}>
             <polyline points={`${-width/2},0 ${-width/4},${width/4} 0,0`} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
             <polyline points={`0,0 ${width/4},${width/4} ${width/2},0`} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
           </g>
         );
      case 'single':
      default:
        return (
          <g transform={transform}>
             <path d={`M ${width/2} 0 A ${width} ${width} 0 0 1 ${-width/2} ${width}`} fill={arcFill} stroke={strokeColor} strokeWidth={strokeWidth/2} strokeDasharray="0.1 0.1" />
             <line x1={-width/2} y1={0} x2={-width/2} y2={width} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );
    }
  };

  return (
    <g
      transform={`translate(${absoluteX}, ${absoluteY}) rotate(${rotation})`}
      data-testid={`door-shape-${door.id}`}
    >
       <rect
         x={-width/2}
         y={-DEFAULT_WALL_THICKNESS/2}
         width={width}
         height={DEFAULT_WALL_THICKNESS}
         fill="#f8fafc"
         stroke="none"
       />

       {renderDoorType()}

       <rect
          x={-width/2}
          y={-width/2}
          width={width}
          height={width}
          fill="transparent"
          stroke="none"
          style={{ cursor: 'pointer' }}
       />
    </g>
  );
};
