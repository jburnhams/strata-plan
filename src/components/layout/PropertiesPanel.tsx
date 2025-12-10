import React from 'react';
import { cn } from '../../lib/utils';
import { useUIStore } from '../../stores/uiStore';
import { ChevronRight, Settings2 } from 'lucide-react';
import { Button } from '../ui/button';

interface PropertiesPanelProps {
  className?: string;
}

export function PropertiesPanel({ className }: PropertiesPanelProps) {
  const { propertiesPanelOpen, togglePropertiesPanel } = useUIStore();

  if (!propertiesPanelOpen) return null;

  return (
    <aside
      className={cn(
        "flex w-[320px] flex-col border-l bg-muted/10 transition-all duration-200 ease-in-out",
        className
      )}
      data-testid="properties-panel"
    >
      <div className="flex h-12 items-center justify-between border-b px-4">
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
      <div className="flex-1 p-4">
        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground space-y-2 border-2 border-dashed rounded-lg">
          <Settings2 className="h-8 w-8" />
          <span className="text-sm">Select an item</span>
        </div>
      </div>
    </aside>
  );
}
