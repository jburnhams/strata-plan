import React, { useEffect, useState } from 'react';
import { cn, formatRelativeTime } from '../../lib/utils';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { useUIStore } from '../../stores/uiStore';
import {
  Cloud,
  Loader2,
  AlertCircle,
  Circle,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../ui/tooltip';

interface StatusBarProps {
  className?: string;
}

export function StatusBar({ className }: StatusBarProps) {
  const currentFloorplan = useFloorplanStore((state) => state.currentFloorplan);
  const selectedRoomId = useFloorplanStore((state) => state.selectedRoomId);
  const selectedWallId = useFloorplanStore((state) => state.selectedWallId);
  const selectedDoorId = useFloorplanStore((state) => state.selectedDoorId);
  const selectedWindowId = useFloorplanStore((state) => state.selectedWindowId);

  const saveStatus = useUIStore((state) => state.saveStatus);
  const lastSaveTime = useUIStore((state) => state.lastSaveTime);
  const zoomLevel = useUIStore((state) => state.zoomLevel);

  // Force re-render every minute to update relative time
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const getSelectionText = () => {
    if (selectedRoomId) return "Room selected";
    if (selectedWallId) return "Wall selected";
    if (selectedDoorId) return "Door selected";
    if (selectedWindowId) return "Window selected";
    return "Ready";
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saved':
        return <Cloud className="h-3 w-3 text-green-500" />;
      case 'saving':
        return <Loader2 className="h-3 w-3 animate-spin text-blue-500" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-destructive" />;
      case 'unsaved':
        return <Circle className="h-3 w-3 text-amber-500 fill-amber-500" />;
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saved': return "Saved";
      case 'saving': return "Saving...";
      case 'error': return "Error";
      case 'unsaved': return "Unsaved changes";
    }
  };

  const lastSaveTimeDate = lastSaveTime ? new Date(lastSaveTime) : null;

  return (
    <footer
      className={cn(
        "h-6 border-t bg-muted/50 flex items-center px-4 text-[10px] text-muted-foreground justify-between select-none",
        className
      )}
      data-testid="status-bar"
    >
      {/* Left Section: Project Info & Selection */}
      <div className="flex items-center space-x-4">
        <div className="font-medium text-foreground truncate max-w-[200px]" title={currentFloorplan?.name}>
          {currentFloorplan?.name || "Untitled Project"}
        </div>
        <div className="w-px h-3 bg-border" />
        <div>{getSelectionText()}</div>
      </div>

      {/* Center Section: Mouse Coordinates */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
        {/* Placeholder for mouse coordinates */}
        <span>X: 0.00m, Z: 0.00m</span>
      </div>

      {/* Right Section: Status, Time, Zoom */}
      <div className="flex items-center space-x-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-1.5 cursor-help">
              {getSaveStatusIcon()}
              <span>{getSaveStatusText()}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
             <p>{saveStatus === 'saved' && lastSaveTimeDate ? `Last saved at ${lastSaveTimeDate.toLocaleTimeString()}` : getSaveStatusText()}</p>
          </TooltipContent>
        </Tooltip>

        {lastSaveTimeDate && (
            <span className="hidden sm:inline-block">
                {formatRelativeTime(lastSaveTimeDate)}
            </span>
        )}

        <div className="w-px h-3 bg-border" />

        <Tooltip>
             <TooltipTrigger asChild>
                <div className="min-w-[40px] text-right cursor-help">
                    {Math.round(zoomLevel * 100)}%
                </div>
             </TooltipTrigger>
             <TooltipContent side="top">
                 <p>Zoom Level</p>
             </TooltipContent>
        </Tooltip>
      </div>
    </footer>
  );
}
