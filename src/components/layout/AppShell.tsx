import React, { useEffect } from 'react';
import { TopToolbar } from './TopToolbar';
import { LeftSidebar } from './LeftSidebar';
import { PropertiesPanel } from './PropertiesPanel';
import { StatusBar } from './StatusBar';
import { useUIStore } from '../../stores/uiStore';
import { useConnectionSync } from '../../hooks/useAdjacency';

interface AppShellProps {
  children?: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { toggleSidebar, togglePropertiesPanel } = useUIStore();

  // Enable automatic connection recalculation
  useConnectionSync();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if input is focused
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if (e.key === '[') {
        toggleSidebar();
      } else if (e.key === ']') {
        togglePropertiesPanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar, togglePropertiesPanel]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      <TopToolbar />

      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />

        <main className="flex-1 relative overflow-hidden bg-background">
          {children}
        </main>

        <PropertiesPanel />
      </div>

      <StatusBar />
    </div>
  );
}
