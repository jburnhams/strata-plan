import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { Maximize, Layers, List, Copy, Trash2 } from 'lucide-react';
import { SidebarSection } from '../layout/SidebarSection';
import { Button } from '../ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from '../ui/context-menu';

interface WindowsListProps {
  className?: string;
  defaultOpen?: boolean;
}

export function WindowsList({ className, defaultOpen = false }: WindowsListProps) {
  const {
    currentFloorplan,
    selectedWindowId,
    selectWindow,
    deleteWindow,
    duplicateWindow
  } = useFloorplanStore();
  const [isGrouped, setIsGrouped] = useState(false);

  const windows = currentFloorplan?.windows ?? [];
  const rooms = currentFloorplan?.rooms ?? [];

  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.name : 'Unknown Room';
  };

  const groupedWindows = windows.reduce((acc, window) => {
    const roomId = window.roomId;
    if (!acc[roomId]) {
      acc[roomId] = [];
    }
    acc[roomId].push(window);
    return acc;
  }, {} as Record<string, typeof windows>);

  const handleDuplicate = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    duplicateWindow(id);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteWindow(id);
  };

  const renderWindowItem = (window: typeof windows[0]) => {
    const isSelected = selectedWindowId === window.id;
    return (
      <ContextMenu key={window.id}>
        <ContextMenuTrigger>
          <div
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
               {!isGrouped && (
                 <span className="truncate text-xs text-muted-foreground">{getRoomName(window.roomId)}</span>
               )}
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={(e) => handleDuplicate(e, window.id)}>
             <Copy className="mr-2 h-4 w-4" />
             <span>Duplicate</span>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
             onClick={(e) => handleDelete(e, window.id)}
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
    <SidebarSection title="Windows" count={windows.length} defaultOpen={defaultOpen} className={className}>
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
          Object.entries(groupedWindows).map(([roomId, roomWindows]) => (
            <div key={roomId} className="space-y-1">
               <div className="text-xs font-semibold text-muted-foreground px-2 pt-1 pb-0.5">
                {getRoomName(roomId)}
              </div>
              <div className="pl-2 border-l ml-2 space-y-1">
                {roomWindows.map(renderWindowItem)}
              </div>
            </div>
          ))
        ) : (
          windows.map(renderWindowItem)
        )}

        {windows.length === 0 && (
          <div className="text-xs text-muted-foreground p-2 text-center">
            No windows
          </div>
        )}
      </div>
    </SidebarSection>
  );
}
