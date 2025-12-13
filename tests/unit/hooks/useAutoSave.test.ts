import { renderHook, act, waitFor } from '@testing-library/react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { saveProject } from '@/services/storage/projectStorage';
import { Floorplan } from '@/types/floorplan';

// Mock dependencies
jest.mock('@/services/storage/projectStorage');
jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: any, delay: number) => {
      // We want to simulate the debounce delay manually or have it update immediately if we want
      // But for testing the new logic (wait for debounce change), we need control.
      // If we return value immediately, the effect runs immediately.
      return value;
  }
}));

describe('useAutoSave Hook', () => {
  const mockFloorplan = { id: 'p1', name: 'Test' } as Floorplan;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with idle status', () => {
    const { result } = renderHook(() => useAutoSave(null, true));
    expect(result.current.status).toBe('idle');
  });

  it('triggers save after debounce', async () => {
      (saveProject as jest.Mock).mockResolvedValue(undefined);

      // Start with null to simulate load
      const { result, rerender } = renderHook(({ fp }) => useAutoSave(fp, true), {
          initialProps: { fp: null as Floorplan | null }
      });

      // Update floorplan (first load)
      await act(async () => {
        rerender({ fp: mockFloorplan });
      });

      // Should NOT save on initial load due to our new logic
      expect(saveProject).not.toHaveBeenCalled();

      // Update again (change)
      const changed = { ...mockFloorplan, name: 'Changed' };
      await act(async () => {
          rerender({ fp: changed });
      });

      // Since mock debounce is immediate, debounced value updates immediately.
      // And isDirty becomes true.
      // So save should trigger.

      // Wait for save to complete
      await waitFor(() => {
          expect(saveProject).toHaveBeenCalledWith(changed);
      });

      expect(result.current.status).toBe('saved');
      expect(result.current.lastSaved).toBeInstanceOf(Date);
  });

  it('handles save errors', async () => {
      const error = new Error('Save failed');
      (saveProject as jest.Mock).mockRejectedValue(error);

      const { result, rerender } = renderHook(({ fp }) => useAutoSave(fp, true), {
          initialProps: { fp: null as Floorplan | null }
      });

      // Suppress console.error for this test
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Initial load
      await act(async () => {
        rerender({ fp: mockFloorplan });
      });

      // Change
      const changed = { ...mockFloorplan, name: 'Changed' };
      await act(async () => {
        rerender({ fp: changed });
      });

      await waitFor(() => {
          expect(result.current.status).toBe('error');
      });
      expect(result.current.error).toBe(error);

      spy.mockRestore();
  });

  it('does not save if disabled', async () => {
      const { result, rerender } = renderHook(({ fp, enabled }) => useAutoSave(fp, enabled), {
          initialProps: { fp: null as Floorplan | null, enabled: false }
      });

      // Initial load
      await act(async () => {
        rerender({ fp: mockFloorplan, enabled: false });
      });

      // Change
      const changed = { ...mockFloorplan, name: 'Changed' };
      await act(async () => {
        rerender({ fp: changed, enabled: false });
      });

      // Wait a bit to ensure it doesn't fire
      await new Promise(r => setTimeout(r, 10));

      expect(saveProject).not.toHaveBeenCalled();
  });
});
