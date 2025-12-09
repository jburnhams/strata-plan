import React from 'react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function LeftSidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <div className={cn(
        "border-r bg-background transition-all duration-200 ease-in-out flex flex-col z-10",
        sidebarOpen ? "w-[280px]" : "w-[48px]"
    )}>
        <div className={cn("p-2 flex", sidebarOpen ? "justify-end" : "justify-center")}>
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
                {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </Button>
        </div>
        <div className="flex-1 overflow-auto">
            {sidebarOpen ? <div className="p-4">Left Sidebar</div> : null}
        </div>
    </div>
  );
}
