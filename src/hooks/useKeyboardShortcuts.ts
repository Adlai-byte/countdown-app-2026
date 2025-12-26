import { useEffect, useCallback, useRef } from 'react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
  enabled?: boolean;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(
  shortcuts: ShortcutConfig[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true, preventDefault = true } = options;
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    for (const shortcut of shortcutsRef.current) {
      if (shortcut.enabled === false) continue;

      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = !!shortcut.ctrl === (event.ctrlKey || event.metaKey);
      const shiftMatches = !!shortcut.shift === event.shiftKey;
      const altMatches = !!shortcut.alt === event.altKey;

      if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
        if (preventDefault) {
          event.preventDefault();
        }
        shortcut.action();
        break;
      }
    }
  }, [preventDefault]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);

  return {
    shortcuts: shortcuts.filter(s => s.enabled !== false),
  };
}

// Global shortcuts configuration
export const GLOBAL_SHORTCUTS = {
  NAVIGATE_HOME: { key: '1', description: 'Go to Countdown' },
  NAVIGATE_PHOTO: { key: '2', description: 'Go to Photo Booth' },
  NAVIGATE_MEMES: { key: '3', description: 'Go to Memes' },
  NAVIGATE_FUN: { key: '4', description: 'Go to Fun Zone' },
  NAVIGATE_GUEST: { key: '5', description: 'Go to Guest Book' },
  NAVIGATE_GOALS: { key: '6', description: 'Go to Goals' },
  NAVIGATE_SETTINGS: { key: '7', description: 'Go to Settings' },
  SHOW_SHORTCUTS: { key: '?', shift: true, description: 'Show keyboard shortcuts' },
  TOGGLE_CONFETTI: { key: 'c', description: 'Launch confetti' },
  ESCAPE: { key: 'Escape', description: 'Close modal/Go back' },
} as const;

// Format shortcut for display
export function formatShortcut(shortcut: Partial<ShortcutConfig>): string {
  const parts: string[] = [];

  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.meta) parts.push('Cmd');

  if (shortcut.key) {
    const keyDisplay = shortcut.key.length === 1
      ? shortcut.key.toUpperCase()
      : shortcut.key;
    parts.push(keyDisplay);
  }

  return parts.join(' + ');
}
