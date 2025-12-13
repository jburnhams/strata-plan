import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { COLOR_SCHEMES } from '@/services/colorSchemes';
import { useFloorplanStore } from '@/stores/floorplanStore';
import { RoomType } from '@/types/room';

interface ColorSchemeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ColorSchemeDialog({ open, onOpenChange }: ColorSchemeDialogProps) {
  const applyColorScheme = useFloorplanStore((state) => state.applyColorScheme);
  const [selectedSchemeId, setSelectedSchemeId] = React.useState<string>(COLOR_SCHEMES[0].id);

  const selectedScheme = COLOR_SCHEMES.find(s => s.id === selectedSchemeId) || COLOR_SCHEMES[0];

  const handleApply = () => {
    applyColorScheme(selectedScheme);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Color Schemes</DialogTitle>
          <DialogDescription>
            Choose a color palette for your floorplan. This will update all rooms.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Scheme</span>
            <div className="col-span-3">
              <Select value={selectedSchemeId} onValueChange={setSelectedSchemeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a scheme" />
                </SelectTrigger>
                <SelectContent>
                  {COLOR_SCHEMES.map(scheme => (
                    <SelectItem key={scheme.id} value={scheme.id}>
                      {scheme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-md p-4 space-y-2">
            <div className="text-sm font-medium mb-2">Preview</div>
            <div className="text-xs text-muted-foreground mb-2">
               Floor: {selectedScheme.defaultFloorMaterial} • Wall: {selectedScheme.defaultWallMaterial}
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(selectedScheme.roomTypeColors) as RoomType[]).slice(0, 8).map(type => (
                <div key={type} className="flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded border shadow-sm"
                    style={{ backgroundColor: selectedScheme.roomTypeColors[type] }}
                    title={type}
                  />
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {selectedScheme.description}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleApply}>Apply Scheme</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
