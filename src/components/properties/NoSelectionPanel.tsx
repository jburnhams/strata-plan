import React from 'react';
import { useFloorplanStore } from '@/stores/floorplanStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function NoSelectionPanel() {
  const currentFloorplan = useFloorplanStore(state => state.getCurrentFloorplan());

  if (!currentFloorplan) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No project loaded.
      </div>
    );
  }

  const roomCount = currentFloorplan.rooms.length;
  const totalArea = currentFloorplan.rooms.reduce((acc, room) => acc + (room.length * room.width), 0);

  return (
    <div className="space-y-6">
      <div className="p-4 bg-muted/30 rounded-lg text-center border-dashed border-2">
        <p className="text-muted-foreground">Select a room to edit its properties</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Project Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Rooms</span>
            <span className="font-medium">{roomCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Area</span>
            <span className="font-medium">
              {totalArea.toFixed(2)} {currentFloorplan.units === 'meters' ? 'm²' : 'ft²'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
             <span className="text-muted-foreground">Units</span>
             <span className="capitalize">{currentFloorplan.units}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
