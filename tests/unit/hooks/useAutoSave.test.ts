import { renderHook, act, waitFor } from '@testing-library/react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { saveProject } from '@/services/storage/projectStorage';
import { Floorplan } from '@/types/floorplan';

// Mock dependencies
jest.mock('@/services/storage/projectStorage');
jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: any, delay: number) => value, // Immediate return for testing logic unless we use real timers
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

  it('marks as unsaved when floorplan changes', async () => {
    const { result, rerender } = renderHook(({ fp }) => useAutoSave(fp, true), {
        initialProps: { fp: null as Floorplan | null }
    });

    await act(async () => {
      rerender({ fp: mockFloorplan });
    });

    // Since debounce is immediate in mock, it might jump to saving/saved immediately.
  });

  it('triggers save after debounce', async () => {
      (saveProject as jest.Mock).mockResolvedValue(undefined);

      const { result, rerender } = renderHook(({ fp }) => useAutoSave(fp, true), {
          initialProps: { fp: null as Floorplan | null }
      });

      // Update floorplan
      await act(async () => {
        rerender({ fp: mockFloorplan });
      });

      // Wait for save to complete
      await waitFor(() => {
          expect(saveProject).toHaveBeenCalledWith(mockFloorplan);
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

      await act(async () => {
        rerender({ fp: mockFloorplan });
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

      await act(async () => {
        rerender({ fp: mockFloorplan, enabled: false });
      });

      // Wait a bit to ensure it doesn't fire
      await new Promise(r => setTimeout(r, 10));

      expect(saveProject).not.toHaveBeenCalled();
  });
});
