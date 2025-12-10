import React, { useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { ThemeProvider } from './components/layout/ThemeProvider';
import { RoomTable } from './components/table/RoomTable';
import { useFloorplanStore } from './stores/floorplanStore';
import { TooltipProvider } from './components/ui/tooltip';
import { Toaster } from './components/ui/toaster';
import { DialogProvider } from './components/dialogs/DialogProvider';
import { KeyboardShortcutProvider } from './components/layout/KeyboardShortcutProvider';

function App() {
  const currentFloorplan = useFloorplanStore((state) => state.currentFloorplan);
  const createFloorplan = useFloorplanStore((state) => state.createFloorplan);

  useEffect(() => {
    if (!currentFloorplan) {
      createFloorplan('New Project', 'meters');
    }
  }, [currentFloorplan, createFloorplan]);

  return (
    <ThemeProvider defaultTheme="system" storageKey="strata-plan-theme">
      <TooltipProvider>
        <AppShell>
          <div className="h-full overflow-auto bg-gray-50 p-4">
            <RoomTable />
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
