import React from 'react';
import { cn } from '../../lib/utils';
import { useUIStore } from '../../stores/uiStore';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { NoSelectionPanel } from '../properties/NoSelectionPanel';
import { RoomPropertiesPanel } from '../properties/RoomPropertiesPanel';
import { WallPropertiesPanel } from '../properties/WallPropertiesPanel';
import { DoorPropertiesPanel } from '../properties/DoorPropertiesPanel';
import { WindowPropertiesPanel } from '../properties/WindowPropertiesPanel';
import { MultiSelectionPanel } from '../properties/MultiSelectionPanel';

interface PropertiesPanelProps {
  className?: string;
}

export function PropertiesPanel({ className }: PropertiesPanelProps) {
  const { propertiesPanelOpen, togglePropertiesPanel } = useUIStore();
  const selectedRoomId = useFloorplanStore(state => state.selectedRoomId);
  const selectedRoomIds = useFloorplanStore(state => state.selectedRoomIds);
  const selectedWallId = useFloorplanStore(state => state.selectedWallId);
  const selectedDoorId = useFloorplanStore(state => state.selectedDoorId);
  const selectedWindowId = useFloorplanStore(state => state.selectedWindowId);

  if (!propertiesPanelOpen) return null;

  const renderContent = () => {
    // Priority: Multi-selection > Single Selection > No Selection
    if (selectedRoomIds && selectedRoomIds.length > 1) {
      return <MultiSelectionPanel />;
    }
    if (selectedRoomId) {
      return <RoomPropertiesPanel />;
    }
    if (selectedWallId) {
      return <WallPropertiesPanel />;
    }
    if (selectedDoorId) {
      return <DoorPropertiesPanel />;
    }
    if (selectedWindowId) {
      return <WindowPropertiesPanel />;
    }
    return <NoSelectionPanel />;
  };

  return (
    <aside
      className={cn(
        "flex w-[320px] flex-col border-l bg-background transition-all duration-200 ease-in-out",
        className
      )}
      data-testid="properties-panel"
    >
      <div className="flex h-12 items-center justify-between border-b px-4 shrink-0">
        <span className="text-sm font-semibold">Properties</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={togglePropertiesPanel}
          aria-label="Close properties panel"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          {renderContent()}
        </div>
      </ScrollArea>
    </aside>
  );
}
