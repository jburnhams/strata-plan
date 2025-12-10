import React, { useState, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { useUIStore } from '../../stores/uiStore';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { useAddRoom } from '../../hooks/useAddRoom';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Search,
  Plus,
  DoorOpen,
  Maximize,
  Box
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { SidebarSection } from './SidebarSection';
import { ScrollArea } from '../ui/scroll-area';

interface LeftSidebarProps {
  className?: string;
}

export function LeftSidebar({ className }: LeftSidebarProps) {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const {
    currentFloorplan,
    selectedRoomId,
    selectedRoomIds,
    selectedWallId,
    selectedDoorId,
    selectedWindowId,
    selectRoom,
    setRoomSelection,
    selectWall,
    selectDoor,
    selectWindow
  } = useFloorplanStore();
  const { addRoom } = useAddRoom();

  const [searchTerm, setSearchTerm] = useState('');

  const rooms = currentFloorplan?.rooms ?? [];
  const walls = currentFloorplan?.walls ?? [];
  const doors = currentFloorplan?.doors ?? [];
  const windows = currentFloorplan?.windows ?? [];

  const filteredRooms = useMemo(() => {
    if (!searchTerm) return rooms;
    return rooms.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [rooms, searchTerm]);

  // Handle room selection with support for multi-select
  const handleRoomClick = (roomId: string, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
        // Toggle selection
        const isSelected = selectedRoomIds.includes(roomId);
        let newSelection: string[];
        if (isSelected) {
            newSelection = selectedRoomIds.filter(id => id !== roomId);
        } else {
            newSelection = [...selectedRoomIds, roomId];
        }
        setRoomSelection(newSelection);
    } else if (event.shiftKey && selectedRoomIds.length > 0) {
        // Shift select range (simplified: just add to selection or select range in filtered list)
        const lastSelectedId = selectedRoomIds[selectedRoomIds.length - 1];
        const lastIndex = filteredRooms.findIndex(r => r.id === lastSelectedId);
        const currentIndex = filteredRooms.findIndex(r => r.id === roomId);

        if (lastIndex !== -1 && currentIndex !== -1) {
            const start = Math.min(lastIndex, currentIndex);
            const end = Math.max(lastIndex, currentIndex);
            const rangeIds = filteredRooms.slice(start, end + 1).map(r => r.id);
            // Merge with existing unique
            const newSet = new Set([...selectedRoomIds, ...rangeIds]);
            setRoomSelection(Array.from(newSet));
        } else {
             setRoomSelection([...selectedRoomIds, roomId]);
        }
    } else {
        // Single select
        selectRoom(roomId);
    }
  };

  if (!sidebarOpen) {
    return (
        <aside
          className={cn(
            "relative flex flex-col border-r bg-muted/10 transition-all duration-200 ease-in-out w-[48px]",
            className
          )}
          data-testid="left-sidebar"
        >
             <div className="flex h-12 items-center justify-center border-b">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    aria-label="Expand sidebar"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
             </div>
             <div className="flex flex-col items-center py-4 gap-4">
                 <Button variant="ghost" size="icon" title="Rooms">
                    <Box className="h-5 w-5 text-muted-foreground" />
                 </Button>
                 {/* More icons could be added here */}
             </div>
        </aside>
    )
  }

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r bg-muted/10 transition-all duration-200 ease-in-out w-[280px]",
        className
      )}
      data-testid="left-sidebar"
    >
      <div className="flex h-12 items-center justify-between border-b px-2 bg-background">
        <span className="text-sm font-semibold pl-2">Navigation</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 ml-auto"
          onClick={toggleSidebar}
          aria-label="Collapse sidebar"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-2 border-b bg-background">
        <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search..."
                className="pl-8 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <SidebarSection title="Rooms" count={rooms.length} defaultOpen={true}>
            <div className="space-y-1">
                {filteredRooms.map(room => {
                    const isSelected = selectedRoomIds.includes(room.id);
                    return (
                        <div
                            key={room.id}
                            className={cn(
                                "flex items-center gap-2 p-2 rounded-md text-sm cursor-pointer hover:bg-muted transition-colors",
                                isSelected && "bg-accent text-accent-foreground"
                            )}
                            onClick={(e) => handleRoomClick(room.id, e)}
                            role="button"
                            aria-selected={isSelected}
                        >
                            <div
                                className="w-3 h-3 rounded-full border shadow-sm"
                                style={{ backgroundColor: room.color ?? '#ccc' }}
                            />
                            <span className="truncate flex-1">{room.name}</span>
                        </div>
                    );
                })}
                {filteredRooms.length === 0 && (
                    <div className="text-xs text-muted-foreground p-2 text-center">
                        {searchTerm ? "No matching rooms" : "No rooms"}
                    </div>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-muted-foreground hover:text-foreground mt-2"
                    onClick={() => addRoom()}
                >
                    <Plus className="mr-2 h-3 w-3" />
                    Add Room
                </Button>
            </div>
        </SidebarSection>

        <SidebarSection title="Walls" count={walls.length}>
             <div className="space-y-1">
                {walls.map(wall => (
                     <div
                        key={wall.id}
                        className={cn(
                            "flex items-center gap-2 p-2 rounded-md text-sm cursor-pointer hover:bg-muted transition-colors",
                            selectedWallId === wall.id && "bg-accent text-accent-foreground"
                        )}
                        onClick={() => selectWall(wall.id)}
                        role="button"
                    >
                        <span className="truncate flex-1">Wall {wall.id.slice(0, 4)}</span>
                    </div>
                ))}
                 {walls.length === 0 && (
                    <div className="text-xs text-muted-foreground p-2 text-center">
                        No walls
                    </div>
                )}
             </div>
        </SidebarSection>

        <SidebarSection title="Doors" count={doors.length}>
            <div className="space-y-1">
                 {doors.map(door => (
                     <div
                        key={door.id}
                        className={cn(
                            "flex items-center gap-2 p-2 rounded-md text-sm cursor-pointer hover:bg-muted transition-colors",
                            selectedDoorId === door.id && "bg-accent text-accent-foreground"
                        )}
                        onClick={() => selectDoor(door.id)}
                        role="button"
                    >
                        <DoorOpen className="h-3 w-3" />
                        <span className="truncate flex-1">Door {door.id.slice(0, 4)}</span>
                    </div>
                ))}
                {doors.length === 0 && (
                    <div className="text-xs text-muted-foreground p-2 text-center">
                        No doors
                    </div>
                )}
            </div>
        </SidebarSection>

        <SidebarSection title="Windows" count={windows.length}>
             <div className="space-y-1">
                 {windows.map(window => (
                     <div
                        key={window.id}
                        className={cn(
                            "flex items-center gap-2 p-2 rounded-md text-sm cursor-pointer hover:bg-muted transition-colors",
                            selectedWindowId === window.id && "bg-accent text-accent-foreground"
                        )}
                        onClick={() => selectWindow(window.id)}
                        role="button"
                    >
                        <Maximize className="h-3 w-3" />
                        <span className="truncate flex-1">Window {window.id.slice(0, 4)}</span>
                    </div>
                ))}
                 {windows.length === 0 && (
                    <div className="text-xs text-muted-foreground p-2 text-center">
                        No windows
                    </div>
                )}
            </div>
        </SidebarSection>

      </ScrollArea>
    </aside>
  );
}
