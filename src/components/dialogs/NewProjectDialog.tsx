import { useState } from "react"
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

export function NewProjectDialog() {
  const { isOpen, closeDialog } = useDialog('newProject')
  const [name, setName] = useState('')
  const [units, setUnits] = useState<'meters' | 'feet'>('meters')

  const handleCreate = () => {
    if (!name.trim()) return
    // TODO: Create project logic
    console.log('Create project', { name, units })
    closeDialog()
    setName('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
          <DialogDescription>
            Create a new floorplan project.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="units" className="text-right">
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
