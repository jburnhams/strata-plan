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
import { RoomType } from '../../types/room';
import { Trash2 } from 'lucide-react';
import { calculateArea, calculateVolume } from '../../services/geometry/room';

const ROOM_TYPES: RoomType[] = [
  'bedroom',
  'kitchen',
  'bathroom',
  'living',
  'dining',
  'office',
  'hallway',
  'closet',
  'garage',
  'other',
];

export function RoomPropertiesPanel() {
  const selectedRoom = useFloorplanStore(state => state.getSelectedRoom());
  const updateRoom = useFloorplanStore(state => state.updateRoom);
  const deleteRoom = useFloorplanStore(state => state.deleteRoom);
  const units = useFloorplanStore(state => state.currentFloorplan?.units || 'meters');

  if (!selectedRoom) return null;

  const handleChange = (field: keyof typeof selectedRoom, value: any) => {
    updateRoom(selectedRoom.id, { [field]: value });
  };

  const handleNumberChange = (field: 'length' | 'width' | 'height', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      handleChange(field, numValue);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      deleteRoom(selectedRoom.id);
    }
  };

  const area = calculateArea(selectedRoom.length, selectedRoom.width);
  const volume = calculateVolume(selectedRoom.length, selectedRoom.width, selectedRoom.height);

  return (
    <div className="space-y-6" data-testid="room-properties-panel">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Room Properties</h2>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="room-name">Name</Label>
          <Input
            id="room-name"
            value={selectedRoom.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="room-type">Type</Label>
          <Select
            value={selectedRoom.type}
            onValueChange={(value) => handleChange('type', value as RoomType)}
          >
            <SelectTrigger id="room-type">
              <SelectValue placeholder="Select room type" />
            </SelectTrigger>
            <SelectContent>
              {ROOM_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="room-length">Length ({units === 'meters' ? 'm' : 'ft'})</Label>
            <Input
              id="room-length"
              type="number"
              min="0.1"
              step="0.1"
              value={selectedRoom.length}
              onChange={(e) => handleNumberChange('length', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="room-width">Width ({units === 'meters' ? 'm' : 'ft'})</Label>
            <Input
              id="room-width"
              type="number"
              min="0.1"
              step="0.1"
              value={selectedRoom.width}
              onChange={(e) => handleNumberChange('width', e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="room-height">Height ({units === 'meters' ? 'm' : 'ft'})</Label>
          <Input
            id="room-height"
            type="number"
            min="0.1"
            step="0.1"
            value={selectedRoom.height}
            onChange={(e) => handleNumberChange('height', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Area:</span>
            <span className="ml-2 font-medium">
              {area.toFixed(2)} {units === 'meters' ? 'm²' : 'sq ft'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Volume:</span>
            <span className="ml-2 font-medium">
              {volume.toFixed(2)} {units === 'meters' ? 'm³' : 'cu ft'}
            </span>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="room-color">Color</Label>
          <div className="flex gap-2">
            <Input
              id="room-color"
              type="color"
              value={selectedRoom.color || '#ffffff'}
              onChange={(e) => handleChange('color', e.target.value)}
              className="w-12 h-8 p-1 cursor-pointer"
            />
            <Input
              value={selectedRoom.color || '#ffffff'}
              onChange={(e) => handleChange('color', e.target.value)}
              className="font-mono"
            />
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
          Delete Room
        </Button>
      </div>
    </div>
  );
}
