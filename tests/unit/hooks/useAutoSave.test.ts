import { renderHook, act } from '@testing-library/react';
import { useAutoSave } from '../../../src/hooks/useAutoSave';
import { saveProject } from '../../../src/services/storage/projectStorage';
import { mockFloorplan } from '../../utils/mockData';

jest.mock('../../../src/services/storage/projectStorage');
jest.mock('../../../src/hooks/useDebounce', () => ({
  useDebounce: (value: any) => value, // Immediate debounce for testing logic flow, or manage timer
}));

// We need to control debounce manually or use real debounce with fake timers.
// If I mock useDebounce to immediate return, it saves immediately?
// But the logic is: `debouncedFloorplan === floorplanRef.current` check.
// If immediate, it is true.

// Let's use real debounce with fake timers.
// So I should UNMOCK useDebounce or rely on the real one?
// `useDebounce.ts` is simple.
// "Testing the 'useDebounce' hook requires 'jest.useFakeTimers'".

// Let's rely on real useDebounce and useFakeTimers.
jest.unmock('../../../src/hooks/useDebounce');

describe('useAutoSave', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with idle status', () => {
    const { result } = renderHook(() => useAutoSave(null));
    expect(result.current.status).toBe('idle');
  });

  it('should mark as dirty when floorplan changes', () => {
    const { result, rerender } = renderHook(({ fp }) => useAutoSave(fp), {
      initialProps: { fp: mockFloorplan() }
    });

    expect(result.current.status).toBe('idle'); // Initial mount doesn't dirty

    // Update floorplan
    const newFloorplan = { ...mockFloorplan(), name: 'Changed' };
    rerender({ fp: newFloorplan });

    expect(result.current.status).toBe('unsaved');
  });

  it('should trigger save after delay', async () => {
    (saveProject as jest.Mock).mockResolvedValue(true);

    const { result, rerender } = renderHook(({ fp }) => useAutoSave(fp), {
      initialProps: { fp: mockFloorplan() }
    });

    // Update floorplan
    const newFloorplan = { ...mockFloorplan(), name: 'Changed' };
    rerender({ fp: newFloorplan });

    expect(result.current.status).toBe('unsaved');

    // Fast forward time (30s)
    await act(async () => {
        jest.advanceTimersByTime(30000);
    });

    // Wait for async operations
    await act(async () => {
       await Promise.resolve();
    });

    expect(saveProject).toHaveBeenCalledWith(newFloorplan);
    expect(result.current.status).toBe('saved');
    expect(result.current.lastSaved).toBeInstanceOf(Date);
  });

  it('should handle save error', async () => {
    (saveProject as jest.Mock).mockRejectedValue(new Error('Save failed'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result, rerender } = renderHook(({ fp }) => useAutoSave(fp), {
      initialProps: { fp: mockFloorplan() }
    });

    const newFloorplan = { ...mockFloorplan(), name: 'Changed' };
    rerender({ fp: newFloorplan });

    await act(async () => {
        jest.advanceTimersByTime(30000);
    });

    await act(async () => {
       await Promise.resolve();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBeInstanceOf(Error);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should not save if disabled', async () => {
    const { result, rerender } = renderHook(({ fp, enabled }) => useAutoSave(fp, enabled), {
      initialProps: { fp: mockFloorplan(), enabled: false }
    });

    const newFloorplan = { ...mockFloorplan(), name: 'Changed' };
    rerender({ fp: newFloorplan, enabled: false });

    // It should NOT mark as dirty if disabled?
    // Logic: `if (floorplan && enabled) { ... setIsDirty(true) }`
    // So status remains idle.
    expect(result.current.status).toBe('idle');

    await act(async () => {
        jest.advanceTimersByTime(30000);
    });

    expect(saveProject).not.toHaveBeenCalled();
  });

  it('should prevent unload when dirty', () => {
    const { result, rerender } = renderHook(({ fp }) => useAutoSave(fp), {
      initialProps: { fp: mockFloorplan() }
    });

    const newFloorplan = { ...mockFloorplan(), name: 'Changed' };
    rerender({ fp: newFloorplan });

    // Trigger beforeunload
    const event = new Event('beforeunload');
    Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

    // We can't easily check returnValue setter without Proxy or Object.defineProperty,
    // but we can check preventDefault.

    act(() => {
        window.dispatchEvent(event);
    });

    expect(event.preventDefault).toHaveBeenCalled();
  });
});
