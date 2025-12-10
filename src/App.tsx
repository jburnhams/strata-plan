import React from 'react';
import { AppShell } from './components/layout/AppShell';
import { ThemeProvider } from './components/layout/ThemeProvider';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="strata-plan-theme">
      <AppShell>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Canvas Area</p>
        </div>
      </AppShell>
    </ThemeProvider>
  );
}

export default App;
