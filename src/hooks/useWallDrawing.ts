import { useState, useCallback, useRef, useEffect } from 'react';
import { useToolStore } from '../stores/toolStore';
import { useFloorplanStore } from '../stores/floorplanStore';
import { useUIStore } from '../stores/uiStore';
import { Position2D, Wall } from '../types';
import { PIXELS_PER_METER } from '../constants/defaults';
import { screenToWorld } from '../utils/coordinates';

export const useWallDrawing = () => {
  const activeTool = useToolStore((state) => state.activeTool);
  const { addWall } = useFloorplanStore();

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Position2D | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Position2D | null>(null);

  // Store viewport rect for global mouse move coordinate conversion
  const viewportRectRef = useRef<DOMRect | null>(null);

  const zoomLevel = useUIStore((state) => state.zoomLevel);
  const panOffset = useUIStore((state) => state.panOffset);
  const showGrid = useUIStore((state) => state.showGrid);

  const gridSize = 0.5; // Could be from store

  // Snap to grid helper
  const snapToGrid = useCallback((point: Position2D): Position2D => {
    if (!showGrid) return point;

    const snappedX = Math.round(point.x / gridSize) * gridSize;
    const snappedZ = Math.round(point.z / gridSize) * gridSize;

    return { x: snappedX, z: snappedZ };
  }, [showGrid]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (activeTool !== 'wall') return;
    if (e.button !== 0) return; // Only left click

    e.preventDefault();
    e.stopPropagation();

    // Get viewport dimensions from event target (which should be the viewport container)
    // We cast to Element because currentTarget is EventTarget
    const target = e.currentTarget as Element;
    const rect = target.getBoundingClientRect();
    viewportRectRef.current = rect;

    const transform = {
        zoom: zoomLevel,
        pan: panOffset,
        width: rect.width,
        height: rect.height
    };

    // screenToWorld expects clientX relative to the viewport?
    // No, existing usage in CanvasViewport: e.clientX - rect.left.
    // The utility function takes "screenX" which usually implies "relative to viewport origin" in this codebase context?
    // Let's check CanvasViewport usage:
    // const worldPos = screenToWorld(e.clientX - rect.left, e.clientY - rect.top, ...);
    // So yes, it expects coordinates relative to the viewport container top-left.

    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;

    const worldPos = screenToWorld(
      relativeX,
      relativeY,
      transform
    );

    const snappedPos = snapToGrid({ x: worldPos.x, z: worldPos.z });

    if (!isDrawing) {
      // Start drawing
      setIsDrawing(true);
      setStartPoint(snappedPos);
      setCurrentPoint(snappedPos);
    } else {
      // Finish drawing current segment
      if (startPoint) {
        // Don't create zero-length walls
        const dist = Math.sqrt(
             Math.pow(snappedPos.x - startPoint.x, 2) +
             Math.pow(snappedPos.z - startPoint.z, 2)
        );

        if (dist > 0.01) {
             addWall({
                from: startPoint,
                to: snappedPos,
                thickness: 0.2 // default
             });

             // Continue drawing from this point
             setStartPoint(snappedPos);
             setCurrentPoint(snappedPos);
        }
      }
    }
  }, [activeTool, isDrawing, startPoint, zoomLevel, panOffset, snapToGrid, addWall]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDrawing || activeTool !== 'wall' || !viewportRectRef.current) return;

    const rect = viewportRectRef.current;
    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;

    const transform = {
        zoom: zoomLevel,
        pan: panOffset,
        width: rect.width,
        height: rect.height
    };

    const worldPos = screenToWorld(
      relativeX,
      relativeY,
      transform
    );

    const snappedPos = snapToGrid(worldPos);
    setCurrentPoint(snappedPos);
  }, [isDrawing, activeTool, zoomLevel, panOffset, snapToGrid]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isDrawing) {
       setIsDrawing(false);
       setStartPoint(null);
       setCurrentPoint(null);
       viewportRectRef.current = null;
    }
  }, [isDrawing]);

  // Global event listeners for move/up (up is not needed for click-to-click flow, but escape is)
  useEffect(() => {
     if (isDrawing) {
         document.addEventListener('mousemove', handleMouseMove);
         document.addEventListener('keydown', handleKeyDown);
     }

     return () => {
         document.removeEventListener('mousemove', handleMouseMove);
         document.removeEventListener('keydown', handleKeyDown);
     };
  }, [isDrawing, handleMouseMove, handleKeyDown]);

  return {
    isDrawing,
    startPoint,
    currentPoint,
    handleMouseDown
  };
};
