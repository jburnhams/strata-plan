import { useEffect } from 'react';
import { SHORTCUTS } from '@/constants/shortcuts';

type ShortcutHandler = () => void;

interface UseKeyboardShortcutsOptions {
  handlers: Partial<Record<keyof typeof SHORTCUTS, ShortcutHandler>>;
}

export function useKeyboardShortcuts({ handlers }: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if focus is in input/textarea/select
      const target = event.target as HTMLElement;
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
        target.isContentEditable
      ) {
        // Special case: Escape blurs the input
        if (event.key === 'Escape') {
             target.blur();
             return;
        }
        return;
      }

      for (const [key, def] of Object.entries(SHORTCUTS)) {
        if (!handlers[key as keyof typeof SHORTCUTS]) continue;

        const matchesKey = event.key.toLowerCase() === def.key.toLowerCase();
        const matchesCtrl = !!def.ctrl === (event.ctrlKey || event.metaKey); // Handle Mac Command
        const matchesShift = !!def.shift === event.shiftKey;
        const matchesAlt = !!def.alt === event.altKey;

        if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
          event.preventDefault();
          handlers[key as keyof typeof SHORTCUTS]?.();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
