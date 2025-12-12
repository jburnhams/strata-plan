import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ProjectMetadata } from '../../types/floorplan';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Separator } from '../ui/separator';

interface ProjectSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectMetadata;
  onSave: (updates: { name: string; units: 'meters' | 'feet' }) => Promise<void>;
}

export function ProjectSettingsDialog({ open, onOpenChange, project, onSave }: ProjectSettingsDialogProps) {
  const [name, setName] = useState(project.name);
  const [units, setUnits] = useState<'meters' | 'feet'>('meters'); // Default, would come from project metadata if available
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(project.name);
      // setUnits(project.units); // Assuming metadata has units later
    }
  }, [open, project]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await onSave({ name, units });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
          <DialogDescription>
            Manage settings for {project.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="settings-name" className="text-right">
              Name
            </Label>
            <Input
              id="settings-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              maxLength={100}
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Units</Label>
            <div className="col-span-3 space-y-4">
               <RadioGroup value={units} onValueChange={(v) => setUnits(v as any)}>
                 <div className="flex items-center space-x-2">
                   <RadioGroupItem value="meters" id="s-meters" />
                   <Label htmlFor="s-meters">Meters</Label>
                 </div>
                 <div className="flex items-center space-x-2">
                   <RadioGroupItem value="feet" id="s-feet" />
                   <Label htmlFor="s-feet">Feet</Label>
                 </div>
               </RadioGroup>
               <p className="text-xs text-muted-foreground">
                 Changing units does not convert existing numeric values.
               </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2 text-sm text-gray-500">
             <div className="flex justify-between">
                <span>Created:</span>
                <span>{new Date(project.updatedAt).toLocaleDateString()}</span> {/* Placeholder for createdAt */}
             </div>
             <div className="flex justify-between">
                <span>Last Modified:</span>
                <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
             </div>
             <div className="flex justify-between">
                <span>Room Count:</span>
                <span>{project.roomCount}</span>
             </div>
             <div className="flex justify-between">
                <span>Total Area:</span>
                <span>{project.totalArea} m²</span>
             </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
