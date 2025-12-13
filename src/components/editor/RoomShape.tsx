import React from 'react';
import { Room, Position2D } from '../../types';
import { ROOM_TYPE_COLORS } from '../../constants/colors';
import { DEFAULT_WALL_THICKNESS } from '../../constants/defaults';
import { FLOOR_MATERIALS } from '../../constants/materialConfigs';

interface RoomShapeProps {
  room: Room;
  isSelected: boolean;
  isHovered: boolean;
  isOverlapping?: boolean;
  onClick: (e: React.MouseEvent, roomId: string) => void;
  onDoubleClick: (e: React.MouseEvent, roomId: string) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseEnter: (roomId: string) => void;
  onMouseLeave: () => void;
}

const calculatePolygonArea = (vertices: Position2D[]): number => {
  let area = 0;
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length;
    area += vertices[i].x * vertices[j].z;
    area -= vertices[j].x * vertices[i].z;
  }
  return Math.abs(area / 2);
};

export const RoomShape: React.FC<RoomShapeProps> = ({
  room,
  isSelected,
  isHovered,
  isOverlapping,
  onClick,
  onDoubleClick,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
}) => {
  // Fill color logic
  let fill = ROOM_TYPE_COLORS[room.type] || '#cccccc';

  // If custom color is set, use it
  if (room.customFloorColor) {
    fill = room.customFloorColor;
  }
  // Else if material is set, use material default color
  else if (room.floorMaterial && FLOOR_MATERIALS[room.floorMaterial]) {
    fill = FLOOR_MATERIALS[room.floorMaterial].defaultColor;
  }

  // Stroke logic
  let stroke = '#666666';
  const baseStrokeWidth = DEFAULT_WALL_THICKNESS; // 0.2m

  if (isOverlapping) {
    stroke = '#ef4444'; // red-500
  } else if (isSelected) {
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
  let area = room.length * room.width;
  const isPolygon = room.vertices && room.vertices.length > 2;

  if (isPolygon && room.vertices) {
    area = calculatePolygonArea(room.vertices);
  }

  // Font size calculation (clamp between min and max)
  // Base it on min dimension
  const minDim = Math.min(room.length, room.width);
  const fontSize = Math.max(0.3, Math.min(0.5, minDim * 0.15));

  return (
    <g
      transform={room.rotation ? `rotate(${room.rotation}, ${cx}, ${cy})` : undefined}
      onClick={(e) => onClick(e, room.id)}
      onDoubleClick={(e) => onDoubleClick(e, room.id)}
      onMouseDown={onMouseDown}
      onMouseEnter={() => onMouseEnter(room.id)}
      onMouseLeave={onMouseLeave}
      data-testid={`room-shape-${room.id}`}
      style={{ cursor: 'pointer' }}
    >
      {isPolygon && room.vertices ? (
        <polygon
          points={room.vertices.map(v => `${room.position.x + v.x},${room.position.z + v.z}`).join(' ')}
          fill={fill}
          fillOpacity={0.5}
          stroke={stroke}
          strokeWidth={baseStrokeWidth}
        />
      ) : (
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
          style={{ userSelect: 'none', pointerEvents: 'none' }}
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
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          >
            {area.toFixed(1)} m²
          </text>
      )}
    </g>
  );
};
