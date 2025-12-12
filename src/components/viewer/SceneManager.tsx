import React, { useEffect } from 'react';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { RoomMesh } from './RoomMesh';
import { useSceneSync } from '../../hooks/useSceneSync';

export interface SceneManagerProps {
  wallOpacity?: number;
  showLabels?: boolean;
}

export const SceneManager: React.FC<SceneManagerProps> = ({
  wallOpacity = 1.0,
  showLabels = true
}) => {
  // Use the sync hook to get debounced floorplan data
  const { rooms, sceneVersion } = useSceneSync(100);

  const selectedRoomId = useFloorplanStore(state => state.selectedRoomId);
  const selectedRoomIds = useFloorplanStore(state => state.selectedRoomIds);
  const selectRoom = useFloorplanStore(state => state.selectRoom);

  // Force re-render of all meshes when sceneVersion changes
  // We use the key prop on the group to force React to unmount and remount the children

  if (!rooms || rooms.length === 0) return null;

  const handleSelect = (roomId: string) => {
    // Basic single selection for now
    selectRoom(roomId);
  };

  return (
    <group key={`scene-${sceneVersion}`}>
      {rooms.map(room => (
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
