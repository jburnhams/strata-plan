import React, { useState, useEffect } from 'react';
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
import { Room } from '../../types';

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

export function MultiSelectionPanel() {
  const selectedRoomIds = useFloorplanStore(state => state.selectedRoomIds);
  // Fetch everything from the store, but only derive selectedRooms once/safely
  const currentFloorplan = useFloorplanStore(state => state.currentFloorplan);
  const selectedRooms = React.useMemo(() => {
    if (!currentFloorplan || selectedRoomIds.length === 0) return [];
    return currentFloorplan.rooms.filter(r => selectedRoomIds.includes(r.id));
  }, [currentFloorplan, selectedRoomIds]);

  const updateRoom = useFloorplanStore(state => state.updateRoom);
  const deleteRoom = useFloorplanStore(state => state.deleteRoom);
  const units = useFloorplanStore(state => state.currentFloorplan?.units || 'meters');

  if (selectedRoomIds.length <= 1) return null;

  // Determine common values
  const commonType = selectedRooms.length > 0 && selectedRooms.every(r => r.type === selectedRooms[0].type)
    ? selectedRooms[0].type
    : 'mixed';

  // Explicit type hint for commonHeight to avoid inference issues with 'mixed' literal
  const commonHeight: number | 'mixed' = selectedRooms.length > 0 && selectedRooms.every(r => r.height === selectedRooms[0].height)
    ? selectedRooms[0].height
    : 'mixed';

  const commonColor = selectedRooms.length > 0 && selectedRooms.every(r => r.color === selectedRooms[0].color)
    ? selectedRooms[0].color
    : 'mixed';

  // State for inputs to avoid parsing/updating on every keystroke
  const [heightInputValue, setHeightInputValue] = useState(commonHeight === 'mixed' ? '' : commonHeight.toString());

  // Sync state when selection changes or store updates (if not focused? or just let it update if different)
  // For simplicity in batch mode, we reset local state when derived common values change.
  // We can track last commonHeight to detect external changes.
  useEffect(() => {
    setHeightInputValue(commonHeight === 'mixed' ? '' : commonHeight.toString());
  }, [commonHeight]);

  const handleTypeChange = (value: RoomType) => {
    selectedRoomIds.forEach(id => {
      updateRoom(id, { type: value });
    });
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeightInputValue(e.target.value);
  };

  const commitHeightChange = () => {
    const value = heightInputValue;
    const numValue = parseFloat(value);

    // Only update if valid number and positive
    if (!isNaN(numValue) && numValue > 0) {
        selectedRoomIds.forEach(id => {
            updateRoom(id, { height: numValue });
        });
    } else if (value === '') {
       // If cleared
       if (commonHeight !== 'mixed') {
           // Reset to current value if invalid
           setHeightInputValue(commonHeight.toString());
       } else {
           // Keep empty if it was mixed and user cleared it
           setHeightInputValue('');
       }
    }
  };

  const handleHeightKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        commitHeightChange();
        (e.target as HTMLElement).blur();
    }
  };

  const handleColorChange = (value: string) => {
    selectedRoomIds.forEach(id => {
      updateRoom(id, { color: value });
    });
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedRoomIds.length} rooms?`)) {
      selectedRoomIds.forEach(id => deleteRoom(id));
    }
  };

  return (
    <div className="space-y-6" data-testid="multi-selection-panel">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{selectedRoomIds.length} Rooms Selected</h2>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="multi-type">Type</Label>
          <Select
            value={commonType === 'mixed' ? '' : commonType}
            onValueChange={(value) => handleTypeChange(value as RoomType)}
          >
            <SelectTrigger id="multi-type">
              <SelectValue placeholder={commonType === 'mixed' ? "Mixed Types" : "Select type"} />
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

        <div className="grid gap-2">
          <Label htmlFor="multi-height">Height ({units === 'meters' ? 'm' : 'ft'})</Label>
          <Input
            id="multi-height"
            // Use text type when mixed to allow placeholder, actually always use text/number input but managed as string
            type="text"
            inputMode="decimal"
            placeholder={commonHeight === 'mixed' ? "Mixed Values" : ""}
            value={heightInputValue}
            onChange={handleHeightChange}
            onBlur={commitHeightChange}
            onKeyDown={handleHeightKeyDown}
          />
        </div>

         <div className="grid gap-2">
          <Label htmlFor="multi-color">Color</Label>
          <div className="flex gap-2">
            {commonColor !== 'mixed' && (
              <Input
                id="multi-color"
                type="color"
                value={commonColor || '#ffffff'}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-12 h-8 p-1 cursor-pointer"
              />
            )}
             <Input
               value={commonColor === 'mixed' ? "Mixed Colors" : (commonColor || '#ffffff')}
               onChange={(e) => commonColor !== 'mixed' && handleColorChange(e.target.value)}
               className="font-mono"
               disabled={commonColor === 'mixed'}
               placeholder="Mixed Colors"
            />
          </div>
           {commonColor === 'mixed' && <p className="text-xs text-muted-foreground">Select a specific color to apply to all</p>}
        </div>

      </div>

      <div className="pt-4 border-t">
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleDelete}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete {selectedRoomIds.length} Rooms
        </Button>
      </div>
    </div>
  );
}
