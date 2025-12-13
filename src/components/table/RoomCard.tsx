import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit2, Trash2, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Room } from '../../types/room';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { RoomType } from '../../types/room';

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { updateRoom, deleteRoom, addRoom, setRoomSelection } = useFloorplanStore();

  const handleExpand = () => {
    setExpanded(!expanded);
    if (!expanded) {
      setRoomSelection([room.id]);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete ${room.name}?`)) {
      deleteRoom(room.id);
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    // duplicateRoom doesn't exist, we must implement logic manually or add it to store
    // For now, manual implementation
    const { id, ...roomData } = room;
    addRoom({
        ...roomData,
        name: `${room.name} (Copy)`,
        position: { x: room.position.x + 1, z: room.position.z + 1 }
    });
  };

  const formatArea = (l: number, w: number) => {
    return (l * w).toFixed(2);
  };

  return (
    <Card className="mb-3 overflow-hidden">
      <CardHeader
        className="p-4 flex flex-row items-center justify-between cursor-pointer bg-muted/20"
        onClick={handleExpand}
        data-testid="room-card-header"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: room.customFloorColor || '#ccc' }}
          />
          <div className="flex flex-col">
            <CardTitle className="text-base font-medium">{room.name}</CardTitle>
            <span className="text-xs text-muted-foreground capitalize">{room.type} • {formatArea(room.length, room.width)} m²</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardHeader>

      {expanded && (
        <CardContent className="p-4 pt-0 border-t bg-background animate-accordion-down">
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Length (m)</span>
              <span className="font-medium">{room.length.toFixed(2)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Width (m)</span>
              <span className="font-medium">{room.width.toFixed(2)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Height (m)</span>
              <span className="font-medium">{room.height.toFixed(2)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Type</span>
              <span className="font-medium capitalize">{room.type}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={handleDuplicate} className="gap-1">
              <Copy className="h-3.5 w-3.5" />
              <span className="text-xs">Copy</span>
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-1">
              <Trash2 className="h-3.5 w-3.5" />
              <span className="text-xs">Delete</span>
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
