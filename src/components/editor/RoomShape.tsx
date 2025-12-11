import React from 'react';
import { Room } from '../../types';
import { ROOM_TYPE_COLORS } from '../../constants/colors';
import { DEFAULT_WALL_THICKNESS } from '../../constants/defaults';

interface RoomShapeProps {
  room: Room;
  isSelected: boolean;
  isHovered: boolean;
  onClick: (e: React.MouseEvent, roomId: string) => void;
  onMouseEnter: (roomId: string) => void;
  onMouseLeave: () => void;
}

export const RoomShape: React.FC<RoomShapeProps> = ({
  room,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  // Use type color, or fallback to gray
  const fill = ROOM_TYPE_COLORS[room.type] || '#cccccc';

  // Stroke logic
  let stroke = '#666666';
  const baseStrokeWidth = DEFAULT_WALL_THICKNESS; // 0.2m

  // When selected, we want to highlight it but keep the wall thickness representation
  // We can change color or opacity

  if (isSelected) {
    stroke = '#2563eb'; // blue-600
  } else if (isHovered) {
    stroke = '#3b82f6'; // blue-500
  }

  // Center for rotation
  const cx = room.position.x + room.length / 2;
  const cy = room.position.z + room.width / 2;

  // Label visibility logic
  // Only show if room is big enough
  const showLabel = room.length > 1.0 && room.width > 1.0;

  // Calculate area
  const area = room.length * room.width;

  // Font size calculation (clamp between min and max)
  // Base it on min dimension
  const minDim = Math.min(room.length, room.width);
  const fontSize = Math.max(0.3, Math.min(0.5, minDim * 0.15));

  return (
    <g
      transform={room.rotation ? `rotate(${room.rotation}, ${cx}, ${cy})` : undefined}
      onClick={(e) => onClick(e, room.id)}
      onMouseEnter={() => onMouseEnter(room.id)}
      onMouseLeave={onMouseLeave}
      data-testid={`room-shape-${room.id}`}
      style={{ cursor: 'pointer' }}
    >
      <rect
        x={room.position.x}
        y={room.position.z}
        width={room.length}
        height={room.width}
        fill={fill}
        fillOpacity={0.5}
        stroke={stroke}
        strokeWidth={baseStrokeWidth}
      />

      {/* Handles for selection (only if selected) */}
      {isSelected && (
        <g>
           {/* Corners */}
           <rect x={room.position.x - 0.2} y={room.position.z - 0.2} width={0.4} height={0.4} fill="white" stroke="#2563eb" strokeWidth={0.05} />
           <rect x={room.position.x + room.length - 0.2} y={room.position.z - 0.2} width={0.4} height={0.4} fill="white" stroke="#2563eb" strokeWidth={0.05} />
           <rect x={room.position.x - 0.2} y={room.position.z + room.width - 0.2} width={0.4} height={0.4} fill="white" stroke="#2563eb" strokeWidth={0.05} />
           <rect x={room.position.x + room.length - 0.2} y={room.position.z + room.width - 0.2} width={0.4} height={0.4} fill="white" stroke="#2563eb" strokeWidth={0.05} />
        </g>
      )}

      {/* Label */}
      {showLabel && (
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#1e293b" // slate-800
          fontSize={fontSize}
          style={{ userSelect: 'none' }}
        >
          {room.name}
        </text>
      )}

      {showLabel && (
          <text
            x={cx}
            y={cy + fontSize * 1.2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#475569" // slate-600
            fontSize={fontSize * 0.7}
          >
            {area.toFixed(1)} m²
          </text>
      )}
    </g>
  );
};
