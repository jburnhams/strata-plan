import React, { useState } from 'react';
import { CanvasViewport } from './CanvasViewport';
import { RoomLayer } from './RoomLayer';
import { Grid } from './Grid';
import { ConnectionLines } from './ConnectionLines';
import { SelectionOverlay } from './SelectionOverlay';
import { SnapIndicator } from './SnapIndicator';
import { EditorToolbar } from './EditorToolbar';
import { Position2D } from '../../types';
import { useKeyboardSelection } from '../../hooks/useKeyboardSelection';

export function Canvas2D() {
  const [cursorPosition, setCursorPosition] = useState<Position2D | null>(null);

  // Enable keyboard selection/movement
  useKeyboardSelection();

  return (
    <div className="flex-1 h-full flex flex-col relative" data-testid="canvas-2d">
       <EditorToolbar />
       <CanvasViewport onCursorMove={setCursorPosition}>
          <Grid />
          <ConnectionLines />
          <SnapIndicator cursorPosition={cursorPosition} />
          <RoomLayer />
          <SelectionOverlay />
       </CanvasViewport>
    </div>
  );
}
