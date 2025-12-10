import React, { useState } from 'react';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { RoomShape } from './RoomShape';

export const RoomLayer: React.FC = () => {
  const { currentFloorplan, selectedRoomIds, selectRoom } = useFloorplanStore();
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);

  if (!currentFloorplan) return null;

  // Sort rooms: unselected first, selected last (to render on top)
  const rooms = [...currentFloorplan.rooms].sort((a, b) => {
    const aSelected = selectedRoomIds.includes(a.id);
    const bSelected = selectedRoomIds.includes(b.id);
    if (aSelected && !bSelected) return 1;
    if (!aSelected && bSelected) return -1;
    return 0;
  });

  const handleRoomClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent canvas click from deselecting immediately
    // Task 4.4 will implement full selection logic (shift/ctrl)
    // For now, simple select
    selectRoom(id);
  };

  return (
    <g className="room-layer" data-testid="room-layer">
      {rooms.map(room => (
        <RoomShape
          key={room.id}
          room={room}
          isSelected={selectedRoomIds.includes(room.id)}
          isHovered={hoveredRoomId === room.id}
          onClick={(e) => handleRoomClick(e, room.id)}
          onDoubleClick={() => {}}
          onPointerEnter={() => setHoveredRoomId(room.id)}
          onPointerLeave={() => setHoveredRoomId(null)}
        />
      ))}
    </g>
  );
};
