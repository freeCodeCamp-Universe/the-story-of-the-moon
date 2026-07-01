import { useEffect, useState } from 'react';

export const THEME_STORAGE_KEY = 'story.darkThemeEnabled';

function readThemePreference(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored !== null) {
    return stored !== 'false';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useTheme() {
  const [darkThemeEnabled, setDarkThemeEnabled] = useState(readThemePreference);

  useEffect(() => {
    document.documentElement.dataset.theme = darkThemeEnabled
      ? 'dark'
      : 'light';
  }, [darkThemeEnabled]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');

    function handleChange(event: MediaQueryListEvent) {
      if (window.localStorage.getItem(THEME_STORAGE_KEY) === null) {
        setDarkThemeEnabled(event.matches);
      }
    }

    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  function setTheme(enabled: boolean) {
    window.localStorage.setItem(THEME_STORAGE_KEY, String(enabled));
    setDarkThemeEnabled(enabled);
  }

  return {
    darkThemeEnabled,
    setDarkThemeEnabled: setTheme,
  };
}
