import React from 'react';
import { cn } from '../../lib/utils';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { Maximize } from 'lucide-react';
import { SidebarSection } from '../layout/SidebarSection';

interface WindowsListProps {
  className?: string;
}

export function WindowsList({ className }: WindowsListProps) {
  const {
    currentFloorplan,
    selectedWindowId,
    selectWindow
  } = useFloorplanStore();

  const windows = currentFloorplan?.windows ?? [];
  const rooms = currentFloorplan?.rooms ?? [];

  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.name : 'Unknown Room';
  };

  return (
    <SidebarSection title="Windows" count={windows.length} className={className}>
      <div className="space-y-1">
        {windows.map(window => {
          const isSelected = selectedWindowId === window.id;
          return (
            <div
              key={window.id}
              className={cn(
                "flex items-center gap-2 p-2 rounded-md text-sm cursor-pointer hover:bg-muted transition-colors",
                isSelected && "bg-accent text-accent-foreground"
              )}
              onClick={() => selectWindow(window.id)}
              role="button"
              aria-selected={isSelected}
              data-testid={`window-list-item-${window.id}`}
            >
              <Maximize className="h-4 w-4 shrink-0" />
              <div className="flex flex-col min-w-0">
                 <span className="truncate font-medium">{window.width}m x {window.height}m</span>
                 <span className="truncate text-xs text-muted-foreground">{getRoomName(window.roomId)}</span>
              </div>
            </div>
          );
        })}
        {windows.length === 0 && (
          <div className="text-xs text-muted-foreground p-2 text-center">
            No windows
          </div>
        )}
      </div>
    </SidebarSection>
  );
}
