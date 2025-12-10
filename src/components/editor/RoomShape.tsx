import React from 'react';
import { Room } from '../../types';
import { ROOM_TYPE_COLORS } from '../../constants/colors';
import { DEFAULT_WALL_THICKNESS } from '../../constants/defaults';

interface RoomShapeProps {
  room: Room;
  isSelected: boolean;
  isHovered: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
  onPointerEnter: (e: React.PointerEvent) => void;
  onPointerLeave: (e: React.PointerEvent) => void;
}

export const RoomShape: React.FC<RoomShapeProps> = ({
  room,
  isSelected,
  isHovered,
  onMouseDown,
  onDoubleClick,
  onPointerEnter,
  onPointerLeave
}) => {
  const { id, name, type, length, width, position, rotation } = room;

  // Center for rotation
  const cx = position.x + length / 2;
  const cy = position.z + width / 2;

  // Color
  const fill = ROOM_TYPE_COLORS[type] || '#e5e7eb';

  // Label visibility - hide if room is very small
  const showLabel = length > 0.8 && width > 0.8;

  // Text scaling
  const fontSize = Math.min(0.4, Math.min(length, width) / 4);

  return (
    <g
      transform={`rotate(${rotation}, ${cx}, ${cy})`}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className="cursor-pointer transition-opacity duration-200"
      data-testid={`room-${id}`}
    >
      {/* Room Body */}
      <rect
        x={position.x}
        y={position.z}
        width={length}
        height={width}
        fill={fill}
        stroke={isSelected ? "#2563eb" : "#475569"}
        strokeWidth={DEFAULT_WALL_THICKNESS}
        opacity={isHovered ? 0.9 : 0.75}
      />

      {/* Label */}
      {showLabel && (
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={fontSize}
          className="fill-slate-900 pointer-events-none select-none font-sans"
          style={{ fontWeight: 500 }}
        >
          {name}
          <tspan x={cx} dy={fontSize * 1.2} fontSize={fontSize * 0.7} className="fill-slate-600 font-normal">
             {(length * width).toFixed(1)} m²
          </tspan>
        </text>
      )}
    </g>
  );
};
