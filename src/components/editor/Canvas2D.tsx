import React, { useRef, useState, useEffect } from 'react';
import { CanvasViewport } from './CanvasViewport';
import { Grid } from './Grid';
import { Ruler } from './Ruler';
import { SnapIndicator } from './SnapIndicator';
import { RoomLayer } from './RoomLayer';
import { SelectionOverlay } from './SelectionOverlay';
import { useRoomInteraction } from '../../hooks/useRoomInteraction';

export function Canvas2D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mousePos, setMousePos] = useState<{x: number, y: number} | null>(null);

  const { onContainerMouseDown, onRoomMouseDown, selectionBox } = useRoomInteraction(dimensions, containerRef);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      setDimensions({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    }
  };

  const handleMouseLeave = () => {
    setMousePos(null);
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 h-full flex flex-col relative overflow-hidden"
      data-testid="canvas-2d"
      onMouseDown={onContainerMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
       <Ruler orientation="horizontal" size={dimensions.width} otherSize={dimensions.height} />
       <Ruler orientation="vertical" size={dimensions.height} otherSize={dimensions.width} />

       <CanvasViewport>
          <Grid />
          <RoomLayer onRoomMouseDown={onRoomMouseDown} />
          <SelectionOverlay selectionBox={selectionBox} />
          <SnapIndicator mousePos={mousePos} viewportSize={dimensions} />
       </CanvasViewport>
    </div>
  );
}
