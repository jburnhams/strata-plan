import React, { useRef, useState, useEffect } from 'react';
import { CanvasViewport } from './CanvasViewport';
import { Grid } from './Grid';
import { Ruler } from './Ruler';
import { SnapIndicator } from './SnapIndicator';

export function Canvas2D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mousePos, setMousePos] = useState<{x: number, y: number} | null>(null);

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
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
       <Ruler orientation="horizontal" size={dimensions.width} otherSize={dimensions.height} />
       <Ruler orientation="vertical" size={dimensions.height} otherSize={dimensions.width} />

       <CanvasViewport>
          <Grid />
          <SnapIndicator mousePos={mousePos} viewportSize={dimensions} />
          {/* Room rendering will be added here in Task 4.3 */}
       </CanvasViewport>
    </div>
  );
}
