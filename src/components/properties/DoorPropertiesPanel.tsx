import React from 'react';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { DoorType, DoorSwing, HandleSide } from '../../types';
import { Trash2 } from 'lucide-react';

const DOOR_TYPES: DoorType[] = ['single', 'double', 'sliding', 'pocket', 'bifold'];

function DoorSwingPreview({ type, swing, handleSide }: { type: DoorType; swing: DoorSwing; handleSide: HandleSide }) {
  // Simple SVG visualization of door swing
  const isLeftHandle = handleSide === 'left';
  const isInward = swing === 'inward';

  return (
    <div className="w-full h-24 border rounded bg-muted/20 flex items-center justify-center p-4" data-testid="door-swing-preview">
       <svg viewBox="0 0 100 100" className="w-16 h-16 stroke-foreground fill-none stroke-2">
         {/* Wall */}
         <line x1="0" y1="50" x2="100" y2="50" className="stroke-muted-foreground stroke-[4]" />

         {/* Door Frame/Opening */}
         <line x1="30" y1="50" x2="30" y2="40" />
         <line x1="70" y1="50" x2="70" y2="40" />

         {/* Swing Arc and Door Leaf - Simplified logic for visualization */}
         {type === 'single' && (
           <>
             {/* Pivot point depends on handle side */}
             {/* If handle is left, hinge is right */}
             {!isLeftHandle ? (
                // Hinge Left, Handle Right
                isInward ? (
                    <>
                        <path d="M 30 50 A 40 40 0 0 1 70 90" strokeDasharray="4 4" className="stroke-muted-foreground/50"/>
                        <line x1="30" y1="50" x2="70" y2="90" />
                    </>
                ) : (
                    <>
                        <path d="M 30 50 A 40 40 0 0 0 70 10" strokeDasharray="4 4" className="stroke-muted-foreground/50"/>
                        <line x1="30" y1="50" x2="70" y2="10" />
                    </>
                )
             ) : (
                // Hinge Right, Handle Left
                 isInward ? (
                    <>
                        <path d="M 70 50 A 40 40 0 0 0 30 90" strokeDasharray="4 4" className="stroke-muted-foreground/50"/>
                        <line x1="70" y1="50" x2="30" y2="90" />
                    </>
                ) : (
                    <>
                        <path d="M 70 50 A 40 40 0 0 1 30 10" strokeDasharray="4 4" className="stroke-muted-foreground/50"/>
                        <line x1="70" y1="50" x2="30" y2="10" />
                    </>
                )
             )}
           </>
         )}

         {type === 'double' && (
             // Simplified double door representation
             <>
                <line x1="30" y1="50" x2="50" y2={isInward ? 70 : 30} />
                <line x1="70" y1="50" x2="50" y2={isInward ? 70 : 30} />
                <path d={`M 30 50 Q 50 ${isInward ? 70 : 30} 70 50`} fill="none" strokeDasharray="4 4" />
             </>
         )}

         {/* Fallback for other types */}
         {['sliding', 'pocket', 'bifold'].includes(type) && (
             <text x="50" y="80" textAnchor="middle" fontSize="10" stroke="none" fill="currentColor">
                 {type}
             </text>
         )}
       </svg>
    </div>
  );
}

export function DoorPropertiesPanel() {
  const selectedDoorId = useFloorplanStore(state => state.selectedDoorId);
  const selectedDoor = useFloorplanStore(state => state.getDoorById(selectedDoorId || ''));
  const updateDoor = useFloorplanStore(state => state.updateDoor);
  const deleteDoor = useFloorplanStore(state => state.deleteDoor);
  const currentFloorplan = useFloorplanStore(state => state.currentFloorplan);
  const units = currentFloorplan?.units || 'meters';

  if (!selectedDoor) return null;

  // Find Room Info
  const room = currentFloorplan?.rooms.find(r => r.id === selectedDoor.roomId);
  const roomName = room?.name || 'Unknown Room';
  const wallSide = selectedDoor.wallSide.charAt(0).toUpperCase() + selectedDoor.wallSide.slice(1);

  // Find Connected Room Info
  let connectedRoomName = '';
  if (selectedDoor.connectionId && currentFloorplan) {
      const connection = currentFloorplan.connections.find(c => c.id === selectedDoor.connectionId);
      if (connection) {
          const otherRoomId = connection.room1Id === selectedDoor.roomId ? connection.room2Id : connection.room1Id;
          const otherRoom = currentFloorplan.rooms.find(r => r.id === otherRoomId);
          if (otherRoom) connectedRoomName = otherRoom.name;
      }
  }

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

      {/* Info Section */}
      <div className="bg-muted/50 p-3 rounded text-sm space-y-1">
          <div className="flex justify-between">
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium">{roomName}</span>
          </div>
          <div className="flex justify-between">
              <span className="text-muted-foreground">Wall:</span>
              <span className="font-medium">{wallSide} Wall</span>
          </div>
          {connectedRoomName && (
              <div className="flex justify-between pt-1 border-t border-border mt-1">
                  <span className="text-muted-foreground">Connects to:</span>
                  <span className="font-medium">{connectedRoomName}</span>
              </div>
          )}
      </div>

      <div className="space-y-4">
        {/* Position Slider */}
        <div className="space-y-2">
             <div className="flex justify-between">
                <Label>Position on Wall</Label>
                <span className="text-xs text-muted-foreground">{Math.round(selectedDoor.position * 100)}%</span>
             </div>
             <Slider
                value={[selectedDoor.position]}
                max={1}
                step={0.01}
                onValueChange={(vals) => updateDoor(selectedDoor.id, { position: vals[0] })}
             />
        </div>

        {/* Properties */}
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

        {/* Swing Preview */}
        <DoorSwingPreview
            type={selectedDoor.type}
            swing={selectedDoor.swing}
            handleSide={selectedDoor.handleSide}
        />

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
