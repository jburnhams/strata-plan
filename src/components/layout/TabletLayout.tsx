import React, { useState } from 'react';
import { Menu, Settings, PanelRightClose, PanelRightOpen, LayoutGrid, Maximize, Cuboid } from 'lucide-react';
import { Button } from '../ui/button';
import { useUIStore } from '../../stores/uiStore';
import { TopToolbar } from './TopToolbar';
import { LeftSidebar } from './LeftSidebar';
import { PropertiesPanel } from './PropertiesPanel';
import { StatusBar } from './StatusBar';

interface TabletLayoutProps {
  children?: React.ReactNode;
}

export function TabletLayout({ children }: TabletLayoutProps) {
  const { toggleSidebar, togglePropertiesPanel, sidebarOpen, propertiesPanelOpen } = useUIStore();

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      {/* Compact Toolbar */}
      <TopToolbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - controlled by store, but on tablet we might want it to behave differently */}
        <LeftSidebar />

        <main className="flex-1 relative overflow-hidden bg-background flex">
          <div className="flex-1 relative">
            {children}
          </div>
        </main>

        {/* Properties Panel - slides in/out */}
        <PropertiesPanel />
      </div>

      <StatusBar />
    </div>
  );
}
