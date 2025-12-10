import { renderHook, act } from '@testing-library/react';
import { useToast, toast } from '@/hooks/use-toast';

describe('useToast', () => {
  beforeEach(() => {
    // Clear toasts
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.dismiss();
    });
  });

  it('should add a toast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      toast({
        title: 'Test Toast',
        description: 'This is a test',
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Test Toast');
  });

  it('should update a toast', () => {
    const { result } = renderHook(() => useToast());

    let toastId: string;
    act(() => {
      const { id } = toast({
        title: 'Initial Title',
      });
      toastId = id;
    });

    const t = result.current.toasts.find((t) => t.id === toastId!);
    expect(t).toBeDefined();

    let updateFn: (props: any) => void;
    act(() => {
        // We need to capture the update function from the toast() call
        // But since we can't access the return value of the toast() called inside previous act easily without variable,
        // we'll create a new toast here to test update.
        // Or we can use the `update` from `result.current`? No, useToast doesn't expose update.
        // Wait, the hook exposes `toast` function which returns `{ id, dismiss, update }`.
    });

    // Let's redo this test logic to be cleaner
    let updateFunc: any;
    act(() => {
        const ret = toast({ title: 'To Update' });
        updateFunc = ret.update;
    });

    act(() => {
        updateFunc({ title: 'Updated Title' });
    });

    expect(result.current.toasts[0].title).toBe('Updated Title');
  });

  it('should dismiss a toast', () => {
    const { result } = renderHook(() => useToast());

    let toastId: string;
    act(() => {
      const ret = toast({ title: 'To Dismiss' });
      toastId = ret.id;
    });

    expect(result.current.toasts[0].open).toBe(true);

    act(() => {
      result.current.dismiss(toastId);
    });

    expect(result.current.toasts[0].open).toBe(false);
  });

  it('should dismiss all toasts', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      toast({ title: 'Toast 1' });
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.toasts[0].open).toBe(false);
  });

  it('should handle onOpenChange', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
          toast({ title: 'Test' });
      });

      const t = result.current.toasts[0];
      expect(t.onOpenChange).toBeDefined();

      act(() => {
          t.onOpenChange?.(false);
      });

      // Should be dismissed (open=false)
      expect(result.current.toasts[0].open).toBe(false);
  });

  it('should enforce toast limit', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      toast({ title: 'Toast 1' });
      toast({ title: 'Toast 2' });
    });

    // Limit is 1 defined in use-toast.ts
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Toast 2');
  });

  it('should remove toast after delay', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useToast());

    act(() => {
      toast({ title: 'To Remove' });
    });

    // Dismiss to trigger removal queue
    act(() => {
        result.current.dismiss();
    });

    expect(result.current.toasts[0].open).toBe(false);

    // Fast-forward
    act(() => {
        jest.runAllTimers();
    });

    expect(result.current.toasts).toHaveLength(0);

    jest.useRealTimers();
  });
});
