import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

interface SidebarSectionProps {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function SidebarSection({
  title,
  count,
  defaultOpen = false,
  children,
  className
}: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("border-b last:border-0", className)}>
      <Button
        variant="ghost"
        className="w-full flex items-center justify-between px-4 py-3 h-auto rounded-none hover:bg-muted/50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-sm">{title}</span>
        <div className="flex items-center gap-2">
          {count !== undefined && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </Button>
      {isOpen && (
        <div className="bg-background/50 px-2 pb-2 animate-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
