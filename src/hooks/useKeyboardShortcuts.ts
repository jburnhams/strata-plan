import { useEffect } from 'react';
import { SHORTCUTS } from '@/constants/shortcuts';

type ShortcutHandler = () => void;

interface UseKeyboardShortcutsOptions {
  handlers: Partial<Record<keyof typeof SHORTCUTS, ShortcutHandler>>;
}

export function useKeyboardShortcuts({ handlers }: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Find the matching shortcut first to decide if we should prevent default/ignore inputs
      let matchedKey: string | null = null;

      for (const [key, def] of Object.entries(SHORTCUTS)) {
        if (!handlers[key as keyof typeof SHORTCUTS]) continue;

        const matchesKey = event.key.toLowerCase() === def.key.toLowerCase();
        // Allow Meta for Ctrl on Mac
        const matchesCtrl = !!def.ctrl === (event.ctrlKey || event.metaKey);
        const matchesShift = !!def.shift === event.shiftKey;
        const matchesAlt = !!def.alt === event.altKey;

        if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
            matchedKey = key;
            break;
        }
      }

      if (!matchedKey) return;

      const def = SHORTCUTS[matchedKey];
      const target = event.target as HTMLElement;

      // If it's a "General" shortcut like Save or Undo/Redo, we often want it to work even in inputs,
      // OR we want to be selective.
      // Typically, Ctrl+S works everywhere. Ctrl+Z usually works in inputs natively (so maybe we shouldn't override?)
      // But ESC usually blurs.

      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;

      // Special handling for Save (Ctrl+S) - allow even in inputs
      if (matchedKey === 'SAVE') {
          event.preventDefault();
          handlers.SAVE?.();
          return;
      }

      if (isInput) {
        // Special case: Escape blurs the input
        if (event.key === 'Escape') {
             target.blur();
             return;
        }
        return; // Ignore other shortcuts in inputs
      }

      // Execute handler
      event.preventDefault();
      handlers[matchedKey as keyof typeof SHORTCUTS]?.();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
