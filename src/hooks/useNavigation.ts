import { create } from 'zustand';
import { useFloorplanStore } from '../stores/floorplanStore';
import { MeasurementUnit } from '../types/floorplan';
import { useDialogStore } from '../stores/dialogStore';

export type AppView = 'landing' | 'projectList' | 'editor';

interface NavigationState {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
}

const useNavigationStore = create<NavigationState>((set) => ({
  currentView: 'landing', // Default to landing page
  setCurrentView: (view) => set({ currentView: view }),
}));

export function useNavigation() {
  const currentView = useNavigationStore((state) => state.currentView);
  const setCurrentView = useNavigationStore((state) => state.setCurrentView);

  const createFloorplan = useFloorplanStore((state) => state.createFloorplan);
  const loadFloorplan = useFloorplanStore((state) => state.loadFloorplan);

  // Dialog store might be used for unsaved changes confirmation in future
  // const openDialog = useDialogStore((state) => state.openDialog);

  const navigateTo = (view: AppView) => {
    // TODO: Check for unsaved changes here
    setCurrentView(view);
  };

  const openProject = (id: string) => {
    // This will be connected to actual storage loading logic
    // For now we just switch to editor
    // In a real implementation, we would load the project first
    navigateTo('editor');
  };

  const createProject = (name: string, units: MeasurementUnit) => {
    createFloorplan(name, units);
    navigateTo('editor');
  };

  const closeProject = () => {
    // TODO: Check for unsaved changes
    navigateTo('landing');
  };

  return {
    currentView,
    navigateTo,
    openProject,
    createProject,
    closeProject,
  };
}
