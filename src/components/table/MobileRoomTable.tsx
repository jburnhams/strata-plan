import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { RoomCard } from './RoomCard';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { RoomType } from '../../types/room';

export function MobileRoomTable() {
  const { currentFloorplan, addRoom } = useFloorplanStore();

  if (!currentFloorplan) return null;

  const handleAddRoom = () => {
    // Default to a generic room
    addRoom({
      name: 'New Room',
      length: 4,
      width: 4,
      height: 2.4,
      type: 'bedroom',
      position: { x: 0, z: 0 },
      rotation: 0,
    });
  };

  return (
    <div className="flex flex-col h-full bg-muted/10">
      <div className="p-4 flex items-center justify-between bg-background border-b shadow-sm z-10">
        <h2 className="font-semibold text-lg">Rooms ({currentFloorplan.rooms.length})</h2>
        <Button size="sm" onClick={handleAddRoom} className="gap-1 rounded-full shadow-sm">
          <Plus className="h-4 w-4" />
          Add Room
        </Button>
      </div>

      <ScrollArea className="flex-1 px-4 py-4">
        {currentFloorplan.rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <p>No rooms added yet.</p>
            <p className="text-sm">Tap "Add Room" to start.</p>
          </div>
        ) : (
          <div className="flex flex-col pb-20">
            {currentFloorplan.rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
