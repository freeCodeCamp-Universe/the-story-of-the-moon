import { useCallback, useEffect, useRef, useState } from 'react';
import ScrollyChapter, { type ScrollyStep } from '@/components/ScrollyChapter';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { EarthMoonSceneHandle } from '@/three/earthMoonScene';
import styles from './Ch3.module.css';

type StepState = {
  withMoon: boolean;
  showEclipse: boolean;
  showFullMoon: boolean;
  showLunarEclipse: boolean;
};

const STEP_STATES: Record<string, StepState> = {
  'tidal-bulges': {
    withMoon: true,
    showEclipse: false,
    showFullMoon: false,
    showLunarEclipse: false,
  },
  'axial-stabilization': {
    withMoon: true,
    showEclipse: false,
    showFullMoon: false,
    showLunarEclipse: false,
  },
  'full-moon-alignment': {
    withMoon: true,
    showEclipse: false,
    showFullMoon: true,
    showLunarEclipse: false,
  },
  'without-moon': {
    withMoon: false,
    showEclipse: false,
    showFullMoon: false,
    showLunarEclipse: false,
  },
  'eclipse-alignment': {
    withMoon: true,
    showEclipse: true,
    showFullMoon: false,
    showLunarEclipse: false,
  },
  'lunar-eclipse-alignment': {
    withMoon: true,
    showEclipse: false,
    showFullMoon: false,
    showLunarEclipse: true,
  },
};

const STEPS: ScrollyStep[] = [
  {
    id: 'tidal-bulges',
    marker: '01  tides',
    content: (
      <>
        <h3>Tides are the Moon&apos;s most visible signature</h3>
        <p>
          The Moon's gravity pulls more strongly on the side of Earth facing it, creating a tidal bulge. On the opposite side, the combination of inertia and a weaker gravitational pull creates a second, balancing bulge. As Earth rotates through
          these two swells of water, most coastlines experience a predictable cycle of two high tides and two low tides roughly every day.
        </p>
      </>
    ),
  },
  {
    id: 'axial-stabilization',
    marker: '02  axial stabilization',
    content: (
      <>
        <h3>The Moon steadies Earth&apos;s spin</h3>
        <p>
          Earth maintains a stable tilt of about 23.5 degrees relative to its path around the Sun, which is what creates seasons. The Moon's gravity prevents this angle from shifting wildly, keeping climate zones predictable over long periods of
          time.
        </p>
      </>
    ),
  },
  {
    id: 'without-moon',
    marker: '03  without the moon',
    content: (
      <>
        <h3>A moonless Earth would wobble</h3>
        <p>
          Without a large moon to act as an anchor, computer models suggest Earth's tilt could wander by tens of degrees over hundreds of millions of years, pulled by the gravity of other planets. This instability would cause climate zones to shift
          drastically across the globe. Seasons as we know them would not be permanent; they would appear, disappear, or become extreme over geological time.
        </p>
      </>
    ),
  },
  {
    id: 'full-moon-alignment',
    marker: '04  full moon',
    content: (
      <>
        <h3>When sunlight reaches the Moon directly</h3>
        <p>
          Once a month, the Moon sits opposite the Sun with Earth between them. From Earth we see its illuminated hemisphere face us directly. However, the Moon's orbit is tilted a few degrees relative to Earth's path around the Sun, so the three
          bodies rarely form a perfect straight line. This tilt keeps the Moon clear of Earth's shadow, creating a regular full moon.
        </p>
      </>
    ),
  },
  {
    id: 'lunar-eclipse-alignment',
    marker: '05  lunar eclipse',
    content: (
      <>
        <h3>When sunlight is filtered through the atmosphere</h3>
        <p>
          At least twice a year, the Moon passes through Earth's shadow, an event known as a lunar eclipse. In a partial alignment, the shadowed portion of the Moon appears dark and may take on a faint red hue, though this color is often masked by
          the brilliance of the remaining sunlight.
        </p>
        <p>
          When the Sun, Earth, and Moon line up precisely, the Moon slips entirely into the darkest part of the shadow to create a total lunar eclipse. During this deeper alignment, Earth's atmosphere filters and bends sunlight into the darkness,
          casting the Moon in shades of deep red, copper, or orange. This colorful effect is why a total eclipse is famously known as a blood moon.
        </p>
      </>
    ),
  },
  {
    id: 'eclipse-alignment',
    marker: '06  solar eclipse',
    content: (
      <>
        <h3>When sunlight is blocked by the Moon</h3>
        <p>A solar eclipse occurs when the Moon passes directly between Earth and the Sun. This alignment is possible because of a coincidence: the Moon is about 400 times smaller than the Sun but also about 400 times closer to us.</p>
        <p>This geometry makes the Sun and Moon appear almost the same size in our sky. During an eclipse, the Moon's shadow reaches Earth along a narrow track, causing the sky to darken briefly as the Moon covers the Sun.</p>
      </>
    ),
  },
];

function Ch3Visual({ activeStepId }: { activeStepId: string | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<EarthMoonSceneHandle>(null);
  const [webglAvailable, setWebglAvailable] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    import('@/three/earthMoonScene')
      .then(({ createEarthMoonScene }) => {
        if (disposed || !canvasRef.current) return;
        const handle = createEarthMoonScene(canvasRef.current);
        if (handle === null) {
          setWebglAvailable(false);
          return;
        }
        sceneRef.current = handle;
        setSceneReady(true);
      })
      .catch(() => {
        if (!disposed) setWebglAvailable(false);
      });
    return () => {
      disposed = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Runs once on scene-ready to apply the initial step's state, and
  // again whenever the active step changes.
  useEffect(() => {
    if (!sceneReady || !sceneRef.current || !activeStepId) return;
    const state = STEP_STATES[activeStepId];
    if (!state) return;
    sceneRef.current.setWithMoon(state.withMoon);
    sceneRef.current.setShowEclipse(state.showEclipse);
    sceneRef.current.setShowFullMoon(state.showFullMoon);
    sceneRef.current.setShowLunarEclipse(state.showLunarEclipse);
  }, [sceneReady, activeStepId]);

  if (!webglAvailable) {
    return <img className={styles.fallbackDiagram} src="/ch3/with-moon.svg" alt="Schematic showing the Sun, Earth, and Moon in alignment" />;
  }

  return (
    <div className={styles.visualSlot}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <p className={styles.scaleNote}>not to scale</p>
    </div>
  );
}

export default function Ch3() {
  const reducedMotion = useReducedMotion();
  const [activeStepId, setActiveStepId] = useState<string>(STEPS[0].id);

  const handleActiveStepChange = useCallback((id: string) => {
    setActiveStepId(id);
  }, []);

  if (reducedMotion) {
    return (
      <>
        <div className={styles.intro}>
          <IntroProse />
        </div>
        <img className={styles.fallbackDiagram} src="/ch3/with-moon.svg" alt="Schematic showing the Sun, Earth, and Moon in alignment" />
        <ol className={styles.fallbackList}>
          <li>The Moon&apos;s gravity stretches Earth&apos;s oceans into two tidal bulges, producing two high and two low tides daily.</li>
          <li>Earth&apos;s axis is tilted about 23.5 degrees relative to its orbit around the Sun. The Moon&apos;s gravity helps hold the axis close to that angle.</li>
          <li>Without a large moon, modeling suggests Earth&apos;s tilt could wander more widely under the gravity of other planets, possibly by tens of degrees over hundreds of millions of years.</li>
          <li>Once each orbit, the Moon sits opposite the Sun with Earth between them. Most months its orbit is tilted a few degrees off Earth&apos;s, so sunlight still reaches the Moon and we see a full moon.</li>
          <li>
            Two or three times a year the alignment is precise enough that the Moon passes through Earth&apos;s shadow. Earth&apos;s atmosphere bends red light into that shadow, painting the Moon a dim red-orange. This is a total lunar eclipse.
          </li>
          <li>A solar eclipse happens when the Moon passes directly between Earth and the Sun, casting a shadow on Earth along a narrow track.</li>
          <li>The Moon is drifting away from Earth at about 3.8 centimeters per year, gradually slowing Earth&apos;s rotation.</li>
        </ol>
      </>
    );
  }

  return (
    <>
      <div className={styles.intro}>
        <IntroProse />
      </div>
      <ScrollyChapter variant="immersive" ariaLabel="The Earth-Moon system" initialStepId={STEPS[0].id} onActiveStepChange={handleActiveStepChange} visual={<Ch3Visual activeStepId={activeStepId} />} steps={STEPS} />
    </>
  );
}

function IntroProse() {
  return (
    <>
      <p>We can go a whole day without looking up at the Moon and never feel its absence. But the Moon is always watching. Its gravity stretches down to Earth, tugging our oceans in a twice-daily pulse.</p>
      <p>
        It anchors our planet's tilt, ensuring the seasons remain predictable rather than chaotic. Occasionally, when the alignment is perfect, it even steps between us and the Sun to transform day into twilight. It has been our silent, steadying
        partner for four and a half billion years.
      </p>
    </>
  );
}
