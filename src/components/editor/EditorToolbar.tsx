import React, { useEffect } from 'react';
import { useToolStore, ToolType } from '../../stores/toolStore';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import {
  MousePointer2,
  Hand,
  BrickWall,
  Ruler,
  DoorOpen,
  AppWindow
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface ToolButtonProps {
  tool: ToolType;
  icon: React.ReactNode;
  label: string;
  shortcut: string;
}

export function EditorToolbar() {
  const { activeTool, setTool } = useToolStore();

  // Keyboard shortcuts integration
  // We'll use a local effect for tool switching shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case 's': setTool('select'); break;
        case 'h': setTool('pan'); break;
        case 'w': setTool('wall'); break;
        case 'm': setTool('measure'); break;
        case 'd': setTool('door'); break;
        case 'n': setTool('window'); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setTool]);

  const ToolButton = ({ tool, icon, label, shortcut }: ToolButtonProps) => (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={activeTool === tool ? "default" : "ghost"}
            size="icon"
            onClick={() => setTool(tool)}
            className="h-9 w-9"
            aria-label={label}
            data-testid={`tool-${tool}`}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{label} <span className="text-xs text-muted-foreground ml-1">({shortcut})</span></p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="absolute top-4 left-4 flex flex-col gap-1 p-1 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-md shadow-sm z-10" data-testid="editor-toolbar">
      <ToolButton tool="select" icon={<MousePointer2 className="h-4 w-4" />} label="Select" shortcut="S" />
      <ToolButton tool="pan" icon={<Hand className="h-4 w-4" />} label="Pan" shortcut="H" />
      <Separator className="my-1" />
      <ToolButton tool="wall" icon={<BrickWall className="h-4 w-4" />} label="Draw Walls" shortcut="W" />
      <ToolButton tool="measure" icon={<Ruler className="h-4 w-4" />} label="Measure" shortcut="M" />
      <Separator className="my-1" />
      <ToolButton tool="door" icon={<DoorOpen className="h-4 w-4" />} label="Door" shortcut="D" />
      <ToolButton tool="window" icon={<AppWindow className="h-4 w-4" />} label="Window" shortcut="N" />
    </div>
  );
}
