import React from 'react';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { useUIStore } from '../../stores/uiStore';
import { DoorOpen, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { WallSide } from '../../types/geometry';
import { useDialogStore } from '../../stores/dialogStore';

export const AdjacentRoomsSection: React.FC = () => {
  const selectedRoomId = useFloorplanStore((state) => state.selectedRoomId);
  const rooms = useFloorplanStore((state) => state.currentFloorplan?.rooms || []);
  const connections = useFloorplanStore((state) => state.currentFloorplan?.connections || []);
  const selectRoom = useFloorplanStore((state) => state.selectRoom);
  // Future use: using dialog to add door
  // const openDialog = useDialogStore(state => state.openDialog);

  if (!selectedRoomId) return null;

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  if (!selectedRoom) return null;

  const roomConnections = connections.filter(
    (c) => c.room1Id === selectedRoomId || c.room2Id === selectedRoomId
  );

  const handleRoomClick = (roomId: string) => {
    selectRoom(roomId);
  };

  const getWallName = (side: WallSide) => {
    return side.charAt(0).toUpperCase() + side.slice(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b">
        <LinkIcon className="w-4 h-4" />
        <h3 className="font-medium">Adjacent Rooms</h3>
      </div>

      {roomConnections.length === 0 ? (
        <div className="text-sm text-muted-foreground flex flex-col gap-2 items-center py-4 text-center">
          <AlertCircle className="w-8 h-8 opacity-50" />
          <p>No adjacent rooms</p>
          <p className="text-xs">Move rooms closer to create connections</p>
        </div>
      ) : (
        <div className="space-y-3">
          {roomConnections.map((conn) => {
            const isRoom1 = conn.room1Id === selectedRoomId;
            const otherRoomId = isRoom1 ? conn.room2Id : conn.room1Id;
            const otherRoom = rooms.find((r) => r.id === otherRoomId);

            // Wall sides from perspective of selected room -> other room
            const myWall = isRoom1 ? conn.room1Wall : conn.room2Wall;
            const otherWall = isRoom1 ? conn.room2Wall : conn.room1Wall;

            if (!otherRoom) return null;

            return (
              <div
                key={conn.id}
                className="bg-card border rounded-md p-3 text-sm hover:bg-accent/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <button
                    onClick={() => handleRoomClick(otherRoomId)}
                    className="font-medium hover:underline text-left truncate flex-1"
                  >
                    {otherRoom.name}
                  </button>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {conn.sharedWallLength.toFixed(2)}m shared
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-muted-foreground mb-3">
                  <span>{getWallName(myWall)} Wall ↔ {getWallName(otherWall)} Wall</span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-border/50">
                   <div className="flex items-center gap-1 text-xs">
                     <DoorOpen className="w-3 h-3" />
                     <span>{conn.doors.length} doors</span>
                   </div>

                   <Button
                     variant="outline"
                     size="sm"
                     className="h-6 text-xs px-2"
                     onClick={() => {
                        console.log('Open add door dialog for connection', conn.id);
                        // In future: openDialog('add-door', { connectionId: conn.id })
                     }}
                   >
                     + Add Door
                   </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
