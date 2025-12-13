import React, { useState } from 'react';
import { Menu, LayoutGrid, Maximize, Cuboid, MoreHorizontal, Settings, FileDown, FolderOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { useUIStore } from '../../stores/uiStore';
import { useFloorplanStore } from '../../stores/floorplanStore';

interface MobileLayoutProps {
  children?: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const { mode, setMode } = useUIStore();
  const { currentFloorplan } = useFloorplanStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      {/* Mobile Header */}
      <div className="flex items-center justify-between px-4 h-12 border-b bg-background shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setDrawerOpen(true)}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-sm truncate max-w-[150px]">
            {currentFloorplan?.name || 'StrataPlan'}
          </span>
        </div>

        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More options">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden bg-background">
        {children}
      </main>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-around h-14 border-t bg-background shrink-0 pb-safe">
        <Button
          variant={mode === 'table' ? 'default' : 'ghost'}
          size="sm"
          className="flex flex-col items-center gap-1 h-auto py-1 px-2"
          onClick={() => setMode('table')}
        >
          <LayoutGrid className="h-5 w-5" />
          <span className="text-[10px]">Table</span>
        </Button>

        <Button
          variant={mode === 'canvas' ? 'default' : 'ghost'}
          size="sm"
          className="flex flex-col items-center gap-1 h-auto py-1 px-2"
          onClick={() => setMode('canvas')}
        >
          <Maximize className="h-5 w-5" />
          <span className="text-[10px]">2D</span>
        </Button>

        <Button
          variant={mode === 'view3d' ? 'default' : 'ghost'}
          size="sm"
          className="flex flex-col items-center gap-1 h-auto py-1 px-2"
          onClick={() => setMode('view3d')}
        >
          <Cuboid className="h-5 w-5" />
          <span className="text-[10px]">3D</span>
        </Button>
      </div>

      {/* Side Drawer (using Dialog) */}
      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogContent
          className="fixed left-0 top-0 z-50 h-full w-[80%] max-w-[300px] gap-4 border-r bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:rounded-none"
          aria-describedby={undefined}
        >
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 font-bold text-lg">
              <span className="text-primary">StrataPlan</span>
            </div>

            <div className="flex flex-col gap-2">
              <Button variant="ghost" className="justify-start gap-2">
                <FolderOpen className="h-4 w-4" />
                Projects
              </Button>
              <Button variant="ghost" className="justify-start gap-2">
                <FileDown className="h-4 w-4" />
                Export
              </Button>
              <Button variant="ghost" className="justify-start gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
