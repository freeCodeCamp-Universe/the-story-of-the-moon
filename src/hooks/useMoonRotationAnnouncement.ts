import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import type { MoonSceneHandle } from '@/three/moonScene';

const ANNOUNCEMENT_DEBOUNCE_MS = 600;

export function formatLatLon(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(1)}°${latDir} ${Math.abs(lon).toFixed(1)}°${lonDir}`;
}

/**
 * Debounced "Viewing lat lon" announcement for a Moon scene's camera
 * position, read off the given scene handle ref. Meant to be rendered
 * into a caller-owned sr-only aria-live region. A zero-width-space
 * toggle is appended to the text so repeated identical announcements
 * still re-trigger the live region.
 */
export function useMoonRotationAnnouncement(
  sceneRef: RefObject<MoonSceneHandle>
) {
  const [announcement, setAnnouncement] = useState('');
  const timerRef = useRef<number | null>(null);
  const toggleRef = useRef(false);

  const cancelAnnouncement = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearAnnouncement = useCallback(() => {
    cancelAnnouncement();
    setAnnouncement('');
  }, [cancelAnnouncement]);

  const scheduleAnnouncement = useCallback(() => {
    cancelAnnouncement();
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      const cameraLatLon = sceneRef.current?.getCameraLatLon();
      if (!cameraLatLon) {
        return;
      }
      toggleRef.current = !toggleRef.current;
      const suffix = toggleRef.current ? '\u200B' : '';
      setAnnouncement(
        `Viewing ${formatLatLon(cameraLatLon.lat, cameraLatLon.lon)}${suffix}`
      );
    }, ANNOUNCEMENT_DEBOUNCE_MS);
  }, [cancelAnnouncement, sceneRef]);

  useEffect(() => cancelAnnouncement, [cancelAnnouncement]);

  return {
    announcement,
    scheduleAnnouncement,
    cancelAnnouncement,
    clearAnnouncement,
  };
}
