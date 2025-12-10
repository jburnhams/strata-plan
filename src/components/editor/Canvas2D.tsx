import React from 'react';
import { CanvasViewport } from './CanvasViewport';

export function Canvas2D() {
  return (
    <div className="flex-1 h-full flex flex-col relative" data-testid="canvas-2d">
       <CanvasViewport>
          {/* Room rendering will be added here in Task 4.3 */}
       </CanvasViewport>
    </div>
  );
}
