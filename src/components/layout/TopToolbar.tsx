import React from 'react';
import {
  FileText,
  FolderOpen,
  Save,
  Undo,
  Redo,
  Scissors,
  Copy,
  Clipboard,
  Trash,
  Grid,
  Maximize,
  ZoomIn,
  ZoomOut,
  Settings,
  HelpCircle,
  Box,
  Table,
  LayoutGrid,
  Cuboid,
  ChevronDown,
  Download,
  Upload,
  Plus,
  Moon,
  Sun,
  Laptop
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { useUIStore } from '@/stores/uiStore';
import { useFloorplanStore } from '@/stores/floorplanStore';
import { cn } from '@/lib/utils';

export function TopToolbar() {
  const {
    showGrid, toggleGrid,
    showMeasurements, toggleMeasurements,
    showRoomLabels, toggleRoomLabels,
    zoomIn, zoomOut, resetZoom,
    theme, setTheme
  } = useUIStore();

  const {
    isDirty
    // We would use undo/redo availability from store here
  } = useFloorplanStore();

  // Placeholder state for features not yet implemented
  const canUndo = false;
  const canRedo = false;
  const hasSelection = false;

  return (
    <div className="h-12 border-b flex items-center px-4 justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" data-testid="top-toolbar">
      <div className="flex items-center gap-2">
        <div className="font-bold flex items-center gap-2 mr-4">
          <Cuboid className="h-6 w-6 text-primary" />
          <span>StrataPlan</span>
        </div>

        {/* File Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 data-[state=open]:bg-accent">
              File
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" />
              <span>New Project</span>
              <DropdownMenuShortcut>Ctrl+N</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FolderOpen className="mr-2 h-4 w-4" />
              <span>Open Project</span>
              <DropdownMenuShortcut>Ctrl+O</DropdownMenuShortcut>
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
            <DropdownMenuItem disabled={!isDirty}>
              <Save className="mr-2 h-4 w-4" />
              <span>Save</span>
              <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Save As...</span>
              <DropdownMenuShortcut>Ctrl+Shift+S</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Upload className="mr-2 h-4 w-4" />
              <span>Import...</span>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Download className="mr-2 h-4 w-4" />
                <span>Export</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>JSON</DropdownMenuItem>
                <DropdownMenuItem>glTF (3D Model)</DropdownMenuItem>
                <DropdownMenuItem>PDF (Document)</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Project Settings</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Edit Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 data-[state=open]:bg-accent">
              Edit
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem disabled={!canUndo}>
              <Undo className="mr-2 h-4 w-4" />
              <span>Undo</span>
              <DropdownMenuShortcut>Ctrl+Z</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!canRedo}>
              <Redo className="mr-2 h-4 w-4" />
              <span>Redo</span>
              <DropdownMenuShortcut>Ctrl+Y</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={!hasSelection}>
              <Scissors className="mr-2 h-4 w-4" />
              <span>Cut</span>
              <DropdownMenuShortcut>Ctrl+X</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!hasSelection}>
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy</span>
              <DropdownMenuShortcut>Ctrl+C</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Clipboard className="mr-2 h-4 w-4" />
              <span>Paste</span>
              <DropdownMenuShortcut>Ctrl+V</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!hasSelection}>
              <Copy className="mr-2 h-4 w-4" />
              <span>Duplicate</span>
              <DropdownMenuShortcut>Ctrl+D</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!hasSelection}>
              <Trash className="mr-2 h-4 w-4" />
              <span>Delete</span>
              <DropdownMenuShortcut>Del</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span>Select All</span>
              <DropdownMenuShortcut>Ctrl+A</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!hasSelection}>
              <span>Deselect</span>
              <DropdownMenuShortcut>Esc</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 data-[state=open]:bg-accent">
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem>
              <Table className="mr-2 h-4 w-4" />
              <span>Table View</span>
              <DropdownMenuShortcut>Ctrl+1</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LayoutGrid className="mr-2 h-4 w-4" />
              <span>2D Editor</span>
              <DropdownMenuShortcut>Ctrl+2</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Box className="mr-2 h-4 w-4" />
              <span>3D Preview</span>
              <DropdownMenuShortcut>Ctrl+3</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={toggleGrid}>
              <Grid className="mr-2 h-4 w-4" />
              <span>Toggle Grid</span>
              {showGrid && <span className="ml-auto text-xs">✓</span>}
              <DropdownMenuShortcut>G</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleMeasurements}>
              <span>Toggle Measurements</span>
              {showMeasurements && <span className="ml-auto text-xs">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleRoomLabels}>
              <span>Toggle Room Labels</span>
              {showRoomLabels && <span className="ml-auto text-xs">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={zoomIn}>
              <ZoomIn className="mr-2 h-4 w-4" />
              <span>Zoom In</span>
              <DropdownMenuShortcut>+</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={zoomOut}>
              <ZoomOut className="mr-2 h-4 w-4" />
              <span>Zoom Out</span>
              <DropdownMenuShortcut>-</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={resetZoom}>
              <Maximize className="mr-2 h-4 w-4" />
              <span>Zoom to Fit</span>
              <DropdownMenuShortcut>0</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                 {theme === 'light' ? <Sun className="mr-2 h-4 w-4"/> :
                  theme === 'dark' ? <Moon className="mr-2 h-4 w-4"/> :
                  <Laptop className="mr-2 h-4 w-4"/>}
                 <span>Theme</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-4 w-px bg-border mx-2" />

        {/* Tool Buttons */}
        <Button size="sm" className="gap-2">
           <Box className="h-4 w-4" />
           View 3D
        </Button>
        <DropdownMenu>
           <DropdownMenuTrigger asChild>
             <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
                <ChevronDown className="h-3 w-3 opacity-50" />
             </Button>
           </DropdownMenuTrigger>
           <DropdownMenuContent>
                <DropdownMenuItem>JSON Project</DropdownMenuItem>
                <DropdownMenuItem>glTF 3D Model</DropdownMenuItem>
                <DropdownMenuItem>PDF Document</DropdownMenuItem>
           </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
         <ThemeToggle />
         <Button variant="ghost" size="icon" title="Help">
            <HelpCircle className="h-4 w-4" />
         </Button>
         <Button variant="ghost" size="icon" title="Settings">
            <Settings className="h-4 w-4" />
         </Button>
      </div>
    </div>
  );
}
