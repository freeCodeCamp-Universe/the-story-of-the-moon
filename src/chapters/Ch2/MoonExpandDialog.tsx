import {
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent,
  type RefObject,
} from 'react';
import { Dialog } from '@/components/Dialog/Dialog';
import { Kbd } from '@/components/Kbd/Kbd';
import { useMoonRotationAnnouncement } from '@/hooks/useMoonRotationAnnouncement';
import type { MoonSceneHandle } from '@/three/moonScene';
import styles from './MoonExpandDialog.module.css';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLElement | null>;
  initialTarget: { lat: number; lon: number };
  reducedMotion: boolean;
};

export function MoonExpandDialog({
  isOpen,
  onClose,
  triggerRef,
  initialTarget,
  reducedMotion,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<MoonSceneHandle>(null);
  const { announcement, scheduleAnnouncement } =
    useMoonRotationAnnouncement(sceneRef);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const STEP = (8 * Math.PI) / 180;
      let deltaAzimuth = 0;
      let deltaPolar = 0;

      switch (event.key) {
        case 'ArrowLeft':
          deltaAzimuth = -STEP;
          break;
        case 'ArrowRight':
          deltaAzimuth = STEP;
          break;
        case 'ArrowUp':
          deltaPolar = -STEP;
          break;
        case 'ArrowDown':
          deltaPolar = STEP;
          break;
        default:
          return;
      }

      event.preventDefault();
      // Stop the keydown from bubbling to the background scene's own
      // keyboard handler. Dialog renders a native <dialog> in place
      // rather than through a portal, so it stays a DOM descendant of
      // the background scene's key-handling wrapper — without this,
      // one arrow press would rotate both scenes at once.
      event.stopPropagation();
      sceneRef.current?.rotateBy({ deltaAzimuth, deltaPolar });
      scheduleAnnouncement();
    },
    [scheduleAnnouncement]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let disposed = false;
    import('@/three/moonScene')
      .then(({ createMoonScene }) => {
        if (disposed || !canvasRef.current) {
          return;
        }

        const handle = createMoonScene(canvasRef.current, {
          enableOrbitControls: true,
          autoRotate: false,
          reducedMotion,
          initialTarget,
        });

        if (handle === null) {
          return;
        }

        sceneRef.current = handle;
      })
      .catch(() => undefined);

    return () => {
      disposed = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [initialTarget, isOpen, reducedMotion]);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      triggerRef={triggerRef}
      id="ch2-moon-expand-dialog"
      titleId="ch2-moon-expand-title"
      title="Explore the Moon"
      closeLabel="Close expanded view"
      variant="fluid"
    >
      <p className={styles.hint} aria-hidden="true">
        <span className={styles.sceneHintMobile}>Drag to rotate</span>
        <span className={styles.sceneHintDesktop}>
          Drag, or use <Kbd tone="muted">←</Kbd> <Kbd tone="muted">→</Kbd>{' '}
          <Kbd tone="muted">↑</Kbd> <Kbd tone="muted">↓</Kbd> to rotate
        </span>
      </p>
      <div
        tabIndex={0}
        role="group"
        aria-label="Interactive view of the Moon; drag or use arrow keys to rotate"
        className={styles.sceneGroup}
        onKeyDown={onKeyDown}
      >
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </Dialog>
  );
}
