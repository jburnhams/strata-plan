import React from 'react';
import { CanvasViewport } from './CanvasViewport';
import { Grid } from './Grid';

export function Canvas2D() {
  return (
    <div className="flex-1 h-full flex flex-col relative" data-testid="canvas-2d">
       <CanvasViewport>
          <Grid />
          {/* Room rendering will be added here in Task 4.3 */}
       </CanvasViewport>
    </div>
  );
}
