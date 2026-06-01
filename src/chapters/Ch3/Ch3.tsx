import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollyChapter, type ScrollyStep } from '@/components/ScrollyChapter/ScrollyChapter';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useViewportActivity } from '@/hooks/useViewportActivity';
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
          The Moon's gravity pulls on the entire Earth, but it doesn't pull every part with the same strength. The ocean on the side facing the Moon is closest, so it gets the strongest tug and rushes forward, creating a deep pile of water. This
          creates the first high tide.
        </p>
        <p>
          A second high tide happens on the exact opposite side of the Earth because gravity weakens with distance. The Moon pulls the solid Earth forward more forcefully than it pulls the far-away ocean, yanking the planet out from under that water
          and leaving it trailing behind in a second pile.
        </p>
        <p>
          Because water is gathered into these two piles, the spaces in between them are left shallow. As Earth rotates, the coastlines pass through the piles and the shallow stretches. In a single day, each coast moves through one pile (high tide),
          then a shallow stretch (low tide), then the second pile (high tide), and finally the last shallow stretch (low tide).
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
        <p>Earth spins at a tilt, leaning about 23.5 degrees away from an upright position relative to its orbit around the Sun. That lean is what gives us seasons, since across the year each hemisphere tips toward the Sun and then away from it.</p>
        <p>The Moon's gravity helps hold that angle steady. Today the tilt drifts only about a degree either way over tens of thousands of years, and the Moon's pull is a large part of why it stays in such a narrow band.</p>
      </>
    ),
  },
  {
    id: 'without-moon',
    marker: '03  without the moon',
    content: (
      <>
        <h3>A moonless Earth would wander</h3>
        <p>
          The Moon acts as a gravitational anchor on Earth's tilt, holding its drift to about 1.3 degrees. Early models suggested that without the Moon the tilt could swing chaotically, by as much as 85 degrees, wrecking the climate, and for decades
          the Moon was treated as a precondition for a livable world.
        </p>
        <p>
          Newer simulations have since soften that picture. A moonless Earth's tilt would more likely wander within a band of about 20 degrees over hundreds of millions of years, enough to make the climate more variable but not enough to make it
          uninhabitable.
        </p>
        <p>The Moon gives Earth an unusually steady tilt, but whether a planet actually requires a massive moon to remain habitable is an unsettled debate that astrobiologists cannot yet definitively answer.</p>
      </>
    ),
  },
  {
    id: 'full-moon-alignment',
    marker: '04  full moon',
    content: (
      <>
        <h3>When sunlight is reflected straight back to Earth</h3>
        <p>
          Every 29.5 days, the Moon moves directly opposite the Sun with Earth positioned in the middle. While this alignment seems like it would block the sunlight, the Moon&apos;s orbit is tilted by about five degrees compared to Earth&apos;s. This
          tilt allows the Moon to pass above or below Earth&apos;s shadow, where sunlight fully illuminates the side facing Earth to create a full moon.
        </p>
      </>
    ),
  },
  {
    id: 'lunar-eclipse-alignment',
    marker: '05  lunar eclipse',
    content: (
      <>
        <h3>When sunlight is filtered through Earth's atmosphere</h3>
        <p>Two to five times a year, the Moon crosses into Earth's shadow instead of passing above or below it. This is a lunar eclipse. If the Moon enters only the outer shadow, its face dims so slightly that the change is easy to miss.</p>
        <p>
          When the Sun, Earth, and Moon line up perfectly, the Moon slides fully into the darkest inner shadow, the umbra. The only light reaching the lunar surface travels through Earth's atmosphere first. The atmosphere scatters away the blue light
          and bends the remaining red and orange wavelengths onto the Moon. This is the same effect that reddens a sunset, which is why a total lunar eclipse is nicknamed a blood moon.
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
        <p>A solar eclipse occurs when the Moon passes directly between Earth and the Sun. This alignment is possible because of a coincidence: the Moon is about 400 times smaller than the Sun but also about 400 times closer to Earth.</p>
        <p>This geometry makes the Sun and Moon appear almost the same size from Earth. During an eclipse, the Moon's shadow reaches Earth along a narrow track, causing the sky to darken briefly as the Moon covers the Sun.</p>
      </>
    ),
  },
];

function Ch3Visual({ activeStepId }: { activeStepId: string | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<EarthMoonSceneHandle>(null);
  const [webglAvailable, setWebglAvailable] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);
  const [shouldLoadScene, setShouldLoadScene] = useState(false);
  const { targetRef, isNearViewport, isVisible } = useViewportActivity<HTMLDivElement>({
    rootMargin: '320px 0px',
  });

  useEffect(() => {
    if (isNearViewport) {
      setShouldLoadScene(true);
    }
  }, [isNearViewport]);

  useEffect(() => {
    if (!shouldLoadScene) return;

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
        if (!isVisible) {
          handle.pause();
        }
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
  }, [isVisible, shouldLoadScene]);

  useEffect(() => {
    if (!sceneReady || !sceneRef.current) return;

    if (isVisible) {
      sceneRef.current.resume();
      return;
    }

    sceneRef.current.pause();
  }, [isVisible, sceneReady]);

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
    return (
      <div ref={targetRef} className={styles.visualSlot}>
        <img className={styles.fallbackDiagram} src="/ch3/with-moon.svg" alt="Schematic showing the Sun, Earth, and Moon in alignment" />
      </div>
    );
  }

  return (
    <div ref={targetRef} className={styles.visualSlot}>
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
      <p>
        Most moons are small compared to the planet they orbit, too small for their gravity to have much effect on it. Earth's moon is different. It's about a quarter of Earth's diameter, large enough that its gravity reaches across space and takes
        hold of the planet itself. The clearest proof is the sea. Twice a day the ocean rises and falls along the coasts, drawn up by the Moon from an average of 384,400 kilometers away.
      </p>
      <p>
        The Moon's gravity isn't its only reach. Once in a while it slips directly between Earth and the Sun, and its shadow sweeps across the surface, turning day to dusk for a few minutes. Brief as it is, that loss of sunlight is enough to change
        conditions on the ground, a reminder that the Moon can affect Earth by where it stands, not only by how hard it pulls.
      </p>
    </>
  );
}
