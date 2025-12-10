import React from 'react';
import { useFloorplanStore } from '../../stores/floorplanStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Settings2 } from 'lucide-react';

export function NoSelectionPanel() {
  const roomCount = useFloorplanStore(state => state.getRoomCount());
  const totalArea = useFloorplanStore(state => state.getTotalArea());
  const units = useFloorplanStore(state => state.currentFloorplan?.units || 'meters');

  return (
    <div className="flex flex-col gap-6" data-testid="no-selection-panel">
      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
        <Settings2 className="h-10 w-10 mb-2" />
        <p className="text-sm font-medium">Select a room to edit properties</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
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
              {totalArea.toFixed(2)} {units === 'meters' ? 'm²' : 'sq ft'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
