import { useState } from "react"
import { useDialog } from "@/hooks/useDialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SHORTCUTS } from "@/constants/shortcuts"
import { Search } from "lucide-react"

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  // const { isOpen, closeDialog } = useDialog('shortcuts')
  const [search, setSearch] = useState('')

  const groupedShortcuts = Object.values(SHORTCUTS).reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) acc[shortcut.category] = []
    acc[shortcut.category].push(shortcut)
    return acc
  }, {} as Record<string, typeof SHORTCUTS[keyof typeof SHORTCUTS][]>)

  const filteredGroups = Object.entries(groupedShortcuts).map(([category, shortcuts]) => ({
    category,
    shortcuts: shortcuts.filter(s =>
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      category.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(g => g.shortcuts.length > 0)

  const formatKey = (s: typeof SHORTCUTS[keyof typeof SHORTCUTS]) => {
      const parts = []
      if (s.ctrl) parts.push('Ctrl')
      if (s.shift) parts.push('Shift')
      if (s.alt) parts.push('Alt')
      parts.push(s.key.toUpperCase())
      return parts.join(' + ')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search shortcuts..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>

        <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-6">
                {filteredGroups.map(group => (
                    <div key={group.category}>
                        <h3 className="mb-2 text-sm font-semibold text-muted-foreground">{group.category}</h3>
                        <div className="grid gap-2">
                            {group.shortcuts.map((shortcut, i) => (
                                <div key={i} className="flex items-center justify-between rounded-md border p-2 text-sm">
                                    <span>{shortcut.description}</span>
                                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                        {formatKey(shortcut)}
                                    </kbd>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                {filteredGroups.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No shortcuts found</p>
                )}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
