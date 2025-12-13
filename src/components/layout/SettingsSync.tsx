import { useEffect, useRef } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { loadSettings, saveSettings } from '@/services/storage/settingsStorage';

// Map between UI store quality and Storage material quality
// UI Store: 'low' | 'medium' | 'high'
// Storage: 'simple' | 'standard' | 'detailed'
const mapQualityToStorage = (quality: 'low' | 'medium' | 'high'): 'simple' | 'standard' | 'detailed' => {
    switch (quality) {
        case 'low': return 'simple';
        case 'medium': return 'standard';
        case 'high': return 'detailed';
        default: return 'standard';
    }
};

const mapQualityFromStorage = (quality: 'simple' | 'standard' | 'detailed'): 'low' | 'medium' | 'high' => {
    switch (quality) {
        case 'simple': return 'low';
        case 'standard': return 'medium';
        case 'detailed': return 'high';
        default: return 'medium';
    }
};

export function useSettingsSync() {
  const isInitialized = useRef(false);

  // Load settings on startup
  useEffect(() => {
    const init = async () => {
      if (isInitialized.current) return;

      try {
        const settings = await loadSettings();
        useUIStore.setState({
            theme: settings.theme,
            showGrid: settings.showGrid,
            gridSize: settings.gridSize,
            snapToGrid: settings.snapToGrid,
            viewerQuality: mapQualityFromStorage(settings.materialQuality),
        });
        isInitialized.current = true;
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    init();
  }, []);

  // Sync changes to storage
  useEffect(() => {
    const unsubscribe = useUIStore.subscribe((state) => {
        if (!isInitialized.current) return; // Don't save before loading

        saveSettings({
            theme: state.theme,
            showGrid: state.showGrid,
            gridSize: state.gridSize,
            snapToGrid: state.snapToGrid,
            materialQuality: mapQualityToStorage(state.viewerQuality),
        }).catch(err => console.error('Failed to save settings:', err));
    });

    return () => unsubscribe();
  }, []);
}

export function SettingsSync() {
    useSettingsSync();
    return null;
}
