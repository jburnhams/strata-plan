import { renderHook, act } from '@testing-library/react';
import { useDialog } from '@/hooks/useDialog';
import { useDialogStore } from '@/stores/dialogStore';

describe('useDialog', () => {
  beforeEach(() => {
    act(() => {
      useDialogStore.setState({ activeDialog: null, dialogData: null });
    });
  });

  it('initially is closed', () => {
    const { result } = renderHook(() => useDialog('test-dialog'));
    expect(result.current.isOpen).toBe(false);
  });

  it('can open dialog', () => {
    const { result } = renderHook(() => useDialog('test-dialog'));
    act(() => {
      result.current.openDialog();
    });
    expect(result.current.isOpen).toBe(true);
  });

  it('can close dialog', () => {
    const { result } = renderHook(() => useDialog('test-dialog'));
    act(() => {
      result.current.openDialog();
    });
    expect(result.current.isOpen).toBe(true);
    act(() => {
      result.current.closeDialog();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('passes data', () => {
    const { result } = renderHook(() => useDialog('test-dialog'));
    const testData = { id: 1 };
    act(() => {
      result.current.openDialog(testData);
    });
    expect(result.current.data).toEqual(testData);
  });
});
