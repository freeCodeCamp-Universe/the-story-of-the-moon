import { useEffect, useState } from 'react';

export const ANIMATIONS_STORAGE_KEY = 'story.animationsEnabled';
export const ANIMATIONS_PREFERENCE_EVENT = 'story:animations-preference-change';
export const REDUCED_MOTION_ATTRIBUTE = 'data-reduced-motion';

function readAnimationsPreference() {
  if (typeof window === 'undefined') {
    return true;
  }

  return window.localStorage.getItem(ANIMATIONS_STORAGE_KEY) !== 'false';
}

export function useAnimationsPreference() {
  const [animationsEnabled, setAnimationsEnabled] = useState(readAnimationsPreference);

  useEffect(() => {
    window.localStorage.setItem(ANIMATIONS_STORAGE_KEY, String(animationsEnabled));
    document.documentElement.toggleAttribute(REDUCED_MOTION_ATTRIBUTE, !animationsEnabled);
    window.dispatchEvent(new Event(ANIMATIONS_PREFERENCE_EVENT));
  }, [animationsEnabled]);

  return {
    animationsEnabled,
    setAnimationsEnabled,
  };
}
