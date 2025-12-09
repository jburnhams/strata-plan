import React from 'react';
import { AppShell } from '@/components/layout/AppShell';

function App() {
  return (
    <AppShell>
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">StrataPlan</h1>
          <p className="text-xl text-muted-foreground mb-8">
             Select a room or draw a wall to get started.
          </p>
          <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm max-w-md mx-auto">
             <p className="mb-2 font-medium">Shortcuts:</p>
             <ul className="text-sm text-left list-disc list-inside space-y-1">
                 <li><kbd className="px-1 py-0.5 rounded bg-muted border font-mono">[</kbd> Toggle Left Sidebar</li>
                 <li><kbd className="px-1 py-0.5 rounded bg-muted border font-mono">]</kbd> Toggle Properties Panel</li>
             </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default App;
