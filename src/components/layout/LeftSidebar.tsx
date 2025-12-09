import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { useFloorplanStore } from '@/stores/floorplanStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, Search, Plus, Box, Square, DoorOpen, AppWindow } from 'lucide-react';
import { SidebarSection } from './SidebarSection';
import { useDebounce } from '@/hooks/useDebounce';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { Room } from '@/types';

export function LeftSidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const {
    currentFloorplan,
    selectRoom,
    selectWall,
    selectDoor,
    selectWindow,
    selectedRoomId,
    selectedWallId,
    selectedDoorId,
    selectedWindowId,
    addRoom,
    updateRoom,
    deleteRoom
  } = useFloorplanStore();

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Derived state for filtering
  const filteredRooms = useMemo(() => {
    if (!currentFloorplan) return [];
    if (!debouncedSearchQuery) return currentFloorplan.rooms;
    return currentFloorplan.rooms.filter(r => r.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
  }, [currentFloorplan, debouncedSearchQuery]);

  const filteredWalls = useMemo(() => {
     if (!currentFloorplan) return [];
     if (!debouncedSearchQuery) return currentFloorplan.walls;
     return currentFloorplan.walls.filter(w => w.id.includes(debouncedSearchQuery));
  }, [currentFloorplan, debouncedSearchQuery]);

    const filteredDoors = useMemo(() => {
     if (!currentFloorplan) return [];
     if (!debouncedSearchQuery) return currentFloorplan.doors;
     return currentFloorplan.doors.filter(d => d.id.includes(debouncedSearchQuery));
  }, [currentFloorplan, debouncedSearchQuery]);

    const filteredWindows = useMemo(() => {
     if (!currentFloorplan) return [];
     if (!debouncedSearchQuery) return currentFloorplan.windows;
     return currentFloorplan.windows.filter(w => w.id.includes(debouncedSearchQuery));
  }, [currentFloorplan, debouncedSearchQuery]);

  // Handler for adding a room
  const handleAddRoom = () => {
    addRoom({
        name: `Room ${currentFloorplan ? currentFloorplan.rooms.length + 1 : 1}`,
        length: 4,
        width: 3,
        height: 2.4,
        type: 'living',
        position: { x: 0, z: 0 },
        rotation: 0,
    });
  };

  const handleRenameRoom = (id: string, currentName: string) => {
    const newName = window.prompt("Enter new room name:", currentName);
    if (newName && newName !== currentName) {
        updateRoom(id, { name: newName });
    }
  };

  const handleDuplicateRoom = (room: Room) => {
    const { id, ...roomData } = room;
    addRoom({
        ...roomData,
        name: `${room.name} (Copy)`,
        position: { x: room.position.x + 1, z: room.position.z + 1 } // Offset slightly
    });
  };

  return (
    <div className={cn(
        "border-r bg-background transition-all duration-200 ease-in-out flex flex-col z-10",
        sidebarOpen ? "w-[280px]" : "w-[48px]"
    )}>
        {/* Header / Search */}
        <div className="p-2 border-b">
            {sidebarOpen ? (
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            className="pl-8 h-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                     <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-9 w-9 shrink-0">
                        <ChevronLeft size={16} />
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2">
                     <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
                        <ChevronRight size={16} />
                    </Button>
                    <Search size={16} className="text-muted-foreground" />
                </div>
            )}
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
            {sidebarOpen ? (
                <div className="flex flex-col pb-4">
                    {/* Rooms */}
                    <SidebarSection title="Rooms" count={filteredRooms.length}>
                        {filteredRooms.map(room => (
                            <ContextMenu key={room.id}>
                                <ContextMenuTrigger>
                                    <div
                                        className={cn(
                                            "px-4 py-2 text-sm cursor-pointer hover:bg-muted flex items-center gap-2",
                                            selectedRoomId === room.id && "bg-accent text-accent-foreground"
                                        )}
                                        onClick={() => selectRoom(room.id)}
                                    >
                                        <div className="w-3 h-3 rounded-sm bg-blue-500" /> {/* Color swatch placeholder */}
                                        <span className="flex-1 truncate">{room.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {(room.length * room.width).toFixed(1)}m²
                                        </span>
                                    </div>
                                </ContextMenuTrigger>
                                <ContextMenuContent>
                                    <ContextMenuItem onClick={() => handleRenameRoom(room.id, room.name)}>
                                        Rename
                                    </ContextMenuItem>
                                    <ContextMenuItem onClick={() => handleDuplicateRoom(room)}>
                                        Duplicate
                                    </ContextMenuItem>
                                    <ContextMenuSeparator />
                                    <ContextMenuItem onClick={() => deleteRoom(room.id)} className="text-red-600 focus:text-red-600">
                                        Delete
                                    </ContextMenuItem>
                                </ContextMenuContent>
                            </ContextMenu>
                        ))}
                         <div className="p-2">
                            <Button variant="outline" size="sm" className="w-full gap-2" onClick={handleAddRoom}>
                                <Plus size={14} /> Add Room
                            </Button>
                        </div>
                    </SidebarSection>

                    {/* Walls */}
                     <SidebarSection title="Walls" count={filteredWalls.length}>
                        {filteredWalls.map(wall => (
                            <div
                                key={wall.id}
                                className={cn(
                                    "px-4 py-2 text-sm cursor-pointer hover:bg-muted flex items-center gap-2",
                                    selectedWallId === wall.id && "bg-accent text-accent-foreground"
                                )}
                                onClick={() => selectWall(wall.id)}
                            >
                                <Square size={14} />
                                <span className="flex-1 truncate">Wall {wall.id.slice(0, 4)}</span>
                            </div>
                        ))}
                    </SidebarSection>

                    {/* Doors */}
                     <SidebarSection title="Doors" count={filteredDoors.length}>
                        {filteredDoors.map(door => (
                            <div
                                key={door.id}
                                className={cn(
                                    "px-4 py-2 text-sm cursor-pointer hover:bg-muted flex items-center gap-2",
                                     selectedDoorId === door.id && "bg-accent text-accent-foreground"
                                )}
                                onClick={() => selectDoor(door.id)}
                            >
                                <DoorOpen size={14} />
                                <span className="flex-1 truncate">Door {door.id.slice(0, 4)}</span>
                            </div>
                        ))}
                    </SidebarSection>

                     {/* Windows */}
                     <SidebarSection title="Windows" count={filteredWindows.length}>
                        {filteredWindows.map(window => (
                            <div
                                key={window.id}
                                className={cn(
                                    "px-4 py-2 text-sm cursor-pointer hover:bg-muted flex items-center gap-2",
                                     selectedWindowId === window.id && "bg-accent text-accent-foreground"
                                )}
                                onClick={() => selectWindow(window.id)}
                            >
                                <AppWindow size={14} />
                                <span className="flex-1 truncate">Window {window.id.slice(0, 4)}</span>
                            </div>
                        ))}
                    </SidebarSection>
                </div>
            ) : (
                <div className="flex flex-col items-center py-4 gap-4">
                    {/* Collapsed icons */}
                    <div title="Rooms" className="relative">
                        <Box size={20} />
                        <span className="absolute -top-1 -right-1 text-[10px] bg-primary text-primary-foreground w-4 h-4 rounded-full flex items-center justify-center">
                            {filteredRooms.length}
                        </span>
                    </div>
                     <div title="Walls" className="relative">
                        <Square size={20} />
                    </div>
                     <div title="Doors" className="relative">
                        <DoorOpen size={20} />
                    </div>
                     <div title="Windows" className="relative">
                        <AppWindow size={20} />
                    </div>
                </div>
            )}
        </ScrollArea>
    </div>
  );
}
