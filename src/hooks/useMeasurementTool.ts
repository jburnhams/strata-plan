import { useState, useCallback, useRef, useEffect } from 'react';
import { useToolStore } from '../stores/toolStore';
import { useMeasurementStore } from '../stores/measurementStore';
import { useUIStore } from '../stores/uiStore';
import { Position2D } from '../types';
import { screenToWorld } from '../utils/coordinates';
import { calculateDistance } from '../utils/geometry';

export const useMeasurementTool = () => {
  const activeTool = useToolStore((state) => state.activeTool);
  const {
    activeMeasurement,
    setActiveMeasurement,
    addMeasurement
  } = useMeasurementStore();

  const zoomLevel = useUIStore((state) => state.zoomLevel);
  const panOffset = useUIStore((state) => state.panOffset);
  const showGrid = useUIStore((state) => state.showGrid); // Snapping?

  const [isMeasuring, setIsMeasuring] = useState(false);
  const [startPoint, setStartPoint] = useState<Position2D | null>(null);

  const viewportRectRef = useRef<DOMRect | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (activeTool !== 'measure') return;
    if (e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget as Element;
    const rect = target.getBoundingClientRect();
    viewportRectRef.current = rect;

    const transform = {
      zoom: zoomLevel,
      pan: panOffset,
      width: rect.width,
      height: rect.height
    };

    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;

    const worldPos = screenToWorld(
      relativeX,
      relativeY,
      transform
    );

    // Optional: Snap to grid or other points (for now raw coords or basic grid snap)
    // If we want consistent snapping with wall tool, we should extract snapping logic.
    // For now, let's just use raw or basic rounding if grid is on.

    // Basic grid snap if enabled
    let snappedPos = worldPos;
    if (showGrid) {
        const snapSize = 0.1; // Fine snap
        snappedPos = {
            x: Math.round(worldPos.x / snapSize) * snapSize,
            z: Math.round(worldPos.z / snapSize) * snapSize
        };
    }

    if (!isMeasuring) {
      // Start measurement
      setIsMeasuring(true);
      setStartPoint(snappedPos);
      setActiveMeasurement({
        startPoint: snappedPos,
        endPoint: snappedPos,
        distance: 0
      });
    } else {
      // Finish measurement
      if (startPoint) {
         const distance = calculateDistance(startPoint, snappedPos);

         addMeasurement({
             startPoint: startPoint,
             endPoint: snappedPos,
             distance
         });

         // Reset
         setIsMeasuring(false);
         setStartPoint(null);
         setActiveMeasurement(null);
         viewportRectRef.current = null;
      }
    }
  }, [activeTool, isMeasuring, startPoint, zoomLevel, panOffset, showGrid, addMeasurement, setActiveMeasurement]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
     if (!isMeasuring || activeTool !== 'measure' || !viewportRectRef.current || !startPoint) return;

     const rect = viewportRectRef.current;
     const transform = {
         zoom: zoomLevel,
         pan: panOffset,
         width: rect.width,
         height: rect.height
     };

     const relativeX = e.clientX - rect.left;
     const relativeY = e.clientY - rect.top;

     const worldPos = screenToWorld(
       relativeX,
       relativeY,
       transform
     );

     // Basic grid snap if enabled
    let snappedPos = worldPos;
    if (showGrid) {
        const snapSize = 0.1;
        snappedPos = {
            x: Math.round(worldPos.x / snapSize) * snapSize,
            z: Math.round(worldPos.z / snapSize) * snapSize
        };
    }

    const distance = calculateDistance(startPoint, snappedPos);

    setActiveMeasurement({
        startPoint,
        endPoint: snappedPos,
        distance
    });

  }, [isMeasuring, activeTool, zoomLevel, panOffset, showGrid, startPoint, setActiveMeasurement]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMeasuring) {
          setIsMeasuring(false);
          setStartPoint(null);
          setActiveMeasurement(null);
          viewportRectRef.current = null;
      }
  }, [isMeasuring, setActiveMeasurement]);

  useEffect(() => {
    if (isMeasuring) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('keydown', handleKeyDown);
    };
 }, [isMeasuring, handleMouseMove, handleKeyDown]);

 return {
     handleMouseDown
 };
};
