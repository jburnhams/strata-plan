import { useDialogStore } from '@/stores/dialogStore';

export const useDialog = (dialogId: string) => {
  const activeDialog = useDialogStore((state) => state.activeDialog);
  const openDialogStore = useDialogStore((state) => state.openDialog);
  const closeDialogStore = useDialogStore((state) => state.closeDialog);
  const dialogData = useDialogStore((state) => state.dialogData);

  const isOpen = activeDialog === dialogId;

  const openDialog = (data?: any) => openDialogStore(dialogId, data);
  const closeDialog = () => {
    if (isOpen) {
      closeDialogStore();
    }
  };

  return {
    isOpen,
    openDialog,
    closeDialog,
    data: isOpen ? dialogData : null,
  };
};
