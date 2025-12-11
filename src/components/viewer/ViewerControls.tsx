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
  Layers
} from 'lucide-react';
import { CameraControlsRef } from './CameraControls';
import { useUIStore } from '@/stores/uiStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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

interface ViewerControlsProps {
  cameraControlsRef: React.RefObject<CameraControlsRef | null>;
}

export const ViewerControls: React.FC<ViewerControlsProps> = ({ cameraControlsRef }) => {
  const {
    showGrid, toggleGrid,
    showRoomLabels, toggleRoomLabels,
    viewerBrightness, setViewerBrightness,
    viewerShadowQuality, setViewerShadowQuality,
    viewerWallOpacity, setViewerWallOpacity
  } = useUIStore();

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

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
  }, [cameraControlsRef]);

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 bg-white/90 p-2 rounded-lg shadow-md border border-gray-200 z-10">
      <div className="flex gap-1" role="group" aria-label="Camera Presets">
        <Button
          variant="outline" size="icon"
          onClick={() => cameraControlsRef.current?.setPreset('isometric')}
          title="Isometric View (1)"
        >
          <Box className="h-4 w-4" />
        </Button>
        <Button
          variant="outline" size="icon"
          onClick={() => cameraControlsRef.current?.setPreset('top')}
          title="Top View (2)"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button
          variant="outline" size="icon"
          onClick={() => cameraControlsRef.current?.setPreset('front')}
          title="Front View (3)"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button
          variant="outline" size="icon"
          onClick={() => cameraControlsRef.current?.setPreset('side')}
          title="Side View (4)"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-1 justify-center border-t border-gray-200 pt-2" role="group" aria-label="Camera Controls">
         <Button
          variant="ghost" size="icon"
          onClick={() => cameraControlsRef.current?.zoomIn()}
          title="Zoom In (+)"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
         <Button
          variant="ghost" size="icon"
          onClick={() => cameraControlsRef.current?.zoomOut()}
          title="Zoom Out (-)"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost" size="icon"
          onClick={() => cameraControlsRef.current?.reset()}
          title="Reset View (R)"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

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

            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
