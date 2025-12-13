import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { DoorOpen, Layers, List, Copy, Trash2 } from 'lucide-react';
import { SidebarSection } from '../layout/SidebarSection';
import { Button } from '../ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from '../ui/context-menu';

interface DoorsListProps {
  className?: string;
  defaultOpen?: boolean;
}

export function DoorsList({ className, defaultOpen = false }: DoorsListProps) {
  const {
    currentFloorplan,
    selectedDoorId,
    selectDoor,
    deleteDoor,
    duplicateDoor
  } = useFloorplanStore();
  const [isGrouped, setIsGrouped] = useState(false);

  const doors = currentFloorplan?.doors ?? [];
  const rooms = currentFloorplan?.rooms ?? [];

  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.name : 'Unknown Room';
  };

  const groupedDoors = doors.reduce((acc, door) => {
    const roomId = door.roomId;
    if (!acc[roomId]) {
      acc[roomId] = [];
    }
    acc[roomId].push(door);
    return acc;
  }, {} as Record<string, typeof doors>);

  const handleDuplicate = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    duplicateDoor(id);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteDoor(id);
  };

  const renderDoorItem = (door: typeof doors[0]) => {
    const isSelected = selectedDoorId === door.id;

    return (
      <ContextMenu key={door.id}>
        <ContextMenuTrigger>
          <div
            className={cn(
              "flex items-center gap-2 p-2 rounded-md text-sm cursor-pointer hover:bg-muted transition-colors",
              isSelected && "bg-accent text-accent-foreground"
            )}
            onClick={() => selectDoor(door.id)}
            role="button"
            aria-selected={isSelected}
            data-testid={`door-list-item-${door.id}`}
          >
            <DoorOpen className="h-4 w-4 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="truncate font-medium">{door.type.charAt(0).toUpperCase() + door.type.slice(1)} Door</span>
              {!isGrouped && (
                <span className="truncate text-xs text-muted-foreground">{getRoomName(door.roomId)}</span>
              )}
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={(e) => handleDuplicate(e, door.id)}>
            <Copy className="mr-2 h-4 w-4" />
            <span>Duplicate</span>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={(e) => handleDelete(e, door.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  return (
    <SidebarSection title="Doors" count={doors.length} defaultOpen={defaultOpen} className={className}>
      <div className="flex justify-end px-2 mb-2">
         <div className="flex items-center bg-muted rounded-md p-0.5">
           <Button
             variant="ghost"
             size="icon"
             className={cn("h-6 w-6 rounded-sm", !isGrouped && "bg-background shadow-sm")}
             onClick={() => setIsGrouped(false)}
             title="Flat List"
           >
             <List className="h-3 w-3" />
           </Button>
           <Button
             variant="ghost"
             size="icon"
             className={cn("h-6 w-6 rounded-sm", isGrouped && "bg-background shadow-sm")}
             onClick={() => setIsGrouped(true)}
             title="Group by Room"
           >
             <Layers className="h-3 w-3" />
           </Button>
         </div>
      </div>

      <div className="space-y-1">
        {isGrouped ? (
          Object.entries(groupedDoors).map(([roomId, roomDoors]) => (
            <div key={roomId} className="space-y-1">
              <div className="text-xs font-semibold text-muted-foreground px-2 pt-1 pb-0.5">
                {getRoomName(roomId)}
              </div>
              <div className="pl-2 border-l ml-2 space-y-1">
                {roomDoors.map(renderDoorItem)}
              </div>
            </div>
          ))
        ) : (
          doors.map(renderDoorItem)
        )}

        {doors.length === 0 && (
          <div className="text-xs text-muted-foreground p-2 text-center">
            No doors
          </div>
        )}
      </div>
    </SidebarSection>
  );
}
