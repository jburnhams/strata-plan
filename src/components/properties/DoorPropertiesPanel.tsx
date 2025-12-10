import React from 'react';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { DoorType, DoorSwing, HandleSide } from '../../types/room';
import { Trash2 } from 'lucide-react';

const DOOR_TYPES: DoorType[] = ['single', 'double', 'sliding', 'pocket', 'bifold'];

export function DoorPropertiesPanel() {
  const selectedDoorId = useFloorplanStore(state => state.selectedDoorId);
  const selectedDoor = useFloorplanStore(state => state.getDoorById(selectedDoorId || ''));
  const updateDoor = useFloorplanStore(state => state.updateDoor);
  const deleteDoor = useFloorplanStore(state => state.deleteDoor);
  const units = useFloorplanStore(state => state.currentFloorplan?.units || 'meters');

  if (!selectedDoor) return null;

  const handleNumberChange = (field: 'width' | 'height', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      updateDoor(selectedDoor.id, { [field]: numValue });
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this door?')) {
      deleteDoor(selectedDoor.id);
    }
  };

  return (
    <div className="space-y-6" data-testid="door-properties-panel">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Door Properties</h2>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="door-type">Type</Label>
          <Select
            value={selectedDoor.type}
            onValueChange={(value) => updateDoor(selectedDoor.id, { type: value as DoorType })}
          >
            <SelectTrigger id="door-type">
              <SelectValue placeholder="Select door type" />
            </SelectTrigger>
            <SelectContent>
              {DOOR_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="door-width">Width ({units === 'meters' ? 'm' : 'ft'})</Label>
            <Input
              id="door-width"
              type="number"
              min="0.1"
              step="0.05"
              value={selectedDoor.width}
              onChange={(e) => handleNumberChange('width', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="door-height">Height ({units === 'meters' ? 'm' : 'ft'})</Label>
            <Input
              id="door-height"
              type="number"
              min="0.1"
              step="0.05"
              value={selectedDoor.height}
              onChange={(e) => handleNumberChange('height', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="door-swing">Swing</Label>
            <Select
              value={selectedDoor.swing}
              onValueChange={(value) => updateDoor(selectedDoor.id, { swing: value as DoorSwing })}
            >
              <SelectTrigger id="door-swing">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inward">Inward</SelectItem>
                <SelectItem value="outward">Outward</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="door-handle">Handle</Label>
            <Select
              value={selectedDoor.handleSide}
              onValueChange={(value) => updateDoor(selectedDoor.id, { handleSide: value as HandleSide })}
            >
              <SelectTrigger id="door-handle">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleDelete}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Door
        </Button>
      </div>
    </div>
  );
}
