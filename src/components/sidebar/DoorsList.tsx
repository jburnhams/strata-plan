import React from 'react';
import { cn } from '../../lib/utils';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { DoorOpen } from 'lucide-react';
import { SidebarSection } from '../layout/SidebarSection';

interface DoorsListProps {
  className?: string;
}

export function DoorsList({ className }: DoorsListProps) {
  const {
    currentFloorplan,
    selectedDoorId,
    selectDoor
  } = useFloorplanStore();

  const doors = currentFloorplan?.doors ?? [];
  const rooms = currentFloorplan?.rooms ?? [];

  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.name : 'Unknown Room';
  };

  return (
    <SidebarSection title="Doors" count={doors.length} className={className}>
      <div className="space-y-1">
        {doors.map(door => {
          const isSelected = selectedDoorId === door.id;
          return (
            <div
              key={door.id}
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
                 <span className="truncate text-xs text-muted-foreground">{getRoomName(door.roomId)}</span>
              </div>
            </div>
          );
        })}
        {doors.length === 0 && (
          <div className="text-xs text-muted-foreground p-2 text-center">
            No doors
          </div>
        )}
      </div>
    </SidebarSection>
  );
}
