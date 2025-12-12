import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { COLOR_SCHEMES, getColorScheme } from '@/services/colorSchemes';
import { useFloorplanStore } from '@/stores/floorplanStore';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ColorSchemeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ColorSchemeDialog({ open, onOpenChange }: ColorSchemeDialogProps) {
  const [selectedSchemeId, setSelectedSchemeId] = React.useState<string | null>(null);
  const updateRoom = useFloorplanStore(state => state.updateRoom);
  const rooms = useFloorplanStore(state => state.currentFloorplan?.rooms || []);
  const currentFloorplan = useFloorplanStore(state => state.currentFloorplan);

  const handleApply = () => {
    if (!selectedSchemeId || !currentFloorplan) return;

    const scheme = getColorScheme(selectedSchemeId);
    if (!scheme) return;

    if (window.confirm(`Apply "${scheme.name}" color scheme to all rooms? This will overwrite existing colors and materials.`)) {
      rooms.forEach(room => {
        updateRoom(room.id, {
          floorMaterial: scheme.defaultFloorMaterial,
          wallMaterial: scheme.defaultWallMaterial,
          // Clear custom colors to let materials take effect, or set theme colors if we want 2D overrides
          // For now, let's clear custom colors so materials show up
          customFloorColor: undefined,
          customWallColor: undefined,
          customCeilingColor: undefined,
          // Set legacy color for 2D fallback or wall tinting
          color: scheme.roomTypeColors[room.type] || '#cccccc'
        });
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Apply Color Scheme</DialogTitle>
          <DialogDescription>
            Choose a color scheme to apply to your entire floorplan. This will update materials and colors for all rooms.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[300px] pr-4">
          <div className="grid grid-cols-2 gap-4">
            {COLOR_SCHEMES.map(scheme => (
              <div
                key={scheme.id}
                className={cn(
                  "cursor-pointer rounded-lg border-2 p-4 transition-all hover:bg-accent",
                  selectedSchemeId === scheme.id ? "border-primary bg-accent" : "border-transparent bg-card"
                )}
                onClick={() => setSelectedSchemeId(scheme.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{scheme.name}</h3>
                  {selectedSchemeId === scheme.id && <Check className="h-4 w-4 text-primary" />}
                </div>
                <div className="flex gap-1 h-8 rounded overflow-hidden">
                  <div className="flex-1" style={{ backgroundColor: scheme.roomTypeColors.living || '#ccc' }} title="Living" />
                  <div className="flex-1" style={{ backgroundColor: scheme.roomTypeColors.kitchen || '#ccc' }} title="Kitchen" />
                  <div className="flex-1" style={{ backgroundColor: scheme.roomTypeColors.bedroom || '#ccc' }} title="Bedroom" />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Floor: {scheme.defaultFloorMaterial}<br />
                  Wall: {scheme.defaultWallMaterial}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleApply} disabled={!selectedSchemeId}>Apply Scheme</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
