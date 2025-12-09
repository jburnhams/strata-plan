import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SidebarSectionProps {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function SidebarSection({ title, count = 0, defaultOpen = true, children }: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="flex flex-col border-b last:border-0">
      <Button
        variant="ghost"
        className="flex items-center justify-between w-full px-4 py-2 rounded-none h-10 hover:bg-muted"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
           {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
           <span className="text-sm font-medium">{title}</span>
        </div>
        {count > 0 && (
            <Badge variant="secondary" className="text-xs h-5 px-1.5 min-w-5 flex items-center justify-center">
                {count}
            </Badge>
        )}
      </Button>
      {isOpen && (
        <div className="flex flex-col">
            {children}
        </div>
      )}
    </div>
  );
}
