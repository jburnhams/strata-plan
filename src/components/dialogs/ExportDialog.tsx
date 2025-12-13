import { useState, useEffect } from "react"
import { useFloorplanStore } from "../../stores/floorplanStore"
import { useToast } from "../../hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { exportToJSON } from "../../services/export/jsonExport"
import { exportToGLTF } from "../../services/export/gltfExport"
import { exportToPDF } from "../../services/export/pdfExport"

interface ExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const currentFloorplan = useFloorplanStore(state => state.currentFloorplan);
  const { toast } = useToast();

  const [format, setFormat] = useState<'json' | 'gltf' | 'pdf'>('json')
  const [filename, setFilename] = useState('')
  const [includeTextures, setIncludeTextures] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (open && currentFloorplan) {
      const defaultName = currentFloorplan.name || 'project';
      setFilename(`${defaultName}-${new Date().toISOString().split('T')[0]}`)
      setFormat('json')
      setIncludeTextures(true)
    }
  }, [open, currentFloorplan])

  const handleExport = async () => {
    if (!currentFloorplan) return;

    setIsExporting(true);
    try {
        let blob: Blob;
        let extension: string = format;

        if (format === 'json') {
            // exportToJSON returns Promise<Blob> as per checked file
            blob = await exportToJSON(currentFloorplan);
        } else if (format === 'gltf') {
            blob = await exportToGLTF(currentFloorplan, { includeTextures, binary: true });
            extension = 'glb';
        } else {
            blob = await exportToPDF(currentFloorplan);
        }

        // Trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
            title: "Export Successful",
            description: `Project exported as ${extension.toUpperCase()}`,
        });

        onOpenChange(false);
    } catch (error) {
        console.error(error);
        toast({
            title: "Export Failed",
            description: error instanceof Error ? error.message : "Unknown error occurred",
            variant: "destructive"
        });
    } finally {
        setIsExporting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Project</DialogTitle>
          <DialogDescription>
            Export your project to various formats.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="format" className="text-right">
              Format
            </Label>
            <Select value={format} onValueChange={(v) => setFormat(v as any)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON (Project Data)</SelectItem>
                <SelectItem value="gltf">glTF / GLB (3D Model)</SelectItem>
                <SelectItem value="pdf">PDF (Report)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="filename" className="text-right">
              Filename
            </Label>
            <div className="col-span-3 flex items-center gap-2">
                <Input
                id="filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                />
                <span className="text-sm text-muted-foreground w-12">
                    .{format === 'gltf' ? 'glb' : format}
                </span>
            </div>
          </div>

          {format === 'gltf' && (
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="textures" className="text-right">
                  Textures
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                    <Checkbox
                        id="textures"
                        checked={includeTextures}
                        onCheckedChange={(c) => setIncludeTextures(c === true)}
                    />
                    <Label htmlFor="textures" className="font-normal text-muted-foreground">
                        Include textures in export
                    </Label>
                </div>
             </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={!filename.trim() || isExporting}>
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
