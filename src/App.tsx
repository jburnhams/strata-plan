import React from 'react';
import { AppShell } from './components/layout/AppShell';
import { ThemeProvider } from './components/layout/ThemeProvider';
import { TooltipProvider } from './components/ui/tooltip';
import { Toaster } from './components/ui/toaster';
import { DialogProvider } from './components/dialogs/DialogProvider';
import { KeyboardShortcutProvider } from './components/layout/KeyboardShortcutProvider';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="strata-plan-theme">
      <TooltipProvider>
        <AppShell>
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Canvas Area</p>
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
