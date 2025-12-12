import React, { useState } from 'react';
import { CanvasViewport } from './CanvasViewport';
import { RoomLayer } from './RoomLayer';
import { Grid } from './Grid';
import { ConnectionLines } from './ConnectionLines';
import { SelectionOverlay } from './SelectionOverlay';
import { MeasurementOverlay } from './MeasurementOverlay';
import { SnapIndicator } from './SnapIndicator';
import { WallOverlay, WallPreview } from './WallOverlay';
import { RoomCreationOverlay } from './RoomCreationOverlay';
import { DoorTool } from './DoorTool';
import { WindowTool } from './WindowTool';
import { EditorToolbar } from './EditorToolbar';
import { Position2D } from '../../types';
import { useKeyboardSelection } from '../../hooks/useKeyboardSelection';
import { useWallDrawing } from '../../hooks/useWallDrawing';
import { useToolStore } from '../../stores/toolStore';

export function Canvas2D() {
  const [cursorPosition, setCursorPosition] = useState<Position2D | null>(null);
  const activeTool = useToolStore((state) => state.activeTool);

  // Enable keyboard selection/movement
  useKeyboardSelection();

  // Wall Drawing Hook
  const { isDrawing, startPoint, currentPoint, handleMouseDown } = useWallDrawing();

  return (
    <div className="flex-1 h-full flex flex-col relative" data-testid="canvas-2d">
       <EditorToolbar />
       <CanvasViewport
          onCursorMove={setCursorPosition}
          onMouseDown={handleMouseDown}
       >
          <Grid />
          <WallOverlay />
          <ConnectionLines />
          <SnapIndicator cursorPosition={cursorPosition} />
          <RoomLayer />
          <RoomCreationOverlay />
          <WallPreview isDrawing={isDrawing} startPoint={startPoint} currentPoint={currentPoint} />
          <DoorTool cursorPosition={cursorPosition} />
          <WindowTool cursorPosition={cursorPosition} />
          <SelectionOverlay />
          <MeasurementOverlay />
       </CanvasViewport>
    </div>
  );
}
