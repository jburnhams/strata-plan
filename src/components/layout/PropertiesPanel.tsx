import React from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useFloorplanStore } from '@/stores/floorplanStore';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { NoSelectionPanel } from '@/components/properties/NoSelectionPanel';

export function PropertiesPanel() {
  const { propertiesPanelOpen, togglePropertiesPanel } = useUIStore();
  const { selectedRoomIds, selectedWallId, selectedDoorId, selectedWindowId } = useFloorplanStore();

  if (!propertiesPanelOpen) return null;

  let title = "Properties";
  let content = <NoSelectionPanel />;

  if (selectedRoomIds.length === 1) {
    title = "Room Properties";
    content = <div className="p-4 text-muted-foreground">Room Properties (Coming Soon)</div>;
  } else if (selectedRoomIds.length > 1) {
    title = "Multiple Selection";
    content = <div className="p-4 text-muted-foreground">Multi Selection (Coming Soon)</div>;
  } else if (selectedWallId) {
    title = "Wall Properties";
    content = <div className="p-4 text-muted-foreground">Wall Properties (Coming Soon)</div>;
  } else if (selectedDoorId) {
    title = "Door Properties";
    content = <div className="p-4 text-muted-foreground">Door Properties (Coming Soon)</div>;
  } else if (selectedWindowId) {
    title = "Window Properties";
    content = <div className="p-4 text-muted-foreground">Window Properties (Coming Soon)</div>;
  }

  return (
    <div className="w-[320px] border-l bg-background flex flex-col transition-all duration-200 z-10 h-full">
       <div className="h-12 border-b flex items-center justify-between px-4 shrink-0">
           <span className="font-semibold">{title}</span>
           <Button variant="ghost" size="icon" onClick={togglePropertiesPanel} className="h-8 w-8">
               <X size={16} />
           </Button>
       </div>
       <div className="flex-1 overflow-auto p-4">
           {content}
       </div>
    </div>
  );
}
