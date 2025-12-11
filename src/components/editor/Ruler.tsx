import React, { useRef, useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { PIXELS_PER_METER } from '../../constants/defaults';

interface RulerProps {
  orientation: 'horizontal' | 'vertical';
  viewportWidth: number;
  viewportHeight: number;
}

export const Ruler: React.FC<RulerProps> = ({ orientation, viewportWidth, viewportHeight }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { zoomLevel, panOffset } = useUIStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (physical pixels)
    const width = orientation === 'horizontal' ? viewportWidth : 20;
    const height = orientation === 'vertical' ? viewportHeight : 20;

    // Check if canvas size needs update to avoid flickering/clearing
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
    } else {
        ctx.clearRect(0, 0, width, height);
    }

    // Styling
    ctx.fillStyle = '#f8fafc'; // slate-50 background
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#94a3b8'; // slate-400 lines
    ctx.fillStyle = '#64748b'; // slate-500 text
    ctx.font = '10px sans-serif';
    ctx.lineWidth = 1;

    // Viewport transform logic
    const scale = PIXELS_PER_METER * zoomLevel;
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;
    const tx = panOffset.x + centerX;
    const ty = panOffset.z + centerY;

    if (orientation === 'horizontal') {
        const minWorldX = (0 - tx) / scale;
        const maxWorldX = (viewportWidth - tx) / scale;
        const startX = Math.floor(minWorldX);
        const endX = Math.ceil(maxWorldX);

        // Determine step based on zoom
        let step = 1;
        if (zoomLevel > 1.5) step = 0.5;
        if (zoomLevel > 3.0) step = 0.1;
        if (zoomLevel < 0.5) step = 2;
        if (zoomLevel < 0.25) step = 5;

        // Force integer steps for now for cleaner numbers
        const labelStep = zoomLevel < 0.5 ? 5 : (zoomLevel < 1 ? 2 : 1);

        for (let w = Math.floor(minWorldX / step) * step; w <= maxWorldX; w += step) {
             const screenX = w * scale + tx;

             // Draw tick
             ctx.beginPath();
             ctx.moveTo(screenX, height);
             ctx.lineTo(screenX, height - 5);
             ctx.stroke();

             // Draw label if it's a major step (labelStep)
             if (Math.abs(w % labelStep) < 0.001 || Math.abs(w % labelStep - labelStep) < 0.001) {
                 const text = Math.round(w).toString();
                 const textWidth = ctx.measureText(text).width;
                 ctx.fillText(text, screenX - textWidth / 2, height - 8);
             }
        }
    } else {
        // Vertical (Z axis)
        const minWorldY = (0 - ty) / scale;
        const maxWorldY = (viewportHeight - ty) / scale;

        const labelStep = zoomLevel < 0.5 ? 5 : (zoomLevel < 1 ? 2 : 1);
        let step = 1;
        if (zoomLevel > 1.5) step = 0.5;
        if (zoomLevel > 3.0) step = 0.1;
        if (zoomLevel < 0.5) step = 2;
        if (zoomLevel < 0.25) step = 5;

        for (let w = Math.floor(minWorldY / step) * step; w <= maxWorldY; w += step) {
             const screenY = w * scale + ty;

             // Draw tick
             ctx.beginPath();
             ctx.moveTo(width, screenY);
             ctx.lineTo(width - 5, screenY);
             ctx.stroke();

             if (Math.abs(w % labelStep) < 0.001 || Math.abs(w % labelStep - labelStep) < 0.001) {
                 const text = Math.round(w).toString();
                 ctx.textBaseline = 'middle';
                 const textWidth = ctx.measureText(text).width;
                 ctx.fillText(text, width - 6 - textWidth, screenY);
             }
        }
    }

  }, [orientation, viewportWidth, viewportHeight, zoomLevel, panOffset]);

  const style: React.CSSProperties = {
    position: 'absolute',
    top: orientation === 'horizontal' ? 0 : 0,
    left: orientation === 'vertical' ? 0 : 0,
    pointerEvents: 'none',
    zIndex: 10,
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    borderBottom: orientation === 'horizontal' ? '1px solid #cbd5e1' : 'none',
    borderRight: orientation === 'vertical' ? '1px solid #cbd5e1' : 'none',
  };

  return (
    <canvas
        ref={canvasRef}
        style={style}
        data-testid={`ruler-${orientation}`}
    />
  );
};
