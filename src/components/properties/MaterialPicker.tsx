import React from 'react';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  FLOOR_MATERIALS,
  WALL_MATERIALS,
  CEILING_MATERIALS,
} from '@/constants/materialConfigs';

export interface MaterialPickerProps {
  type: 'floor' | 'wall' | 'ceiling';
  value?: string;
  onChange: (materialId: string) => void;
  customColor?: string;
  onCustomColorChange: (color: string) => void;
}

export function MaterialPicker({
  type,
  value,
  onChange,
  customColor,
  onCustomColorChange,
}: MaterialPickerProps) {
  // Get the appropriate material config map based on type
  const materialMap = React.useMemo(() => {
    switch (type) {
      case 'floor':
        return FLOOR_MATERIALS;
      case 'wall':
        return WALL_MATERIALS;
      case 'ceiling':
        return CEILING_MATERIALS;
      default:
        return FLOOR_MATERIALS;
    }
  }, [type]);

  // Group materials by category if applicable (mostly for floors)
  const groupedMaterials = React.useMemo(() => {
    // Explicitly define the type for material items
    type MaterialItem = {
      id: string;
      name: string;
      defaultColor: string;
      category?: string;
    };

    const groups: Record<string, MaterialItem[]> = {};

    Object.values(materialMap).forEach((material) => {
      // Cast to any first to safely access category, then to MaterialItem
      const mat = material as any;
      const category = 'category' in mat ? mat.category : 'Standard';

      if (!groups[category]) {
        groups[category] = [];
      }

      groups[category].push({
        id: mat.id,
        name: mat.name,
        defaultColor: mat.defaultColor,
        category: category
      });
    });

    return groups;
  }, [materialMap]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Material</Label>
        <ScrollArea className="h-[200px] rounded-md border p-2">
          <div className="space-y-4">
            {Object.entries(groupedMaterials).map(([category, materials]) => (
              <div key={category}>
                <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                  {category}
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {materials.map((material) => (
                    <button
                      key={material.id}
                      onClick={() => onChange(material.id)}
                      className={cn(
                        'group relative flex flex-col items-center gap-1 rounded-md border p-1 text-center text-xs hover:bg-accent',
                        value === material.id && !customColor
                          ? 'border-primary ring-1 ring-primary'
                          : 'border-transparent'
                      )}
                      aria-label={`Select ${material.name}`}
                    >
                      <div
                        className="h-10 w-full rounded-sm border shadow-sm"
                        style={{ backgroundColor: material.defaultColor }}
                      />
                      <span className="w-full truncate px-1 text-[10px] leading-tight">
                        {material.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom-color-input">Custom Color</Label>
        <div className="flex items-center gap-2">
          <input
            id="custom-color-input"
            type="color"
            value={customColor || (value && (materialMap as any)[value]?.defaultColor) || '#ffffff'}
            onChange={(e) => onCustomColorChange(e.target.value)}
            className="h-9 w-9 cursor-pointer rounded-md border border-input p-1"
          />
          <input
            type="text"
            value={customColor || ''}
            onChange={(e) => onCustomColorChange(e.target.value)}
            placeholder="No custom color"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
}
