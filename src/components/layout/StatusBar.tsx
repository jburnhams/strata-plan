import React from 'react';

export function StatusBar() {
  return (
    <div className="h-6 border-t bg-muted/50 flex items-center px-4 text-xs text-muted-foreground justify-between">
       <div className="flex gap-4">
           <span>Ready</span>
       </div>
       <div className="flex gap-4">
           <span>0.0m, 0.0m</span>
       </div>
       <div className="flex gap-4">
           <span>Saved</span>
       </div>
    </div>
  );
}
