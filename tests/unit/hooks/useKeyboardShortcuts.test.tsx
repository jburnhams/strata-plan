import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import userEvent from '@testing-library/user-event';

describe('useKeyboardShortcuts', () => {
  it('calls handler when shortcut pressed', async () => {
    const user = userEvent.setup();
    const handler = jest.fn();

    renderHook(() => useKeyboardShortcuts({
      handlers: {
        ZOOM_IN: handler // Use a non-Ctrl shortcut or check defs. ZOOM_IN is '='
      }
    }));

    await user.keyboard('=');
    expect(handler).toHaveBeenCalled();
  });

  it('calls SAVE handler even when in input', async () => {
    const user = userEvent.setup();
    const handler = jest.fn();

    renderHook(() => useKeyboardShortcuts({
      handlers: {
        SAVE: handler
      }
    }));

    document.body.innerHTML = '<input />';
    const input = document.querySelector('input')!;
    input.focus();

    await user.keyboard('{Control>}s{/Control}');
    expect(handler).toHaveBeenCalled();
  });

  it('does not call other handlers when in input', async () => {
    const user = userEvent.setup();
    const handler = jest.fn();

    renderHook(() => useKeyboardShortcuts({
      handlers: {
        ZOOM_IN: handler
      }
    }));

    document.body.innerHTML = '<input />';
    const input = document.querySelector('input')!;
    input.focus();

    await user.keyboard('=');
    expect(handler).not.toHaveBeenCalled();
  });
});
