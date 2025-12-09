import React, { useEffect } from 'react';
import { TopToolbar } from './TopToolbar';
import { LeftSidebar } from './LeftSidebar';
import { PropertiesPanel } from './PropertiesPanel';
import { StatusBar } from './StatusBar';
import { useUIStore } from '@/stores/uiStore';
import { ThemeProvider } from './ThemeProvider';
import { Toaster } from '@/components/ui/toaster';

export function AppShell({ children }: { children: React.ReactNode }) {
    const { toggleSidebar, togglePropertiesPanel } = useUIStore();

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if in input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
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
        <ThemeProvider>
            <div className="h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground">
                <TopToolbar />
                <div className="flex-1 flex overflow-hidden">
                    <LeftSidebar />
                    <main className="flex-1 relative overflow-hidden bg-muted/20 flex flex-col">
                        <div className="flex-1 relative">
                             {children}
                        </div>
                    </main>
                    <PropertiesPanel />
                </div>
                <StatusBar />
                <Toaster />
            </div>
        </ThemeProvider>
    );
}
