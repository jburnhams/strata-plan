import { ShortcutDef } from '@/constants/shortcuts';

export function formatShortcut(shortcut: ShortcutDef): string {
  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);
  const parts = [];

  if (shortcut.ctrl) parts.push(isMac ? '⌘' : 'Ctrl');
  if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt');
  if (shortcut.shift) parts.push('Shift');

  parts.push(shortcut.key.toUpperCase());

  return parts.join(isMac ? '' : '+');
}
