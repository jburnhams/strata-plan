import React, { useState } from 'react';
import { CanvasViewport } from './CanvasViewport';
import { RoomLayer } from './RoomLayer';
import { Grid } from './Grid';
import { ConnectionLines } from './ConnectionLines';
import { SelectionOverlay } from './SelectionOverlay';
import { MeasurementOverlay } from './MeasurementOverlay';
import { SnapIndicator } from './SnapIndicator';
import { WallOverlay, WallPreview } from './WallOverlay';
import { DoorTool } from './DoorTool';
import { EditorToolbar } from './EditorToolbar';
import { Position2D } from '../../types';
import { useKeyboardSelection } from '../../hooks/useKeyboardSelection';
import { useWallDrawing } from '../../hooks/useWallDrawing';
import { useToolStore } from '../../stores/toolStore';

export function Canvas2D() {
  const [cursorPosition, setCursorPosition] = useState<Position2D | null>(null);
  const activeTool = useToolStore((state) => state.activeTool);

  // Enable keyboard selection/movement (only when select tool is active?)
  // useKeyboardSelection usually checks for internal state or selection,
  // but we might want to disable it when drawing walls.
  useKeyboardSelection();

  // Wall Drawing Hook
  const { isDrawing, startPoint, currentPoint, handleMouseDown } = useWallDrawing();

  // We need to pass the mouseDown handler to CanvasViewport or attach it to a layer that covers everything.
  // CanvasViewport handles pan/zoom on drag.
  // If we are in 'wall' mode, we might want to override pan (or use Middle Click for pan).
  // CanvasViewport usually passes down children.
  // We can attach `onMouseDown` to the container inside CanvasViewport if we had access,
  // or wrap the inner content in a full-size rect for events?
  // Currently CanvasViewport handles its own events.
  // Let's check CanvasViewport implementation.

  return (
    <div className="flex-1 h-full flex flex-col relative" data-testid="canvas-2d">
       <EditorToolbar />
       <CanvasViewport
          onCursorMove={setCursorPosition}
          onMouseDown={handleMouseDown}
          // We need CanvasViewport to accept onMouseDown and call it if not panning?
          // Or we pass it to a transparent overlay layer inside?
       >
          <Grid />
          <WallOverlay />
          <ConnectionLines />
          <SnapIndicator cursorPosition={cursorPosition} />
          <RoomLayer />
          <WallPreview isDrawing={isDrawing} startPoint={startPoint} currentPoint={currentPoint} />
          <DoorTool cursorPosition={cursorPosition} />
          <SelectionOverlay />
          <MeasurementOverlay />
       </CanvasViewport>
    </div>
  );
}
