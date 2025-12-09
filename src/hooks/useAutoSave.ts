import { useState, useEffect, useRef, useCallback } from 'react';
import { Floorplan } from '@/types/floorplan';
import { saveProject } from '@/services/storage/projectStorage';
import { useDebounce } from '@/hooks/useDebounce';

export interface AutoSaveState {
  status: 'idle' | 'saving' | 'saved' | 'error' | 'unsaved';
  lastSaved: Date | null;
  error: Error | null;
}

export const useAutoSave = (floorplan: Floorplan | null, enabled: boolean = true): AutoSaveState => {
  const [status, setStatus] = useState<AutoSaveState['status']>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // We need to keep track of the latest floorplan ref for the save function
  const floorplanRef = useRef(floorplan);

  useEffect(() => {
    floorplanRef.current = floorplan;
  }, [floorplan]);

  // Track if floorplan changes to mark as dirty
  // We skip the first mount or if floorplan is null
  useEffect(() => {
    if (floorplan && enabled) {
        setIsDirty(true);
        setStatus('unsaved');
    }
  }, [floorplan, enabled]);

  // Debounced floorplan for saving
  // We don't use the returned value directly, but the effect uses the debounce delay
  // Actually, useDebounce returns a value that updates after delay.
  // So when debouncedFloorplan updates, we trigger save.
  const AUTO_SAVE_DELAY = 30000; // 30 seconds
  const debouncedFloorplan = useDebounce(floorplan, AUTO_SAVE_DELAY);

  const save = useCallback(async () => {
    if (!floorplanRef.current || !enabled || !isDirty) return;

    try {
      setStatus('saving');
      setError(null);

      // Update updatedAt before saving? Usually done by store actions.
      // We assume floorplan is up to date.
      await saveProject(floorplanRef.current);

      setStatus('saved');
      setLastSaved(new Date());
      setIsDirty(false);
    } catch (err) {
      console.error('Auto-save failed:', err);
      setStatus('error');
      setError(err instanceof Error ? err : new Error('Unknown error during auto-save'));
    }
  }, [enabled, isDirty]); // Dependencies

  // Trigger save when debounced value changes
  useEffect(() => {
    if (debouncedFloorplan && isDirty && enabled) {
        save();
    }
  }, [debouncedFloorplan, isDirty, enabled, save]);

  // Handle beforeunload
  useEffect(() => {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
          if (isDirty) {
              e.preventDefault();
              // Assigning directly might fail in some test envs without mocks, but we mocked it.
              // However, check if e is actually modifiable.
              try {
                  e.returnValue = '';
              } catch (err) {
                  // Ignore assignment error in tests if property not writable
              }
              return '';
          }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  return { status, lastSaved, error };
};
