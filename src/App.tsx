import React, { useEffect, useRef } from 'react';
import { AppShell } from './components/layout/AppShell';
import { ThemeProvider } from './components/layout/ThemeProvider';
import { RoomTable } from './components/table/RoomTable';
import { Canvas2D } from './components/editor/Canvas2D';
import { Viewer3D } from './components/viewer/Viewer3D';
import { CameraControls, CameraControlsRef } from './components/viewer/CameraControls';
import { ViewerControls } from './components/viewer/ViewerControls';
import { Lighting } from './components/viewer/Lighting';
import { SceneManager } from './components/viewer/SceneManager';
import { useFloorplanStore } from './stores/floorplanStore';
import { useUIStore } from './stores/uiStore';
import { TooltipProvider } from './components/ui/tooltip';
import { Toaster } from './components/ui/toaster';
import { DialogProvider } from './components/dialogs/DialogProvider';
import { KeyboardShortcutProvider } from './components/layout/KeyboardShortcutProvider';

function App() {
  const currentFloorplan = useFloorplanStore((state) => state.currentFloorplan);
  const createFloorplan = useFloorplanStore((state) => state.createFloorplan);
  const mode = useUIStore((state) => state.mode);
  const cameraControlsRef = useRef<CameraControlsRef>(null);

  useEffect(() => {
    if (!currentFloorplan) {
      createFloorplan('New Project', 'meters');
    }
  }, [currentFloorplan, createFloorplan]);

  return (
    <ThemeProvider defaultTheme="system" storageKey="strata-plan-theme">
      <TooltipProvider>
        <AppShell>
          <div className="h-full overflow-hidden bg-gray-50 relative">
            {mode === 'table' && (
              <div className="h-full overflow-auto p-4">
                <RoomTable />
              </div>
            )}
            {mode === 'canvas' && <Canvas2D />}
            {mode === 'view3d' && (
              <div className="h-full w-full relative">
                <Viewer3D>
                  <CameraControls ref={cameraControlsRef} />
                  <Lighting />
                  <SceneManager />
                </Viewer3D>
                <ViewerControls cameraControlsRef={cameraControlsRef} />
              </div>
            )}
          </div>
        </AppShell>
        <KeyboardShortcutProvider />
        <DialogProvider />
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
