import React, { useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { ThemeProvider } from './components/layout/ThemeProvider';
import { RoomTable } from './components/table/RoomTable';
import { Canvas2D } from './components/editor/Canvas2D';
import { Viewer3D } from './components/viewer/Viewer3D';
import { Lighting } from './components/viewer/Lighting';
import { SceneManager } from './components/viewer/SceneManager';
import { Environment } from './components/viewer/Environment';
import { useUIStore } from './stores/uiStore';
import { TooltipProvider } from './components/ui/tooltip';
import { Toaster } from './components/ui/toaster';
import { DialogProvider } from './components/dialogs/DialogProvider';
import { KeyboardShortcutProvider } from './components/layout/KeyboardShortcutProvider';
import { useNavigation } from './hooks/useNavigation';
// Placeholder components for new views
import { LandingPage } from './components/pages/LandingPage';
import { ProjectListPage } from './components/pages/ProjectListPage';

function App() {
  const { currentView } = useNavigation();
  const {
    mode,
    showGrid,
    showRoomLabels,
    viewerBrightness,
    viewerQuality,
    viewerWallOpacity
  } = useUIStore();

  return (
    <ThemeProvider defaultTheme="system" storageKey="strata-plan-theme">
      <TooltipProvider>
        {currentView === 'landing' && <LandingPage />}
        {currentView === 'projectList' && <ProjectListPage />}

        {currentView === 'editor' && (
          <>
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
                      <Environment showGrid={showGrid} />
                      <Lighting
                        brightness={viewerBrightness}
                        castShadows={viewerQuality !== 'low'}
                        shadowMapSize={viewerQuality === 'high' ? 2048 : 1024}
                      />
                      <SceneManager
                        wallOpacity={viewerWallOpacity}
                        showLabels={showRoomLabels}
                        quality={viewerQuality}
                      />
                    </Viewer3D>
                  </div>
                )}
              </div>
            </AppShell>
            <KeyboardShortcutProvider />
          </>
        )}

        <DialogProvider />
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
