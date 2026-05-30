import { useEffect, useState } from 'react';

export const KEYBOARD_SHORTCUTS_STORAGE_KEY = 'story.keyboardShortcutsEnabled';

function readKeyboardShortcutsPreference() {
  if (typeof window === 'undefined') {
    return true;
  }

  return window.localStorage.getItem(KEYBOARD_SHORTCUTS_STORAGE_KEY) !== 'false';
}

export function useKeyboardShortcutsPreference() {
  const [shortcutsEnabled, setShortcutsEnabled] = useState(readKeyboardShortcutsPreference);

  useEffect(() => {
    window.localStorage.setItem(KEYBOARD_SHORTCUTS_STORAGE_KEY, String(shortcutsEnabled));
  }, [shortcutsEnabled]);

  return {
    shortcutsEnabled,
    setShortcutsEnabled,
  };
}
