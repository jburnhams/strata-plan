import { useState, useEffect } from "react"
import { useDialog } from "@/hooks/useDialog"
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

interface ExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  // const { isOpen, closeDialog, data } = useDialog('export') // Managed by parent in DialogProvider
  // We should rely on props or store, but typically DialogProvider manages open state and passes it down OR component uses store directly.
  // The current pattern in DialogProvider suggests passing props.
  const [format, setFormat] = useState<'json' | 'gltf' | 'pdf'>('json')
  const [filename, setFilename] = useState('')

  useEffect(() => {
    if (open) {
      const defaultName = 'project' // data?.name not available via props currently
      setFilename(`${defaultName}-${new Date().toISOString().split('T')[0]}`)
      setFormat('json') // Default to JSON
    }
  }, [open])

  const handleExport = () => {
    // TODO: Export logic
    console.log('Export', { format, filename })
    onOpenChange(false)
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
                <SelectItem value="gltf">glTF (3D Model)</SelectItem>
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
                <span className="text-sm text-muted-foreground">
                    .{format === 'gltf' ? 'glb' : format}
                </span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={!filename.trim()}>
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
