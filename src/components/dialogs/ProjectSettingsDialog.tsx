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
import { useToast } from "@/hooks/useToast"

export function ProjectSettingsDialog() {
  const { isOpen, closeDialog, data } = useDialog('projectSettings')
  const { toastWarning } = useToast()

  const [name, setName] = useState('')
  const [units, setUnits] = useState<'meters' | 'feet'>('meters')

  useEffect(() => {
    if (isOpen && data) {
      setName(data.name || '')
      setUnits(data.units || 'meters')
    }
  }, [isOpen, data])

  const handleSave = () => {
    if (!name.trim()) return

    if (data?.units && units !== data.units) {
        toastWarning("Units changed", "All measurements will be converted.");
    }
    // TODO: Save logic
    console.log('Save settings', { name, units })
    closeDialog()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
          <DialogDescription>
            Update project configuration.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="setting-name" className="text-right">
              Name
            </Label>
            <Input
              id="setting-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="setting-units" className="text-right">
              Units
            </Label>
            <Select value={units} onValueChange={(v) => setUnits(v as 'meters' | 'feet')}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select units" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meters">Meters</SelectItem>
                <SelectItem value="feet">Feet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {data?.createdAt && (
             <div className="grid grid-cols-4 items-center gap-4">
               <Label className="text-right text-muted-foreground">Created</Label>
               <span className="col-span-3 text-sm text-muted-foreground">
                 {new Date(data.createdAt).toLocaleString()}
               </span>
             </div>
          )}
           {data?.updatedAt && (
             <div className="grid grid-cols-4 items-center gap-4">
               <Label className="text-right text-muted-foreground">Updated</Label>
               <span className="col-span-3 text-sm text-muted-foreground">
                 {new Date(data.updatedAt).toLocaleString()}
               </span>
             </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
