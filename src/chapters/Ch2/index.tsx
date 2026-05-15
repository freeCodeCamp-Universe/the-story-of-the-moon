import { useCallback, useEffect, useRef, useState } from 'react';
import CreditCaption from '@/components/CreditCaption';
import OptimizedImage from '@/components/OptimizedImage';
import ScrollyChapter from '@/components/ScrollyChapter';
import { getAsset, surfaceFeatures } from '@/content';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { SurfaceFeature } from '@/types/content';
import type { MoonSceneHandle } from '@/three/moonScene';
import styles from './Ch2.module.css';

function formatLatLon(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(1)}°${latDir} ${Math.abs(lon).toFixed(1)}°${lonDir}`;
}

function Ch2Visual({ activeFeature }: { activeFeature: SurfaceFeature }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<MoonSceneHandle>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const annotationRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const showAnnotationRef = useRef(false);
  const hideTimer = useRef<number | null>(null);
  const idleTimerRef = useRef<number | null>(null);
  const isInteractingRef = useRef(false);
  const [webglAvailable, setWebglAvailable] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);

  // Active feature needs to be reachable from the RAF loop without
  // re-triggering the loop effect on every change.
  const activeFeatureRef = useRef(activeFeature);
  activeFeatureRef.current = activeFeature;

  useEffect(() => {
    let disposed = false;
    import('@/three/moonScene')
      .then(({ createMoonScene }) => {
        if (disposed || !canvasRef.current) return;
        const handle = createMoonScene(canvasRef.current, {
          autoRotate: false,
          // Controls are enabled so the reader can free-rotate the Moon
          // by dragging. Scroll-step re-targeting is handled below.
          enableOrbitControls: true,
          initialTarget: { lat: activeFeatureRef.current.lat, lon: activeFeatureRef.current.lon },
          // The CGI Moon Kit texture already bakes in topographic
          // shading; render it without an additional sun-direction
          // light so features on every side stay legible as the
          // reader rotates the Moon.
          unlit: true,
        });
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

  // Free-rotate interaction.
  //
  // While the reader is dragging the Moon, the annotation label is
  // hidden (it would lie about where the feature is). When the reader
  // releases and stays idle for IDLE_MS, we re-center the camera on
  // the currently active step's feature and bring the label back.
  // Scroll-step changes during interaction are deferred so the camera
  // tween doesn't fight the user's drag.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const IDLE_MS = 1200;

    const setAnnotation = (visible: boolean) => {
      showAnnotationRef.current = visible;
      if (annotationRef.current) {
        annotationRef.current.classList.toggle(styles.annotationVisible, visible);
      }
    };

    const scheduleRecover = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = window.setTimeout(() => {
        const feature = activeFeatureRef.current;
        sceneRef.current?.setCameraTarget({ lat: feature.lat, lon: feature.lon });
        // Annotation reappears once the camera tween has landed.
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = window.setTimeout(() => setAnnotation(true), 950);
      }, IDLE_MS);
    };

    const onPointerDown = () => {
      isInteractingRef.current = true;
      setAnnotation(false);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };

    const onPointerRelease = () => {
      if (!isInteractingRef.current) return;
      isInteractingRef.current = false;
      scheduleRecover();
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerRelease);
    canvas.addEventListener('pointercancel', onPointerRelease);
    canvas.addEventListener('pointerleave', onPointerRelease);

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerRelease);
      canvas.removeEventListener('pointercancel', onPointerRelease);
      canvas.removeEventListener('pointerleave', onPointerRelease);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  // Keyboard rotation: arrow keys spin the Moon while the visual
  // region has focus. Same idle-recover behavior as drag — once the
  // reader stops rotating, the camera eases back to the active step.
  const onKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
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
    sceneRef.current?.rotateBy({ deltaAzimuth, deltaPolar });

    // Treat key activity the same as a drag: hide the label, then
    // recover after the reader stops pressing keys.
    isInteractingRef.current = true;
    showAnnotationRef.current = false;
    annotationRef.current?.classList.remove(styles.annotationVisible);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(() => {
      isInteractingRef.current = false;
      const feature = activeFeatureRef.current;
      sceneRef.current?.setCameraTarget({ lat: feature.lat, lon: feature.lon });
      hideTimer.current = window.setTimeout(() => {
        showAnnotationRef.current = true;
        annotationRef.current?.classList.add(styles.annotationVisible);
      }, 950);
    }, 1200);
  }, []);

  // Drive camera + stage annotation visibility when the active feature
  // changes. Also runs once when the scene finishes loading, so the
  // initial step's label appears on first paint without requiring the
  // reader to scroll away and back. Skip if the reader is currently
  // dragging — the idle timer in the interaction effect will re-center
  // when they let go.
  useEffect(() => {
    if (!sceneReady || !sceneRef.current) return;
    if (isInteractingRef.current) return;

    sceneRef.current.setCameraTarget({ lat: activeFeature.lat, lon: activeFeature.lon });

    // Hide label during the 900ms camera tween; reveal once it lands.
    showAnnotationRef.current = false;
    if (annotationRef.current) {
      annotationRef.current.classList.remove(styles.annotationVisible);
    }
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      showAnnotationRef.current = true;
      if (annotationRef.current) {
        annotationRef.current.classList.add(styles.annotationVisible);
      }
    }, 950);

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [sceneReady, activeFeature.id, activeFeature.lat, activeFeature.lon]);

  // RAF loop: keep the ring and label locked to the feature's projected
  // screen position each frame. Manipulating DOM directly avoids React
  // re-renders during the animation.
  useEffect(() => {
    const tick = () => {
      const handle = sceneRef.current;
      const label = labelRef.current;
      const feature = activeFeatureRef.current;

      if (handle && label && canvasRef.current) {
        const proj = handle.projectFeature(feature.lat, feature.lon, feature.diameterKm);
        if (proj) {
          // Label normally sits to the right of the feature point.
          // On narrow canvases (or for features near the right edge)
          // the text would clip against the visualSlot's overflow,
          // so flip it to the left side when proj.x is past 60%.
          const canvasWidth = canvasRef.current.clientWidth;
          const flipLeft = proj.x > canvasWidth * 0.6;
          label.style.left = `${proj.x}px`;
          label.style.top = `${proj.y}px`;
          label.classList.toggle(styles.labelFlipped, flipLeft);

          // Hide whenever the feature is on the far side of the
          // sphere (e.g., South Pole–Aitken basin).
          const shouldShow = showAnnotationRef.current && proj.visible;
          if (annotationRef.current) {
            annotationRef.current.classList.toggle(styles.annotationVisible, shouldShow);
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!webglAvailable) {
    return <OptimizedImage className={styles.fallbackStatic} src="/moon/moon-2k.jpg" alt="" />;
  }

  return (
    <div className={styles.visualSlot} tabIndex={0} role="group" aria-label="Interactive view of the Moon. Use arrow keys to rotate." onKeyDown={onKeyDown}>
      <p className={styles.hint} aria-hidden="true">
        Drag, or press <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> to rotate
      </p>
      <div className={styles.sceneStage}>
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        <div ref={annotationRef} className={styles.annotation} aria-hidden="true">
          <div ref={labelRef} className={styles.label}>
            {activeFeature.name}
          </div>
        </div>
      </div>
    </div>
  );
}

function VisualBelow() {
  const moonCredit = getAsset('moon-texture-2k');
  return moonCredit ? <CreditCaption credit={moonCredit} /> : null;
}

export default function Ch2() {
  const reducedMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<string>(surfaceFeatures[0].id);

  const handleActiveStepChange = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const activeFeature = surfaceFeatures.find((f) => f.id === activeId) ?? surfaceFeatures[0];

  if (reducedMotion) {
    return (
      <>
        <div className={styles.intro}>
          <IntroProse />
        </div>
        <ol className={styles.fallbackList} aria-label="Notable surface features">
          {surfaceFeatures.map((feature) => (
            <li key={feature.id} className={styles.fallbackItem}>
              <OptimizedImage
                className={styles.fallbackImage}
                src="/moon/moon-2k.jpg"
                alt={`The Moon's near side; ${feature.name} is located at ${formatLatLon(feature.lat, feature.lon)}.`}
                loading="lazy"
              />
              <p className={styles.fallbackMarker}>
                <span aria-hidden="true">&gt;</span> {formatLatLon(feature.lat, feature.lon)}
              </p>
              <h3 className={styles.fallbackName}>{feature.name}</h3>
              <p className={styles.fallbackOneLiner}>{feature.oneLiner}</p>
            </li>
          ))}
        </ol>
      </>
    );
  }

  return (
    <>
      <div className={styles.intro}>
        <IntroProse />
      </div>
      <ScrollyChapter
        ariaLabel="Surface features of the Moon"
        initialStepId={surfaceFeatures[0].id}
        onActiveStepChange={handleActiveStepChange}
        visualAriaHidden={false}
        visual={<Ch2Visual activeFeature={activeFeature} />}
        visualBelow={<VisualBelow />}
        steps={surfaceFeatures.map((feature) => ({
          id: feature.id,
          marker: formatLatLon(feature.lat, feature.lon),
          content: (
            <>
              <h3>{feature.name}</h3>
              <p>{feature.oneLiner}</p>
            </>
          ),
        }))}
      />
    </>
  );
}

function IntroProse() {
  const aristarchusAsset = getAsset('ch2-aristarchus-crater');
  const orientaleAsset = getAsset('ch2-mare-orientale');

  return (
    <>
      <p>
        For four billion years, space objects have been hitting the Moon. Asteroids, comets, and pieces of other worlds all leave a mark when they strike. The Moon has no rain, no wind, no oceans to wash those marks away. Earth was struck just as
        often, but it buried its own wounds under oceans and shifting continents. The Moon we see today is the record of every collision the inner solar system could throw at it.
      </p>

      <section className={styles.term} aria-labelledby="ch2-crater-heading">
        <h3 id="ch2-crater-heading" className={styles.termHeading}>
          Crater
        </h3>
        <figure className={styles.termFigure}>
          <OptimizedImage className={styles.termImage} src="/ch2/aristarchus.jpg" alt={aristarchusAsset?.alt ?? ''} loading="lazy" />
          {aristarchusAsset && <CreditCaption credit={aristarchusAsset} />}
        </figure>
        <p>
          A crater is a bowl-shaped depression on the surface of a planet or moon, typically formed by the high-speed impact of a meteorite, asteroid, or comet. These structures are characterized by a circular pit, a sunken floor, and a raised outer
          rim created by the displacement of rock during the collision. In smaller craters, the interior is usually a simple, smooth curve, while slightly larger ones may feature a central peak where the ground rebounded after the hit.
        </p>
      </section>

      <section className={styles.term} aria-labelledby="ch2-basin-heading">
        <h3 id="ch2-basin-heading" className={styles.termHeading}>
          Basin
        </h3>
        <figure className={styles.termFigure}>
          <OptimizedImage className={styles.termImage} src="/ch2/orientale.jpg" alt={orientaleAsset?.alt ?? ''} loading="lazy" />
          {orientaleAsset && <CreditCaption credit={orientaleAsset} />}
        </figure>
        <p>
          A basin is a massive impact structure that represents the largest and most complex class of craters, generally defined by a diameter exceeding 300 kilometers. Unlike standard craters, the immense energy required to form a basin causes the
          crust to behave like a fluid, resulting in a flat interior floor and multiple concentric rings that resemble a bullseye. Over time, these giant depressions are often filled with lava or sediment, significantly altering the geological
          landscape of the planetary body.
        </p>
      </section>

      <p>The Moon turns on its axis in the same time it takes to orbit Earth. Because these two movements are perfectly synced, the same side always points toward us, and we never see the "back" of the Moon from Earth.</p>
    </>
  );
}
