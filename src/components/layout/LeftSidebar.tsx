import React from 'react';
import { cn } from '../../lib/utils';
import { useUIStore } from '../../stores/uiStore';
import { ChevronLeft, ChevronRight, LayoutDashboard } from 'lucide-react';
import { Button } from '../ui/button';

interface LeftSidebarProps {
  className?: string;
}

export function LeftSidebar({ className }: LeftSidebarProps) {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r bg-muted/10 transition-all duration-200 ease-in-out",
        sidebarOpen ? "w-[280px]" : "w-[48px]",
        className
      )}
      data-testid="left-sidebar"
    >
      <div className="flex h-12 items-center justify-between border-b px-2">
        {sidebarOpen && <span className="text-sm font-semibold pl-2">Navigation</span>}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 ml-auto"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
      <div className="flex-1 py-2">
        {/* Placeholder content */}
        {!sidebarOpen && (
          <div className="flex justify-center py-2">
            <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        {sidebarOpen && (
           <div className="px-4 py-2 text-sm text-muted-foreground">
             Sidebar Content
           </div>
        )}
      </div>
    </aside>
  );
}
