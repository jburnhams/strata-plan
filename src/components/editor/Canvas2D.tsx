import React from 'react';
import { CanvasViewport } from './CanvasViewport';
import { RoomLayer } from './RoomLayer';

export function Canvas2D() {
  return (
    <div className="flex-1 h-full flex flex-col relative" data-testid="canvas-2d">
       <CanvasViewport>
          <RoomLayer />
       </CanvasViewport>
    </div>
  );
}
