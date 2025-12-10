import React from 'react';
import { cn } from '../../lib/utils';

interface TopToolbarProps {
  className?: string;
}

export function TopToolbar({ className }: TopToolbarProps) {
  return (
    <header
      className={cn(
        "h-12 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4",
        className
      )}
      data-testid="top-toolbar"
    >
      {/* Placeholder content */}
      <div className="font-semibold text-sm">StrataPlan</div>
    </header>
  );
}
