import React from 'react';
import { Door } from '../../types/door';
import { Room } from '../../types/room';
import { DEFAULT_WALL_THICKNESS } from '../../constants/defaults';
import { useDoorDrag } from '../../hooks/useDoorDrag';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { useToolStore } from '../../stores/toolStore';

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
  const { handleDragStart } = useDoorDrag();
  const selectDoor = useFloorplanStore(state => state.selectDoor);
  const activeTool = useToolStore(state => state.activeTool);

  let x = 0;
  let y = 0;
  let rotation = 0;

  // room.length is along Z (Height on screen usually)
  // room.width is along X (Width on screen usually)
  // WallSide: north (top), south (bottom), east (right), west (left)

  switch (door.wallSide) {
    case 'north':
      // Along Top edge (X-axis). length of wall = room.width
      // position * width
      x = room.width * door.position;
      y = 0;
      rotation = 0;
      break;
    case 'south':
      // Along Bottom edge (X-axis)
      x = room.width * door.position;
      y = room.length;
      rotation = 180;
      break;
    case 'east':
      // Along Right edge (Z-axis). length of wall = room.length
      x = room.width;
      y = room.length * door.position;
      rotation = 90;
      break;
    case 'west':
       // Along Left edge (Z-axis)
      x = 0;
      y = room.length * door.position;
      rotation = 270;
      break;
  }

  // NOTE: Previous implementation had x = room.length * door.position for north/south.
  // But north/south walls are along the X axis, so they are bounded by room.WIDTH.
  // east/west walls are along Z axis, so bounded by room.LENGTH.
  // I have corrected this logic here.

  const absoluteX = room.position.x + x;
  const absoluteY = room.position.z + y;
  const width = door.width;
  const strokeColor = isSelected ? '#2563eb' : isHovered ? '#3b82f6' : '#1e293b';
  const strokeWidth = isSelected || isHovered ? 0.08 : 0.05;
  const arcFill = 'none';

  const onMouseDown = (e: React.MouseEvent) => {
      if (activeTool === 'select') {
        // e.stopPropagation(); // Handled in handleDragStart
        selectDoor(door.id);
        handleDragStart(e, door.id);
      }
  };

  const renderDoorType = () => {
    const swingScaleY = door.swing === 'outward' ? -1 : 1;
    const handleScaleX = door.handleSide === 'right' ? -1 : 1;
    // For single doors, the arc is typically drawn such that it fits the swing.
    // If we assume the pivot is at -width/2, the arc goes from -width/2, 0 to -width/2, width?
    // Or from width/2 to -width/2?

    // The previous implementation used scale(handleScaleX, swingScaleY).
    // Let's stick with that unless it looks wrong.
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
             {/* Pivot at -width/2. Swing to +width/2? No, width is total width. Pivot at -width/2 means end is at +width/2. Distance is width. */}
             {/* If pivot is at one end, the door panel is 'width' long. */}
             {/* Previous code: Move to width/2, Arc to -width/2. Radius=width. */}
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
      onMouseDown={onMouseDown}
      style={{ cursor: activeTool === 'select' ? 'move' : 'default' }}
    >
       {/* Background rect to cover wall line */}
       <rect
         x={-width/2}
         y={-DEFAULT_WALL_THICKNESS/2}
         width={width}
         height={DEFAULT_WALL_THICKNESS}
         fill="#f8fafc"
         stroke="none"
       />

       {renderDoorType()}

       {/* Hit area */}
       <rect
          x={-width/2}
          y={-width/2}
          width={width}
          height={width}
          fill="transparent"
          stroke="none"
       />
    </g>
  );
};
