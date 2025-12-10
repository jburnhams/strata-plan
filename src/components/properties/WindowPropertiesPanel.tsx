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
import { WindowFrameType, WindowMaterial } from '../../types';
import { Trash2 } from 'lucide-react';

const WINDOW_FRAMES: WindowFrameType[] = ['single', 'double', 'triple'];
const WINDOW_MATERIALS: WindowMaterial[] = ['wood', 'aluminum', 'pvc'];

export function WindowPropertiesPanel() {
  const selectedWindowId = useFloorplanStore(state => state.selectedWindowId);
  const selectedWindow = useFloorplanStore(state => state.getWindowById(selectedWindowId || ''));
  const updateWindow = useFloorplanStore(state => state.updateWindow);
  const deleteWindow = useFloorplanStore(state => state.deleteWindow);
  const units = useFloorplanStore(state => state.currentFloorplan?.units || 'meters');

  if (!selectedWindow) return null;

  const handleNumberChange = (field: 'width' | 'height' | 'sillHeight', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      updateWindow(selectedWindow.id, { [field]: numValue });
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this window?')) {
      deleteWindow(selectedWindow.id);
    }
  };

  return (
    <div className="space-y-6" data-testid="window-properties-panel">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Window Properties</h2>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="window-frame">Frame Type</Label>
          <Select
            value={selectedWindow.frameType}
            onValueChange={(value) => updateWindow(selectedWindow.id, { frameType: value as WindowFrameType })}
          >
            <SelectTrigger id="window-frame">
              <SelectValue placeholder="Select frame type" />
            </SelectTrigger>
            <SelectContent>
              {WINDOW_FRAMES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="window-width">Width ({units === 'meters' ? 'm' : 'ft'})</Label>
            <Input
              id="window-width"
              type="number"
              min="0.1"
              step="0.05"
              value={selectedWindow.width}
              onChange={(e) => handleNumberChange('width', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="window-height">Height ({units === 'meters' ? 'm' : 'ft'})</Label>
            <Input
              id="window-height"
              type="number"
              min="0.1"
              step="0.05"
              value={selectedWindow.height}
              onChange={(e) => handleNumberChange('height', e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="window-sill">Sill Height ({units === 'meters' ? 'm' : 'ft'})</Label>
          <Input
            id="window-sill"
            type="number"
            min="0"
            step="0.05"
            value={selectedWindow.sillHeight}
            onChange={(e) => handleNumberChange('sillHeight', e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="window-material">Material</Label>
          <Select
            value={selectedWindow.material || 'pvc'}
            onValueChange={(value) => updateWindow(selectedWindow.id, { material: value as WindowMaterial })}
          >
            <SelectTrigger id="window-material">
              <SelectValue placeholder="Select material" />
            </SelectTrigger>
            <SelectContent>
              {WINDOW_MATERIALS.map((mat) => (
                <SelectItem key={mat} value={mat}>
                  {mat.charAt(0).toUpperCase() + mat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleDelete}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Window
        </Button>
      </div>
    </div>
  );
}
