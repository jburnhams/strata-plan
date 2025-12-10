import React from 'react';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { useUIStore } from '../../stores/uiStore';
import { RoomShape } from './RoomShape';

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
      {rooms.map((room) => (
        <RoomShape
          key={room.id}
          room={room}
          isSelected={selectedRoomIds.includes(room.id)}
          isHovered={hoveredRoomId === room.id}
          onClick={handleRoomClick}
          onMouseEnter={setHoveredRoom}
          onMouseLeave={() => setHoveredRoom(null)}
        />
      ))}
    </g>
  );
};
