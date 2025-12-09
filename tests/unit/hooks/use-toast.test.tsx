import { renderHook, act } from '@testing-library/react';
import { useToast, toast } from '@/hooks/use-toast';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

describe('useToast Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    // Clear toasts
    act(() => {
      const { dismiss } = toast({});
      dismiss(); // Dismiss all
    });
    // Fast forward to remove them
    act(() => {
        jest.runAllTimers();
    });
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });

  it('should add a toast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      toast({ title: 'Test Toast', description: 'Testing' });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Test Toast');
    expect(result.current.toasts[0].open).toBe(true);
  });

  it('should dismiss a toast', () => {
    const { result } = renderHook(() => useToast());

    let toastId: string;
    act(() => {
      const t = toast({ title: 'Test Toast' });
      toastId = t.id;
    });

    act(() => {
      result.current.dismiss(toastId!);
    });

    // Dismiss sets open to false
    expect(result.current.toasts[0].open).toBe(false);

    // Should still be in array until timeout
    expect(result.current.toasts).toHaveLength(1);

    // Fast forward timeout
    act(() => {
        jest.runAllTimers();
    });

    // Should be removed
    expect(result.current.toasts).toHaveLength(0);
  });

  it('should limit number of toasts', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      toast({ title: 'Toast 1' });
      toast({ title: 'Toast 2' });
    });

    // Limit is 1
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Toast 2');
  });

  it('should update a toast', () => {
    const { result } = renderHook(() => useToast());

    let updateFn: (props: any) => void;

    act(() => {
       const { update } = toast({ title: 'Original Title' });
       updateFn = update;
    });

    expect(result.current.toasts[0].title).toBe('Original Title');

    act(() => {
        updateFn({ title: 'Updated Title' });
    });

    expect(result.current.toasts[0].title).toBe('Updated Title');
  });

  it('should dismiss all toasts if no ID provided', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
        toast({ title: 'Toast 1' });
    });

    act(() => {
        result.current.dismiss();
    });

    expect(result.current.toasts[0].open).toBe(false);
  });
});
