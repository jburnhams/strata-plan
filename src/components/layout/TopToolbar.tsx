import React from 'react';
import { ThemeToggle } from './ThemeToggle';

export function TopToolbar() {
  return (
    <div className="h-12 border-b flex items-center px-4 justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="font-bold flex items-center gap-2">
        <span>StrataPlan</span>
      </div>
      <div className="flex items-center gap-2">
         <ThemeToggle />
      </div>
    </div>
  );
}
