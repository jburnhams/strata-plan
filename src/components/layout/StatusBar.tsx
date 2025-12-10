import React from 'react';
import { cn } from '../../lib/utils';

interface StatusBarProps {
  className?: string;
}

export function StatusBar({ className }: StatusBarProps) {
  return (
    <footer
      className={cn(
        "h-6 border-t bg-muted/50 flex items-center px-4 text-xs text-muted-foreground justify-between",
        className
      )}
      data-testid="status-bar"
    >
      <div className="flex items-center space-x-4">
        <span>Ready</span>
      </div>
      <div className="flex items-center space-x-4">
        <span>100%</span>
      </div>
    </footer>
  );
}
