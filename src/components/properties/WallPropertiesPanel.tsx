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
import { WallMaterial } from '../../types/materials';
import { Trash2 } from 'lucide-react';
import { distance } from '../../services/geometry';

const WALL_MATERIALS: WallMaterial[] = [
  'drywall-white',
  'drywall-painted',
  'brick-red',
  'brick-white',
  'concrete',
  'wood-panel',
  'wallpaper',
  'stone'
];

export function WallPropertiesPanel() {
  const selectedWallId = useFloorplanStore(state => state.selectedWallId);
  const selectedWall = useFloorplanStore(state => state.getWallById(selectedWallId || ''));
  const updateWall = useFloorplanStore(state => state.updateWall);
  const deleteWall = useFloorplanStore(state => state.deleteWall);
  const units = useFloorplanStore(state => state.currentFloorplan?.units || 'meters');

  if (!selectedWall) return null;

  const length = distance(selectedWall.from.x, selectedWall.from.z, selectedWall.to.x, selectedWall.to.z);

  const handleThicknessChange = (value: number) => {
    updateWall(selectedWall.id, { thickness: value });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this wall?')) {
      deleteWall(selectedWall.id);
    }
  };

  return (
    <div className="space-y-6" data-testid="wall-properties-panel">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Wall Properties</h2>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label>Length ({units === 'meters' ? 'm' : 'ft'})</Label>
          <div className="p-2 border rounded bg-muted text-muted-foreground">
            {length.toFixed(2)}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="wall-thickness">Thickness ({units === 'meters' ? 'm' : 'ft'})</Label>
            <span className="w-12 text-right text-sm text-muted-foreground">
              {selectedWall.thickness.toFixed(2)}
            </span>
          </div>
          <Slider
            id="wall-thickness"
            min={0.05}
            max={1.0}
            step={0.01}
            value={[selectedWall.thickness]}
            onValueChange={(vals) => handleThicknessChange(vals[0])}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="wall-material">Material</Label>
          <Select
            value={selectedWall.material || 'drywall-white'}
            onValueChange={(value) => updateWall(selectedWall.id, { material: value as WallMaterial })}
          >
            <SelectTrigger id="wall-material">
              <SelectValue placeholder="Select material" />
            </SelectTrigger>
            <SelectContent>
              {WALL_MATERIALS.map((mat) => (
                <SelectItem key={mat} value={mat}>
                  {mat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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
          Delete Wall
        </Button>
      </div>
    </div>
  );
}
