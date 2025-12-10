import React, { useEffect, useState } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { PIXELS_PER_METER } from '../../constants/defaults';
import { cn } from '../../lib/utils';

interface RulerProps {
  orientation: 'horizontal' | 'vertical';
  size: number;      // width for horizontal, height for vertical
  otherSize: number; // height for horizontal, width for vertical
}

export const Ruler: React.FC<RulerProps> = ({ orientation, size, otherSize }) => {
  const { zoomLevel, panOffset } = useUIStore();
  const [ticks, setTicks] = useState<number[]>([]);

  useEffect(() => {
    if (size === 0) return;

    const width = orientation === 'horizontal' ? size : otherSize;
    const height = orientation === 'horizontal' ? otherSize : size;

    // Calculate world range visible
    const scale = PIXELS_PER_METER * zoomLevel;

    // Logic from screenToWorld:
    // worldX = (screenX - pan.x - width/2) / scale
    // worldZ = (screenY - pan.z - height/2) / scale

    let startWorld, endWorld;

    if (orientation === 'horizontal') {
        const startScreen = 0;
        const endScreen = size;
        startWorld = (startScreen - panOffset.x - width / 2) / scale;
        endWorld = (endScreen - panOffset.x - width / 2) / scale;
    } else {
        const startScreen = 0;
        const endScreen = size;
        startWorld = (startScreen - panOffset.z - height / 2) / scale;
        endWorld = (endScreen - panOffset.z - height / 2) / scale;
    }

    // Determine step size
    const pixelsPerUnit = scale;
    let step = 1;
    if (pixelsPerUnit < 15) step = 5;       // Zoomed out a lot
    else if (pixelsPerUnit < 30) step = 2;  // Zoomed out
    else if (pixelsPerUnit > 150) step = 0.5; // Zoomed in
    else if (pixelsPerUnit > 300) step = 0.1; // Very zoomed in

    // Generate ticks
    const firstTick = Math.ceil(startWorld / step) * step;
    const lastTick = Math.floor(endWorld / step) * step;

    const newTicks = [];
    // Add epsilon to avoid floating point issues
    for (let t = firstTick; t <= lastTick + 0.0001; t += step) {
        newTicks.push(t);
    }
    setTicks(newTicks);

  }, [size, otherSize, orientation, zoomLevel, panOffset]);

  return (
    <div
      className={cn(
        "absolute bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-sm border-slate-300 dark:border-slate-700 pointer-events-none select-none z-10 overflow-hidden",
        orientation === 'horizontal'
          ? "top-0 left-0 right-0 h-6 border-b"
          : "top-0 left-0 bottom-0 w-6 border-r"
      )}
      data-testid={`${orientation}-ruler`}
    >
       {ticks.map(t => {
           const width = orientation === 'horizontal' ? size : otherSize;
           const height = orientation === 'horizontal' ? otherSize : size;
           const scale = PIXELS_PER_METER * zoomLevel;

           // Map world back to screen
           const val = orientation === 'horizontal'
              ? (t * scale) + panOffset.x + (width / 2)
              : (t * scale) + panOffset.z + (height / 2);

           return (
               <div
                  key={t}
                  className="absolute text-[10px] text-slate-500 flex items-center justify-center"
                  style={{
                      [orientation === 'horizontal' ? 'left' : 'top']: `${val}px`,
                      [orientation === 'horizontal' ? 'top' : 'left']: 0,
                      width: orientation === 'horizontal' ? '1px' : '100%',
                      height: orientation === 'horizontal' ? '100%' : '1px',
                  }}
               >
                   <div className={cn("absolute", orientation === 'horizontal' ? "top-1" : "left-1")}>
                      {Math.abs(t) < 0.001 ? 0 : Number(t.toFixed(1))}
                   </div>
                   <div className={cn("absolute bg-slate-400",
                        orientation === 'horizontal' ? "bottom-0 h-2 w-px" : "right-0 w-2 h-px"
                   )} />
               </div>
           );
       })}
    </div>
  );
};
