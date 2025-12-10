import { useState, useRef } from "react"
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
import { Upload, FileText } from "lucide-react"

export function ImportDialog() {
  const { isOpen, closeDialog } = useDialog('import')
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleImport = () => {
    if (!file) return
    // TODO: Import logic
    console.log('Import', file)
    closeDialog()
    setFile(null)
  }

  const handleClose = () => {
      closeDialog()
      setFile(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Project</DialogTitle>
          <DialogDescription>
            Import a project from a JSON file.
          </DialogDescription>
        </DialogHeader>

        <div
            className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-10 mt-2 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json"
                onChange={handleFileChange}
            />

            {file ? (
                <div className="flex flex-col items-center gap-2">
                    <FileText className="h-10 w-10 text-primary" />
                    <span className="font-medium">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                    </span>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="h-10 w-10" />
                    <span>Click or drag file to upload</span>
                    <span className="text-xs">Supports .json files</span>
                </div>
            )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!file}>
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
