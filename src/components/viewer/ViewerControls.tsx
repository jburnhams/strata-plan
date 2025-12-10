import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Box,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  RotateCcw,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { CameraControlsRef } from './CameraControls';

interface ViewerControlsProps {
  cameraControlsRef: React.RefObject<CameraControlsRef | null>;
}

export const ViewerControls: React.FC<ViewerControlsProps> = ({ cameraControlsRef }) => {
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (!cameraControlsRef.current) return;

      switch (e.key) {
        case 'ArrowUp':
          // Optional: we could map arrows to rotate if CameraControls supports it
          break;
        case '+':
        case '=':
          cameraControlsRef.current.zoomIn();
          break;
        case '-':
        case '_':
          cameraControlsRef.current.zoomOut();
          break;
        case 'r':
        case 'R':
          cameraControlsRef.current.reset();
          break;
        case '1':
          cameraControlsRef.current.setPreset('isometric');
          break;
        case '2':
          cameraControlsRef.current.setPreset('top');
          break;
        case '3':
          cameraControlsRef.current.setPreset('front');
          break;
        case '4':
          cameraControlsRef.current.setPreset('side');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cameraControlsRef]);

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 bg-white/90 p-2 rounded-lg shadow-md border border-gray-200 z-10">
      <div className="flex gap-1" role="group" aria-label="Camera Presets">
        <Button
          variant="outline" size="icon"
          onClick={() => cameraControlsRef.current?.setPreset('isometric')}
          title="Isometric View (1)"
        >
          <Box className="h-4 w-4" />
        </Button>
        <Button
          variant="outline" size="icon"
          onClick={() => cameraControlsRef.current?.setPreset('top')}
          title="Top View (2)"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button
          variant="outline" size="icon"
          onClick={() => cameraControlsRef.current?.setPreset('front')}
          title="Front View (3)"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button
          variant="outline" size="icon"
          onClick={() => cameraControlsRef.current?.setPreset('side')}
          title="Side View (4)"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex gap-1 justify-center border-t border-gray-200 pt-2" role="group" aria-label="Camera Controls">
         <Button
          variant="ghost" size="icon"
          onClick={() => cameraControlsRef.current?.zoomIn()}
          title="Zoom In (+)"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
         <Button
          variant="ghost" size="icon"
          onClick={() => cameraControlsRef.current?.zoomOut()}
          title="Zoom Out (-)"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost" size="icon"
          onClick={() => cameraControlsRef.current?.reset()}
          title="Reset View (R)"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
