import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Box,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Settings,
  Grid,
  Type,
  Sun,
  Layers,
  User,
  Download,
  Maximize,
  HelpCircle,
  FileImage,
  FileBox,
  Palette,
} from 'lucide-react';
import { CameraControlsRef } from './CameraControls';
import { useUIStore, MaterialQuality } from '@/stores/uiStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ViewerControlsProps {
  cameraControlsRef: React.RefObject<CameraControlsRef | null>;
  isFirstPerson?: boolean;
  onToggleFirstPerson?: () => void;
  onTakeScreenshot?: () => void;
  onExportGLTF?: () => void;
  onToggleFullscreen?: () => void;
}

export const ViewerControls: React.FC<ViewerControlsProps> = ({
  cameraControlsRef,
  isFirstPerson = false,
  onToggleFirstPerson,
  onTakeScreenshot,
  onExportGLTF,
  onToggleFullscreen,
}) => {
  const {
    showGrid, toggleGrid,
    showRoomLabels, toggleRoomLabels,
    viewerBrightness, setViewerBrightness,
    viewerShadowQuality, setViewerShadowQuality,
    viewerWallOpacity, setViewerWallOpacity,
    materialQuality, setMaterialQuality
  } = useUIStore();

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // If in first person mode, ignore camera preset shortcuts
      if (isFirstPerson) return;

      if (!cameraControlsRef.current) return;

      switch (e.key) {
        case 'ArrowUp':
          // Optional: we could map arrows to rotate if CameraControls supports it
          break;
        case '+':
        case '=':
          cameraControlsRef.current.zoomIn();
          break;
        case '-':
        case '_':
          cameraControlsRef.current.zoomOut();
          break;
        case 'r':
        case 'R':
          cameraControlsRef.current.reset();
          break;
        case '1':
          cameraControlsRef.current.setPreset('isometric');
          break;
        case '2':
          cameraControlsRef.current.setPreset('top');
          break;
        case '3':
          cameraControlsRef.current.setPreset('front');
          break;
        case '4':
          cameraControlsRef.current.setPreset('side');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cameraControlsRef, isFirstPerson]);

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 bg-white/90 p-2 rounded-lg shadow-md border border-gray-200 z-10">
      <div className="flex gap-1" role="group" aria-label="Camera Presets">
        <Button
          variant={isFirstPerson ? "secondary" : "outline"}
          size="icon"
          onClick={onToggleFirstPerson}
          title={isFirstPerson ? "Exit First Person" : "First Person Walk"}
          className={isFirstPerson ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : ""}
        >
          <User className="h-4 w-4" />
        </Button>
        <div className="w-px h-8 bg-gray-200 mx-1" />
        <Button
          variant="outline" size="icon"
          onClick={() => cameraControlsRef.current?.setPreset('isometric')}
          title="Isometric View (1)"
          disabled={isFirstPerson}
        >
          <Box className="h-4 w-4" />
        </Button>
        <Button
          variant="outline" size="icon"
          onClick={() => cameraControlsRef.current?.setPreset('top')}
          title="Top View (2)"
          disabled={isFirstPerson}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button
          variant="outline" size="icon"
          onClick={() => cameraControlsRef.current?.setPreset('front')}
          title="Front View (3)"
          disabled={isFirstPerson}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button
          variant="outline" size="icon"
          onClick={() => cameraControlsRef.current?.setPreset('side')}
          title="Side View (4)"
          disabled={isFirstPerson}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-1 justify-center border-t border-gray-200 pt-2" role="group" aria-label="Camera Controls">
         <Button
          variant="ghost" size="icon"
          onClick={() => cameraControlsRef.current?.zoomIn()}
          title="Zoom In (+)"
          disabled={isFirstPerson}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
         <Button
          variant="ghost" size="icon"
          onClick={() => cameraControlsRef.current?.zoomOut()}
          title="Zoom Out (-)"
          disabled={isFirstPerson}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost" size="icon"
          onClick={() => cameraControlsRef.current?.reset()}
          title="Reset View (R)"
          disabled={isFirstPerson}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        {/* Download Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title="Export">
              <Download className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Export</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onTakeScreenshot}>
              <FileImage className="mr-2 h-4 w-4" />
              Screenshot (PNG)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportGLTF}>
              <FileBox className="mr-2 h-4 w-4" />
              Export Model (glTF)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost" size="icon"
          onClick={onToggleFullscreen}
          title="Toggle Fullscreen"
        >
          <Maximize className="h-4 w-4" />
        </Button>

        {/* Help Dialog */}
        <Dialog>
          <DialogTrigger asChild>
             <Button variant="ghost" size="icon" title="Help">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>3D Viewer Controls</DialogTitle>
              <DialogDescription>
                How to navigate your floorplan in 3D.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="font-semibold">Orbit Mode (Default)</div>
                <div></div>
                <div className="text-sm text-muted-foreground">Rotate</div>
                <div className="text-sm">Left Click + Drag</div>
                <div className="text-sm text-muted-foreground">Pan</div>
                <div className="text-sm">Right Click + Drag</div>
                <div className="text-sm text-muted-foreground">Zoom</div>
                <div className="text-sm">Mouse Wheel / Pinch</div>
              </div>
              <DialogDescription className="mt-4 border-t pt-4">
                <span className="font-semibold block mb-2">First Person Mode</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-muted-foreground">Move</div>
                  <div className="text-sm">W, A, S, D</div>
                  <div className="text-sm text-muted-foreground">Look</div>
                  <div className="text-sm">Mouse Movement</div>
                  <div className="text-sm text-muted-foreground">Run</div>
                  <div className="text-sm">Hold Shift</div>
                  <div className="text-sm text-muted-foreground">Exit</div>
                  <div className="text-sm">ESC</div>
                </div>
              </DialogDescription>
            </div>
          </DialogContent>
        </Dialog>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title="View Settings">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end">
            <DropdownMenuLabel>View Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <div className="p-2 space-y-4">
              {/* Toggles */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Grid className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="show-grid" className="text-sm">Show Grid</Label>
                </div>
                <Switch
                  id="show-grid"
                  checked={showGrid}
                  onCheckedChange={toggleGrid}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="show-labels" className="text-sm">Room Labels</Label>
                </div>
                <Switch
                  id="show-labels"
                  checked={showRoomLabels}
                  onCheckedChange={toggleRoomLabels}
                />
              </div>

              <DropdownMenuSeparator />

              {/* Sliders */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">Brightness</Label>
                  </div>
                  <span className="text-xs text-muted-foreground">{Math.round(viewerBrightness * 100)}%</span>
                </div>
                <Slider
                  value={[viewerBrightness]}
                  min={0}
                  max={2}
                  step={0.1}
                  onValueChange={(val) => setViewerBrightness(val[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">Wall Opacity</Label>
                  </div>
                  <span className="text-xs text-muted-foreground">{Math.round(viewerWallOpacity * 100)}%</span>
                </div>
                <Slider
                  value={[viewerWallOpacity]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={(val) => setViewerWallOpacity(val[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                   <Label className="text-sm">Shadow Quality</Label>
                </div>
                <Select
                  value={viewerShadowQuality}
                  onValueChange={(val: any) => setViewerShadowQuality(val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Off (Fastest)</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High (Best)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                   <Palette className="h-4 w-4 text-muted-foreground" />
                   <Label className="text-sm">Material Quality</Label>
                </div>
                <Select
                  value={materialQuality}
                  onValueChange={(val: any) => setMaterialQuality(val as MaterialQuality)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple (Fastest)</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="detailed">Detailed (Best)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
