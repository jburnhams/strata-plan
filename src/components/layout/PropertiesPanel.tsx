import React from 'react';
import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function PropertiesPanel() {
  const { propertiesPanelOpen, togglePropertiesPanel } = useUIStore();

  if (!propertiesPanelOpen) return null;

  return (
    <div className="w-[320px] border-l bg-background flex flex-col transition-all duration-200 z-10">
       <div className="h-12 border-b flex items-center justify-between px-4">
           <span className="font-semibold">Properties</span>
           <Button variant="ghost" size="icon" onClick={togglePropertiesPanel} className="h-8 w-8">
               <X size={16} />
           </Button>
       </div>
       <div className="flex-1 overflow-auto p-4">
           Properties Panel Content
       </div>
    </div>
  );
}
