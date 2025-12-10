import { create } from 'zustand';

interface DialogState {
  activeDialog: string | null;
  dialogData: any;
  openDialog: (id: string, data?: any) => void;
  closeDialog: () => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  activeDialog: null,
  dialogData: null,
  openDialog: (id, data = null) => set({ activeDialog: id, dialogData: data }),
  closeDialog: () => set({ activeDialog: null, dialogData: null }),
}));
