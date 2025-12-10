import { NewProjectDialog } from "./NewProjectDialog"
import { ProjectSettingsDialog } from "./ProjectSettingsDialog"
import { ExportDialog } from "./ExportDialog"
import { ImportDialog } from "./ImportDialog"
import { KeyboardShortcutsDialog } from "./KeyboardShortcutsDialog"

export function DialogProvider() {
  return (
    <>
      <NewProjectDialog />
      <ProjectSettingsDialog />
      <ExportDialog />
      <ImportDialog />
      <KeyboardShortcutsDialog />
    </>
  )
}
