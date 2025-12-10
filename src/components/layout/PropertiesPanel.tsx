import React from 'react';
import { cn } from '../../lib/utils';
import { useUIStore } from '../../stores/uiStore';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { NoSelectionPanel } from '../properties/NoSelectionPanel';
import { RoomPropertiesPanel } from '../properties/RoomPropertiesPanel';

interface PropertiesPanelProps {
  className?: string;
}

export function PropertiesPanel({ className }: PropertiesPanelProps) {
  const { propertiesPanelOpen, togglePropertiesPanel } = useUIStore();
  const selectedRoomId = useFloorplanStore(state => state.selectedRoomId);
  const selectedWallId = useFloorplanStore(state => state.selectedWallId);
  const selectedDoorId = useFloorplanStore(state => state.selectedDoorId);
  const selectedWindowId = useFloorplanStore(state => state.selectedWindowId);

  if (!propertiesPanelOpen) return null;

  const renderContent = () => {
    if (selectedRoomId) {
      return <RoomPropertiesPanel />;
    }
    // TODO: Add Wall, Door, Window panels
    if (selectedWallId) {
      return <div className="p-4 text-center text-muted-foreground">Wall properties not implemented yet</div>;
    }
    if (selectedDoorId) {
      return <div className="p-4 text-center text-muted-foreground">Door properties not implemented yet</div>;
    }
    if (selectedWindowId) {
      return <div className="p-4 text-center text-muted-foreground">Window properties not implemented yet</div>;
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
