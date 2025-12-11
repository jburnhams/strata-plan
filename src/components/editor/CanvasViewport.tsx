import React, { useRef, useEffect, useState, ReactNode } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { PIXELS_PER_METER } from '../../constants/defaults';
import { MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL } from '../../constants/limits';
import { Ruler } from './Ruler';
import { useRoomInteraction } from '../../hooks/useRoomInteraction';

interface CanvasViewportProps {
  children?: ReactNode;
  showRulers?: boolean;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function CanvasViewport({ children, showRulers = true }: CanvasViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const {
    zoomLevel,
    panOffset,
    setZoom,
    setPan
  } = useUIStore();

  const { handleBackgroundClick } = useRoomInteraction();

  // Resize Observer
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Pan Handler
  const handleMouseDown = (e: React.MouseEvent) => {
    // Check if right click or middle click or alt for pan
    if (e.button === 1 || e.button === 2 || (e.button === 0 && e.altKey)) {
      e.preventDefault();
      setIsDragging(true);
      setHasMoved(false);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    } else if (e.button === 0) {
      // Left click without alt - potential selection click
      // We still track it to distinguish click vs drag if we implement drag selection later
      setHasMoved(false);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;

      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
          setHasMoved(true);
      }

      setPan({
        x: panOffset.x + dx,
        z: panOffset.z + dy,
      });

      setLastMousePos({ x: e.clientX, y: e.clientY });
    } else {
        // Track movement for click detection on normal left click too
        const dx = e.clientX - lastMousePos.x;
        const dy = e.clientY - lastMousePos.y;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
            setHasMoved(true);
        }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDragging) {
      setIsDragging(false);
    }
    // We do NOT handle background click here anymore. We use onClick.
    // onClick fires after mouseUp, and respects bubbling/propagation correctly relative to child onClick.
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only handle if it was a pure click (not a drag) and left button
    if (e.button === 0 && !hasMoved && !e.altKey) {
        handleBackgroundClick(e);
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Zoom Handler
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
       // Allow browser zoom if user really wants it? Or handle pinch zoom?
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate current world position under cursor
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const currentTransX = panOffset.x + centerX;
    const currentTransY = panOffset.z + centerY;
    const currentScale = PIXELS_PER_METER * zoomLevel;

    // Avoid division by zero
    if (currentScale === 0) return;

    const worldX = (mouseX - currentTransX) / currentScale;
    const worldY = (mouseY - currentTransY) / currentScale;

    // Calculate new zoom
    const delta = -e.deltaY;
    const zoomFactor = 1.1;
    let newZoomLevel = delta > 0 ? zoomLevel * zoomFactor : zoomLevel / zoomFactor;

    newZoomLevel = clamp(newZoomLevel, MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL);

    // New Scale
    const newScale = PIXELS_PER_METER * newZoomLevel;

    // New Translation to keep worldX, worldY under mouseX, mouseY
    const newTransX = mouseX - worldX * newScale;
    const newTransY = mouseY - worldY * newScale;

    const newPanX = newTransX - centerX;
    const newPanZ = newTransY - centerY;

    setZoom(newZoomLevel);
    setPan({ x: newPanX, z: newPanZ });
  };

  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  const tx = panOffset.x + centerX;
  const ty = panOffset.z + centerY;
  const scale = PIXELS_PER_METER * zoomLevel;

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-slate-100 overflow-hidden relative"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()} // Disable context menu for right-drag
      style={{ cursor: isDragging ? 'grabbing' : 'default' }}
      data-testid="canvas-viewport"
    >
      <svg
        width="100%"
        height="100%"
        style={{ touchAction: 'none' }} // Important for gestures
      >
        <g transform={`translate(${tx}, ${ty}) scale(${scale})`}>
             {children}
        </g>
      </svg>

      {/* Helper text for controls */}
      {showRulers && (
        <>
          <Ruler orientation="horizontal" viewportWidth={dimensions.width} viewportHeight={dimensions.height} />
          <Ruler orientation="vertical" viewportWidth={dimensions.width} viewportHeight={dimensions.height} />
          {/* Small white box at 0,0 intersection */}
          <div className="absolute top-0 left-0 w-[20px] h-[20px] bg-slate-50 border-r border-b border-slate-300 z-20 pointer-events-none" />
        </>
      )}

      {/* Helper text for controls */}
      <div className="absolute bottom-4 left-4 text-xs text-slate-400 pointer-events-none">
        Middle-click or Alt+Drag to pan • Wheel to zoom
      </div>
    </div>
  );
}
