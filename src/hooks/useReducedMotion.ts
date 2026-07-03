import { useEffect, useState } from 'react';
import {
  ANIMATIONS_PREFERENCE_EVENT,
  ANIMATIONS_STORAGE_KEY,
} from '@/hooks/useAnimationsPreference';

function osPrefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function userDisabledAnimations() {
  return window.localStorage.getItem(ANIMATIONS_STORAGE_KEY) === 'false';
}

/**
 * One-shot read of the combined motion preference (OS setting or the in-app
 * animations toggle), for event handlers and other non-React code. Components
 * should use `useReducedMotion`, which also re-renders on changes.
 */
export function prefersReducedMotion(): boolean {
  return osPrefersReducedMotion() || userDisabledAnimations();
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => osPrefersReducedMotion() || userDisabledAnimations()
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () =>
      setReduced(osPrefersReducedMotion() || userDisabledAnimations());

    mq.addEventListener('change', update);
    window.addEventListener(ANIMATIONS_PREFERENCE_EVENT, update);

    return () => {
      mq.removeEventListener('change', update);
      window.removeEventListener(ANIMATIONS_PREFERENCE_EVENT, update);
    };
  }, []);

  return reduced;
}
