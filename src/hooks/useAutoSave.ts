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
  const initialMount = useRef(true);

  useEffect(() => {
    floorplanRef.current = floorplan;
  }, [floorplan]);

  // Track if floorplan changes to mark as dirty
  useEffect(() => {
    if (floorplan && enabled) {
        if (initialMount.current) {
            initialMount.current = false;
        } else {
            setIsDirty(true);
            setStatus('unsaved');
        }
    }
  }, [floorplan, enabled]);

  const AUTO_SAVE_DELAY = 30000; // 30 seconds
  const debouncedFloorplan = useDebounce(floorplan, AUTO_SAVE_DELAY);

  const save = useCallback(async () => {
    if (!floorplanRef.current || !enabled || !isDirty) return;

    try {
      setStatus('saving');
      setError(null);

      await saveProject(floorplanRef.current);

      setStatus('saved');
      setLastSaved(new Date());
      setIsDirty(false);
    } catch (err) {
      console.error('Auto-save failed:', err);
      setStatus('error');
      setError(err instanceof Error ? err : new Error('Unknown error during auto-save'));
    }
  }, [enabled, isDirty]);

  // Trigger save when debounced value catches up to current value and we are dirty
  useEffect(() => {
    // We check if debouncedFloorplan is the same instance as the current one.
    // This implies that the debounce timer has finished for the LATEST change.
    if (debouncedFloorplan && debouncedFloorplan === floorplanRef.current && isDirty && enabled) {
        save();
    }
  }, [debouncedFloorplan, isDirty, enabled, save]);

  // Handle beforeunload
  useEffect(() => {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
          if (isDirty) {
              e.preventDefault();
              try {
                  e.returnValue = '';
              } catch (err) {
                  // Ignore
              }
              return '';
          }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  return { status, lastSaved, error };
};
