import { formatShortcut } from '@/utils/keyboard';
import { ShortcutDef } from '@/constants/shortcuts';

describe('formatShortcut', () => {
  const shortcut: ShortcutDef = {
    key: 's',
    ctrl: true,
    description: 'Save',
    category: 'General',
  };

  it('formats correctly for non-Mac', () => {
    // Mock navigator
    Object.defineProperty(window, 'navigator', {
      value: { platform: 'Windows' },
      writable: true,
    });
    expect(formatShortcut(shortcut)).toBe('Ctrl+S');
  });

  it('formats correctly for Mac', () => {
    Object.defineProperty(window, 'navigator', {
      value: { platform: 'MacIntel' },
      writable: true,
    });
    expect(formatShortcut(shortcut)).toBe('⌘S');
  });
});
