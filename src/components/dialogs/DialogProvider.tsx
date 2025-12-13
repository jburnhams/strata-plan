import React from 'react';
import { useDialogStore } from '../../stores/dialogStore';
import {
  DIALOG_NEW_PROJECT,
  DIALOG_PROJECT_SETTINGS,
  DIALOG_RENAME_PROJECT,
  DIALOG_DELETE_PROJECT,
  DIALOG_EXPORT,
  DIALOG_IMPORT,
  DIALOG_KEYBOARD_SHORTCUTS,
  DIALOG_COLOR_SCHEME
} from '../../constants/dialogs';

import { NewProjectDialog } from "./NewProjectDialog";
import { ProjectSettingsDialog } from "./ProjectSettingsDialog";
import { RenameProjectDialog } from "./RenameProjectDialog";
import { DeleteProjectDialog } from "./DeleteProjectDialog";
import { ExportDialog } from "./ExportDialog";
import { ImportDialog } from "./ImportDialog";
import { KeyboardShortcutsDialog } from "./KeyboardShortcutsDialog";
import { ColorSchemeDialog } from "./ColorSchemeDialog";

export function DialogProvider() {
  const { activeDialog, dialogData, closeDialog } = useDialogStore();

  const handleOpenChange = (open: boolean) => {
    if (!open) closeDialog();
  };

  return (
    <>
      <NewProjectDialog
        open={activeDialog === DIALOG_NEW_PROJECT}
        onOpenChange={handleOpenChange}
      />

      {activeDialog === DIALOG_PROJECT_SETTINGS && dialogData && (
        <ProjectSettingsDialog
          open={true}
          onOpenChange={handleOpenChange}
          project={dialogData.project}
          onSave={dialogData.onSave}
        />
      )}

      {activeDialog === DIALOG_RENAME_PROJECT && dialogData && (
        <RenameProjectDialog
          open={true}
          onOpenChange={handleOpenChange}
          currentName={dialogData.currentName}
          onRename={dialogData.onRename}
        />
      )}

      {activeDialog === DIALOG_DELETE_PROJECT && dialogData && (
        <DeleteProjectDialog
          open={true}
          onOpenChange={handleOpenChange}
          projectName={dialogData.projectName}
          onDelete={dialogData.onDelete}
        />
      )}

      <ExportDialog
        open={activeDialog === DIALOG_EXPORT}
        onOpenChange={handleOpenChange}
      />

      <ImportDialog
        open={activeDialog === DIALOG_IMPORT}
        onOpenChange={handleOpenChange}
      />

      <KeyboardShortcutsDialog
        open={activeDialog === DIALOG_KEYBOARD_SHORTCUTS}
        onOpenChange={handleOpenChange}
      />

      <ColorSchemeDialog
        open={activeDialog === DIALOG_COLOR_SCHEME}
        onOpenChange={handleOpenChange}
      />
    </>
  );
}
