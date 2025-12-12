import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, PaintBucket } from 'lucide-react';

interface MaterialConfig {
  id: string;
  name: string;
  category?: string;
  defaultColor: string;
  textureUrl?: string;
}

interface MaterialPickerProps {
  type: 'floor' | 'wall' | 'ceiling';
  value: string;
  materials: Record<string, MaterialConfig>;
  onChange: (materialId: string) => void;
  customColor?: string;
  onCustomColorChange: (color: string) => void;
  className?: string;
}

export function MaterialPicker({
  type,
  value,
  materials,
  onChange,
  customColor,
  onCustomColorChange,
  className
}: MaterialPickerProps) {
  // Group materials by category
  const groupedMaterials = React.useMemo(() => {
    const groups: Record<string, MaterialConfig[]> = { 'All': [] };

    Object.values(materials).forEach(material => {
      groups['All'].push(material);

      const category = material.category
        ? material.category.charAt(0).toUpperCase() + material.category.slice(1)
        : 'Other';

      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(material);
    });

    return groups;
  }, [materials]);

  const categories = Object.keys(groupedMaterials).filter(c => c !== 'All').sort();
  // If we have categories, use them, otherwise just show 'All' (which we'll hide the tabs for if only one)
  const hasCategories = categories.length > 0;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {type.charAt(0).toUpperCase() + type.slice(1)} Material
        </Label>

        {/* Custom Color Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 gap-2",
                customColor && "border-primary"
              )}
            >
              <div
                className="h-4 w-4 rounded-full border border-gray-200"
                style={{ backgroundColor: customColor || '#ffffff' }}
              />
              <span className="text-xs">Custom Color</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3">
            <div className="space-y-3">
              <h4 className="font-medium leading-none text-sm">Custom Color</h4>
              <p className="text-xs text-muted-foreground">
                Override the material's default color.
              </p>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={customColor || '#ffffff'}
                  onChange={(e) => onCustomColorChange(e.target.value)}
                  className="h-8 w-12 p-1"
                />
                <Input
                  type="text"
                  value={customColor || ''}
                  placeholder="#FFFFFF"
                  onChange={(e) => onCustomColorChange(e.target.value)}
                  className="h-8 flex-1 text-xs"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-7 text-xs"
                onClick={() => onCustomColorChange('')}
                disabled={!customColor}
              >
                Clear Custom Color
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Tabs defaultValue={hasCategories ? categories[0] : 'All'} className="w-full">
        {hasCategories && (
          <TabsList className="w-full flex flex-wrap h-auto justify-start gap-1 bg-transparent p-0 mb-2">
            {categories.map(category => (
              <TabsTrigger
                key={category}
                value={category}
                className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground px-3 py-1 h-7 text-xs border bg-background"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        )}

        {(hasCategories ? categories : ['All']).map(category => (
          <TabsContent key={category} value={category} className="mt-0">
            <ScrollArea className="h-[200px] w-full rounded-md border p-2">
              <div className="grid grid-cols-3 gap-2">
                {groupedMaterials[category].map((material) => (
                  <button
                    key={material.id}
                    onClick={() => onChange(material.id)}
                    className={cn(
                      "group relative flex flex-col items-center gap-1 rounded-md border p-2 hover:bg-accent transition-colors text-left",
                      value === material.id && "border-primary bg-accent/50"
                    )}
                    aria-label={`Select ${material.name}`}
                  >
                    <div
                      className="h-12 w-full rounded-sm border shadow-sm relative overflow-hidden"
                      style={{ backgroundColor: material.defaultColor }}
                    >
                      {/* Placeholder for texture if implemented later */}
                      {material.textureUrl && (
                        <div className="absolute inset-0 bg-cover bg-center opacity-80" />
                      )}

                      {/* Selected Indicator */}
                      {value === material.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Check className="h-5 w-5 text-white drop-shadow-md" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] w-full truncate text-center leading-tight">
                      {material.name}
                    </span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
