import React, { useState } from 'react';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { useUIStore } from '../../stores/uiStore';
import { RoomShape } from './RoomShape';

interface RoomLayerProps {
  onRoomMouseDown: (e: React.MouseEvent, roomId: string) => void;
}

export const RoomLayer: React.FC<RoomLayerProps> = ({ onRoomMouseDown }) => {
  const { currentFloorplan, selectedRoomIds } = useFloorplanStore();
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

  const handleDoubleClick = () => {
      // Ensure properties panel is open
      if (!useUIStore.getState().propertiesPanelOpen) {
          useUIStore.getState().togglePropertiesPanel();
      }
  };

  return (
    <g className="room-layer" data-testid="room-layer">
      {rooms.map(room => (
        <RoomShape
          key={room.id}
          room={room}
          isSelected={selectedRoomIds.includes(room.id)}
          isHovered={hoveredRoomId === room.id}
          onMouseDown={(e) => onRoomMouseDown(e, room.id)}
          onDoubleClick={handleDoubleClick}
          onPointerEnter={() => setHoveredRoomId(room.id)}
          onPointerLeave={() => setHoveredRoomId(null)}
        />
      ))}
    </g>
  );
};
