import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
} from '../ui/dropdown-menu';
import {
  Save,
  FolderOpen,
  FilePlus,
  Settings,
  HelpCircle,
  Box,
  Download,
  Grid,
  Ruler,
  Type,
  ZoomIn,
  ZoomOut,
  Maximize,
  Undo,
  Redo,
  Scissors,
  Copy,
  Clipboard,
  Trash2,
  MousePointer2,
  CheckSquare
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useUIStore } from '../../stores/uiStore';
import { useDialogStore } from '../../stores/dialogStore';

interface TopToolbarProps {
  className?: string;
}

export function TopToolbar({ className }: TopToolbarProps) {
  const {
    showGrid,
    showMeasurements,
    showRoomLabels,
    toggleGrid,
    toggleMeasurements,
    toggleRoomLabels,
    zoomIn,
    zoomOut,
    resetZoom,
    setMode,
  } = useUIStore();

  const openDialog = useDialogStore((state) => state.openDialog);

  return (
    <header
      className={cn(
        "h-12 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 justify-between",
        className
      )}
      data-testid="top-toolbar"
    >
      <div className="flex items-center gap-4">
        <div className="font-semibold text-sm mr-2">StrataPlan</div>

        {/* File Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8">File</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => openDialog('newProject')}>
              <FilePlus className="mr-2 h-4 w-4" />
              <span>New Project</span>
              <span className="ml-auto text-xs tracking-widest opacity-60">Ctrl+N</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Open project')}>
              <FolderOpen className="mr-2 h-4 w-4" />
              <span>Open Project...</span>
              <span className="ml-auto text-xs tracking-widest opacity-60">Ctrl+O</span>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <span>Recent Projects</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem disabled>No recent projects</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Save className="mr-2 h-4 w-4" />
              <span>Save</span>
              <span className="ml-auto text-xs tracking-widest opacity-60">Ctrl+S</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Save As...</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openDialog('import')}>
              <span>Import...</span>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <span>Export</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => openDialog('export', { format: 'json' })}>JSON</DropdownMenuItem>
                <DropdownMenuItem onClick={() => openDialog('export', { format: 'gltf' })}>glTF</DropdownMenuItem>
                <DropdownMenuItem onClick={() => openDialog('export', { format: 'pdf' })}>PDF</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openDialog('projectSettings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Project Settings</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Edit Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8">Edit</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem disabled>
              <Undo className="mr-2 h-4 w-4" />
              <span>Undo</span>
              <span className="ml-auto text-xs tracking-widest opacity-60">Ctrl+Z</span>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <Redo className="mr-2 h-4 w-4" />
              <span>Redo</span>
              <span className="ml-auto text-xs tracking-widest opacity-60">Ctrl+Y</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Scissors className="mr-2 h-4 w-4" />
              <span>Cut</span>
              <span className="ml-auto text-xs tracking-widest opacity-60">Ctrl+X</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy</span>
              <span className="ml-auto text-xs tracking-widest opacity-60">Ctrl+C</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Clipboard className="mr-2 h-4 w-4" />
              <span>Paste</span>
              <span className="ml-auto text-xs tracking-widest opacity-60">Ctrl+V</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Duplicate</span>
              <span className="ml-auto text-xs tracking-widest opacity-60">Ctrl+D</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
              <span className="ml-auto text-xs tracking-widest opacity-60">Del</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <CheckSquare className="mr-2 h-4 w-4" />
              <span>Select All</span>
              <span className="ml-auto text-xs tracking-widest opacity-60">Ctrl+A</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MousePointer2 className="mr-2 h-4 w-4" />
              <span>Deselect</span>
              <span className="ml-auto text-xs tracking-widest opacity-60">Esc</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8">View</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => setMode('table')}>
              <span>Table View</span>
              <span className="ml-auto text-xs tracking-widest opacity-60">Ctrl+1</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setMode('canvas')}>
              <span>2D Editor</span>
              <span className="ml-auto text-xs tracking-widest opacity-60">Ctrl+2</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setMode('view3d')}>
              <span>3D Preview</span>
              <span className="ml-auto text-xs tracking-widest opacity-60">Ctrl+3</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked={showGrid} onCheckedChange={toggleGrid}>
              <Grid className="mr-2 h-4 w-4" />
              <span>Show Grid</span>
              <span className="ml-auto text-xs tracking-widest opacity-60">G</span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={showMeasurements} onCheckedChange={toggleMeasurements}>
              <Ruler className="mr-2 h-4 w-4" />
              <span>Show Measurements</span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={showRoomLabels} onCheckedChange={toggleRoomLabels}>
              <Type className="mr-2 h-4 w-4" />
              <span>Show Room Labels</span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={zoomIn}>
              <ZoomIn className="mr-2 h-4 w-4" />
              <span>Zoom In</span>
              <span className="ml-auto text-xs tracking-widest opacity-60">+</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={zoomOut}>
              <ZoomOut className="mr-2 h-4 w-4" />
              <span>Zoom Out</span>
              <span className="ml-auto text-xs tracking-widest opacity-60">-</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={resetZoom}>
              <Maximize className="mr-2 h-4 w-4" />
              <span>Zoom to Fit</span>
              <span className="ml-auto text-xs tracking-widest opacity-60">0</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
         {/* Tool Buttons */}
         <Button size="sm" variant="default" className="h-8 gap-2">
            <Box className="h-4 w-4" />
            View 3D
         </Button>
         <Button size="sm" variant="outline" className="h-8 gap-2">
            <Download className="h-4 w-4" />
            Export
         </Button>

         <div className="w-px h-6 bg-border mx-2" />

         {/* Right Section */}
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="h-9 w-9">
            <HelpCircle className="h-[1.2rem] w-[1.2rem]" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => openDialog('projectSettings')}>
            <Settings className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </div>
    </header>
  );
}
