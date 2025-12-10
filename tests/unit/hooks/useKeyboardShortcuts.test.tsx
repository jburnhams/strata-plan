import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import userEvent from '@testing-library/user-event';

describe('useKeyboardShortcuts', () => {
  it('calls handler when shortcut pressed', async () => {
    const user = userEvent.setup();
    const handler = jest.fn();

    renderHook(() => useKeyboardShortcuts({
      handlers: {
        SAVE: handler
      }
    }));

    await user.keyboard('{Control>}s{/Control}');
    expect(handler).toHaveBeenCalled();
  });

  it('does not call handler when in input', async () => {
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
    expect(handler).not.toHaveBeenCalled();
  });
});
