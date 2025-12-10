import React from 'react';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { RoomMesh } from './RoomMesh';

export interface SceneManagerProps {
  wallOpacity?: number;
  showLabels?: boolean;
}

export const SceneManager: React.FC<SceneManagerProps> = ({
  wallOpacity = 1.0,
  showLabels = true
}) => {
  const floorplan = useFloorplanStore(state => state.currentFloorplan);
  const selectedRoomId = useFloorplanStore(state => state.selectedRoomId);
  const selectedRoomIds = useFloorplanStore(state => state.selectedRoomIds);
  const selectRoom = useFloorplanStore(state => state.selectRoom);
  // toggleSelection doesn't exist on store yet, but we can implement toggle logic here
  // or add it to the store. For now, simple single selection or multi-selection if modifier held (but we don't have access to event here easily unless passed down)
  // `onSelect` in RoomMesh receives just roomId.

  // Actually, multi-selection usually happens with Ctrl+Click.
  // We can just use `selectRoom` which replaces selection.
  // If we want to support toggle, we'd need to check if ID is in list.

  if (!floorplan) return null;

  const handleSelect = (roomId: string) => {
    // Basic single selection for now
    selectRoom(roomId);
  };

  return (
    <group>
      {floorplan.rooms.map(room => (
        <RoomMesh
          key={room.id}
          room={room}
          isSelected={selectedRoomId === room.id || selectedRoomIds.includes(room.id)}
          onSelect={handleSelect}
          showLabels={showLabels}
          wallOpacity={wallOpacity}
        />
      ))}
    </group>
  );
};
