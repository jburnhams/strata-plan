import React from 'react';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { useUIStore } from '../../stores/uiStore';
import { RoomShape } from './RoomShape';
import { useRoomDrag } from '../../hooks/useRoomDrag';
import { SmartGuidesOverlay } from './SmartGuidesOverlay';
import { DoorShape } from './DoorShape';
import { WindowShape } from './WindowShape';

export const RoomLayer: React.FC = () => {
  const currentFloorplan = useFloorplanStore((state) => state.currentFloorplan);
  const selectedRoomIds = useFloorplanStore((state) => state.selectedRoomIds);
  const selectRoom = useFloorplanStore((state) => state.selectRoom);
  const setRoomSelection = useFloorplanStore((state) => state.setRoomSelection);

  const selectedDoorId = useFloorplanStore((state) => state.selectedDoorId);
  const selectedWindowId = useFloorplanStore((state) => state.selectedWindowId);
  const selectDoor = useFloorplanStore((state) => state.selectDoor);
  const selectWindow = useFloorplanStore((state) => state.selectWindow);

  const hoveredRoomId = useUIStore((state) => state.hoveredRoomId);
  const setHoveredRoom = useUIStore((state) => state.setHoveredRoom);
  const setPropertiesPanelOpen = useUIStore((state) => state.setPropertiesPanelOpen);
  const setFocusProperty = useUIStore((state) => state.setFocusProperty);

  const { handleDragStart, isDragging, overlappingRoomIds, activeGuides } = useRoomDrag();

  const rooms = currentFloorplan?.rooms || [];
  const doors = currentFloorplan?.doors || [];
  const windows = currentFloorplan?.windows || [];

  // Sort rooms so selected ones are rendered last (on top)
  const sortedRooms = [...rooms].sort((a, b) => {
    const aSelected = selectedRoomIds.includes(a.id);
    const bSelected = selectedRoomIds.includes(b.id);

    // If one is selected and other isn't, selected comes later
    if (aSelected && !bSelected) return 1;
    if (!aSelected && bSelected) return -1;

    // Stable sort for rest (preserve original order or id)
    return 0;
  });

  const handleRoomClick = (e: React.MouseEvent, roomId: string) => {
    e.stopPropagation();

    // Multi-selection with Shift/Ctrl
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
        if (selectedRoomIds.includes(roomId)) {
             setRoomSelection(selectedRoomIds.filter(id => id !== roomId));
        } else {
             setRoomSelection([...selectedRoomIds, roomId]);
        }
    } else {
        selectRoom(roomId);
    }
  };

  const handleRoomDoubleClick = (e: React.MouseEvent, roomId: string) => {
    e.stopPropagation();

    // Ensure room is selected
    if (!selectedRoomIds.includes(roomId)) {
      selectRoom(roomId);
    }

    // Open properties panel and focus name
    setPropertiesPanelOpen(true);
    setFocusProperty('room-name');
  };

  const handleRoomMouseDown = (e: React.MouseEvent, roomId: string) => {
      handleDragStart(e, roomId);
      // We don't stop propagation here because handleDragStart does it.
  };

  return (
    <g data-testid="room-layer">
      {sortedRooms.map((room) => {
        // Filter doors and windows for this room
        const roomDoors = doors.filter(d => d.roomId === room.id);
        const roomWindows = windows.filter(w => w.roomId === room.id);

        return (
          <React.Fragment key={room.id}>
            <RoomShape
              room={room}
              isSelected={selectedRoomIds.includes(room.id)}
              isHovered={hoveredRoomId === room.id}
              isOverlapping={overlappingRoomIds?.includes(room.id)}
              onClick={handleRoomClick}
              onDoubleClick={handleRoomDoubleClick}
              onMouseDown={(e) => handleRoomMouseDown(e, room.id)}
              onMouseEnter={setHoveredRoom}
              onMouseLeave={() => setHoveredRoom(null)}
            />
            {/* Render Doors and Windows on top of RoomShape */}
            {roomDoors.map(door => (
              <g
                key={door.id}
                onClick={(e) => {
                  e.stopPropagation();
                  selectDoor(door.id);
                  setPropertiesPanelOpen(true);
                }}
              >
                <DoorShape
                  door={door}
                  room={room}
                  isSelected={selectedDoorId === door.id}
                />
              </g>
            ))}
            {roomWindows.map(window => (
              <g
                key={window.id}
                onClick={(e) => {
                  e.stopPropagation();
                  selectWindow(window.id);
                  setPropertiesPanelOpen(true);
                }}
              >
                <WindowShape
                  window={window}
                  room={room}
                  isSelected={selectedWindowId === window.id}
                />
              </g>
            ))}
          </React.Fragment>
        );
      })}
      <SmartGuidesOverlay guides={activeGuides} />
    </g>
  );
};
