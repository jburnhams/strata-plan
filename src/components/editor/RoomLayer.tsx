import React from 'react';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { useUIStore } from '../../stores/uiStore';
import { ROOM_TYPE_COLORS } from '../../constants/colors';

export const RoomLayer: React.FC = () => {
  const currentFloorplan = useFloorplanStore((state) => state.currentFloorplan);
  const selectedRoomIds = useFloorplanStore((state) => state.selectedRoomIds);
  const selectRoom = useFloorplanStore((state) => state.selectRoom);
  const setRoomSelection = useFloorplanStore((state) => state.setRoomSelection);

  const hoveredRoomId = useUIStore((state) => state.hoveredRoomId);
  const setHoveredRoom = useUIStore((state) => state.setHoveredRoom);

  const rooms = currentFloorplan?.rooms || [];

  const handleRoomClick = (e: React.MouseEvent, roomId: string) => {
    e.stopPropagation();

    // Multi-selection with Shift/Ctrl
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
        if (selectedRoomIds.includes(roomId)) {
            // Deselect
             setRoomSelection(selectedRoomIds.filter(id => id !== roomId));
        } else {
            // Add to selection
             setRoomSelection([...selectedRoomIds, roomId]);
        }
    } else {
        selectRoom(roomId);
    }
  };

  return (
    <g>
      {rooms.map((room) => {
        const isSelected = selectedRoomIds.includes(room.id);
        const isHovered = hoveredRoomId === room.id;

        // Use type color, or fallback to gray
        const fill = ROOM_TYPE_COLORS[room.type] || '#cccccc';

        // Stroke
        let stroke = '#666666';
        let strokeWidth = 0.05; // meters (thin line)

        if (isSelected) {
            stroke = '#2563eb'; // blue-600
            strokeWidth = 0.1;
        } else if (isHovered) {
            stroke = '#3b82f6'; // blue-500
            strokeWidth = 0.08;
        }

        // Center for rotation
        const cx = room.position.x + room.length / 2;
        const cy = room.position.z + room.width / 2;

        return (
          <rect
            key={room.id}
            x={room.position.x}
            y={room.position.z}
            width={room.length}
            height={room.width}
            fill={fill}
            fillOpacity={0.5}
            stroke={stroke}
            strokeWidth={strokeWidth}
            transform={room.rotation ? `rotate(${room.rotation}, ${cx}, ${cy})` : undefined}
            onClick={(e) => handleRoomClick(e, room.id)}
            onMouseEnter={() => setHoveredRoom(room.id)}
            onMouseLeave={() => setHoveredRoom(null)}
            data-testid={`room-shape-${room.id}`}
            style={{ cursor: 'pointer' }}
          />
        );
      })}
    </g>
  );
};
