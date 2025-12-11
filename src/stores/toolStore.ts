import { create } from 'zustand';

export type ToolType = 'select' | 'pan' | 'wall' | 'measure' | 'door' | 'window';

interface ToolState {
  activeTool: ToolType;
  setTool: (tool: ToolType) => void;
}

export const useToolStore = create<ToolState>((set) => ({
  activeTool: 'select',
  setTool: (tool) => set({ activeTool: tool }),
}));
