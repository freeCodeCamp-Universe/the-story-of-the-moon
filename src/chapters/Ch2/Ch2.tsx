import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { CreditCaption } from '@/components/CreditCaption/CreditCaption';
import { ImageCompareSlider } from '@/components/ImageCompareSlider/ImageCompareSlider';
import { OptimizedImage } from '@/components/OptimizedImage/OptimizedImage';
import { ScrollyChapter } from '@/components/ScrollyChapter/ScrollyChapter';
import { getAsset, surfaceFeatures } from '@/content';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useViewportActivity } from '@/hooks/useViewportActivity';
import type { SurfaceFeature } from '@/types/content';
import type { MoonSceneHandle } from '@/three/moonScene';
import { shouldIgnoreTextEntryShortcutTarget } from '@/utils/keyboardShortcuts';
import styles from './Ch2.module.css';

const surfaceFeaturesHeadingId = 'ch2-surface-features-heading';
const basinCompareHintId = 'ch2-basin-compare-hint';
const basinCompareLiveId = 'ch2-basin-compare-live';
const compareImageSizes = '(min-width: 768px) 50vw, 100vw';
const hertzsprungAvifSrcSet = ['/ch2/hertzsprung-800.avif 800w', '/ch2/hertzsprung-1600.avif 1600w'].join(', ');
const hertzsprungTopographicAvifSrcSet = ['/ch2/hertzsprung-topographic-800.avif 800w', '/ch2/hertzsprung-topographic-1600.avif 1600w'].join(', ');
const orientaleAvifSrcSet = ['/ch2/orientale-lro-800.avif 800w', '/ch2/orientale-lro-1600.avif 1600w'].join(', ');
const orientaleTopographicAvifSrcSet = ['/ch2/orientale-topographic-800.avif 800w', '/ch2/orientale-topographic-1600.avif 1600w'].join(', ');

function formatLatLon(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(1)}°${latDir} ${Math.abs(lon).toFixed(1)}°${lonDir}`;
}

function getFeatureLabelText(feature: Pick<SurfaceFeature, 'name' | 'lat' | 'lon'>) {
  return {
    name: feature.name,
    coords: formatLatLon(feature.lat, feature.lon),
  };
}

function Ch2Visual({ activeFeature }: { activeFeature: SurfaceFeature }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<MoonSceneHandle>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const annotationRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const showAnnotationRef = useRef(false);
  const hideTimer = useRef<number | null>(null);
  const rotationAnnouncementTimerRef = useRef<number | null>(null);
  const idleTimerRef = useRef<number | null>(null);
  const rotationAnnouncementToggleRef = useRef(false);
  const isInteractingRef = useRef(false);
  const [webglAvailable, setWebglAvailable] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);
  const [shouldLoadScene, setShouldLoadScene] = useState(false);
  const [labelText, setLabelText] = useState<{
    name: string;
    coords: string;
  } | null>(null);
  const [rotationAnnouncement, setRotationAnnouncement] = useState('');
  const { targetRef, isNearViewport, isVisible } = useViewportActivity<HTMLDivElement>({
    rootMargin: '320px 0px',
  });

  // Active feature needs to be reachable from the RAF loop without
  // re-triggering the loop effect on every change.
  const activeFeatureRef = useRef(activeFeature);
  activeFeatureRef.current = activeFeature;

  const setAnnotationVisibility = useCallback((visible: boolean) => {
    showAnnotationRef.current = visible;
    if (annotationRef.current) {
      annotationRef.current.classList.toggle(styles.annotationVisible, visible);
    }
  }, []);

  const clearRotationAnnouncement = useCallback(() => {
    if (rotationAnnouncementTimerRef.current) {
      clearTimeout(rotationAnnouncementTimerRef.current);
      rotationAnnouncementTimerRef.current = null;
    }
    setRotationAnnouncement('');
  }, []);

  const scheduleRotationAnnouncement = useCallback(() => {
    if (rotationAnnouncementTimerRef.current) {
      clearTimeout(rotationAnnouncementTimerRef.current);
    }
    rotationAnnouncementTimerRef.current = window.setTimeout(() => {
      rotationAnnouncementTimerRef.current = null;
      const cameraLatLon = sceneRef.current?.getCameraLatLon();
      if (!cameraLatLon) {
        return;
      }
      rotationAnnouncementToggleRef.current = !rotationAnnouncementToggleRef.current;
      const suffix = rotationAnnouncementToggleRef.current ? '\u200B' : '';
      setRotationAnnouncement(`Viewing ${formatLatLon(cameraLatLon.lat, cameraLatLon.lon)}${suffix}`);
    }, 600);
  }, []);

  const scheduleRecover = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(() => {
      isInteractingRef.current = false;
      const feature = activeFeatureRef.current;
      clearRotationAnnouncement();
      setLabelText(null);
      sceneRef.current?.setCameraTarget({
        lat: feature.lat,
        lon: feature.lon,
      });
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => {
        setLabelText(getFeatureLabelText(feature));
        setAnnotationVisibility(true);
      }, 950);
    }, 1200);
  }, [clearRotationAnnouncement, setAnnotationVisibility]);

  useEffect(() => {
    if (!sceneReady || isInteractingRef.current) {
      return;
    }

    const nextLabel = getFeatureLabelText(activeFeatureRef.current);

    setLabelText((current) => (current && current.name === nextLabel.name && current.coords === nextLabel.coords ? current : nextLabel));
  }, [sceneReady, activeFeature.id, activeFeature.lat, activeFeature.lon]);

  useEffect(() => {
    if (isNearViewport) {
      setShouldLoadScene(true);
    }
  }, [isNearViewport]);

  useEffect(() => {
    if (!shouldLoadScene) {
      return;
    }

    let disposed = false;
    import('@/three/moonScene')
      .then(({ createMoonScene }) => {
        if (disposed || !canvasRef.current) return;
        const handle = createMoonScene(canvasRef.current, {
          autoRotate: false,
          // Controls are enabled so the reader can free-rotate the Moon
          // by dragging. Scroll-step re-targeting is handled below.
          enableOrbitControls: true,
          initialTarget: {
            lat: activeFeatureRef.current.lat,
            lon: activeFeatureRef.current.lon,
          },
        });
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
      clearRotationAnnouncement();
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [clearRotationAnnouncement, isVisible, shouldLoadScene]);

  useEffect(() => {
    if (!sceneReady || !sceneRef.current) {
      return;
    }

    if (isVisible) {
      sceneRef.current.resume();
      return;
    }

    sceneRef.current.pause();
  }, [isVisible, sceneReady]);

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

    const onPointerDown = () => {
      isInteractingRef.current = true;
      setAnnotationVisibility(false);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (rotationAnnouncementTimerRef.current) {
        clearTimeout(rotationAnnouncementTimerRef.current);
        rotationAnnouncementTimerRef.current = null;
      }
    };

    const onPointerRelease = () => {
      if (!isInteractingRef.current) return;
      isInteractingRef.current = false;
      scheduleRotationAnnouncement();
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
      if (rotationAnnouncementTimerRef.current) {
        clearTimeout(rotationAnnouncementTimerRef.current);
        rotationAnnouncementTimerRef.current = null;
      }
    };
  }, [scheduleRecover, scheduleRotationAnnouncement, setAnnotationVisibility]);

  // Keyboard rotation: arrow keys spin the Moon while the visual
  // region has focus. Same idle-recover behavior as drag — once the
  // reader stops rotating, the camera eases back to the active step.
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
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
      scheduleRotationAnnouncement();

      // Treat key activity the same as a drag: hide the label, then
      // recover after the reader stops pressing keys.
      isInteractingRef.current = true;
      showAnnotationRef.current = false;
      annotationRef.current?.classList.remove(styles.annotationVisible);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      scheduleRecover();
    },
    [scheduleRecover, scheduleRotationAnnouncement]
  );

  // Drive camera + stage annotation visibility when the active feature
  // changes. Also runs once when the scene finishes loading, so the
  // initial step's label appears on first paint without requiring the
  // reader to scroll away and back. Skip if the reader is currently
  // dragging — the idle timer in the interaction effect will re-center
  // when they let go.
  useEffect(() => {
    if (!sceneReady || !sceneRef.current) return;
    if (isInteractingRef.current) return;

    sceneRef.current.setCameraTarget({
      lat: activeFeature.lat,
      lon: activeFeature.lon,
    });

    // Snap to hidden instantly (annotationInstant disables the opacity
    // transition): the label's text and projected position swap to the
    // new feature this frame, so a 300ms fade-out would briefly show the
    // new label at the wrong spot while the camera is still tweening.
    // The transition is re-enabled for the fade-in once the tween lands.
    showAnnotationRef.current = false;
    if (annotationRef.current) {
      annotationRef.current.classList.add(styles.annotationInstant);
      annotationRef.current.classList.remove(styles.annotationVisible);
    }
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      showAnnotationRef.current = true;
      if (annotationRef.current) {
        annotationRef.current.classList.remove(styles.annotationInstant);
        annotationRef.current.classList.add(styles.annotationVisible);
      }
    }, 950);

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [sceneReady, activeFeature.id, activeFeature.lat, activeFeature.lon]);

  useEffect(() => {
    return () => {
      if (rotationAnnouncementTimerRef.current) {
        clearTimeout(rotationAnnouncementTimerRef.current);
        rotationAnnouncementTimerRef.current = null;
      }
    };
  }, []);

  // RAF loop: keep the ring and label locked to the feature's projected
  // screen position each frame. Manipulating DOM directly avoids React
  // re-renders during the animation.
  useEffect(() => {
    if (!sceneReady || !isVisible) {
      return;
    }

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
  }, [isVisible, sceneReady]);

  if (!webglAvailable) {
    return (
      <div ref={targetRef} className={styles.visualSlot}>
        <OptimizedImage className={styles.fallbackStatic} src="/moon/moon-2k.jpg" alt="" />
      </div>
    );
  }

  return (
    <div ref={targetRef} className={styles.visualSlot} tabIndex={0} role="group" aria-label="Interactive view of the Moon; use arrow keys to rotate, and after you stop the view re-centers on the active feature." onKeyDown={onKeyDown}>
      <p className={styles.hint} aria-hidden="true">
        <span className={styles.sceneHintMobile}>Drag to rotate</span>
        <span className={styles.sceneHintDesktop}>
          Drag, or press <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> to rotate
        </span>
      </p>
      <div className={styles.sceneStage}>
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        <div ref={annotationRef} className={styles.annotation} aria-live="polite" aria-atomic="true">
          <div ref={labelRef} className={styles.label}>
            {labelText ? (
              <>
                {labelText.name}
                <span className="sr-only">{`, ${labelText.coords}`}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {rotationAnnouncement}
      </p>
    </div>
  );
}

function VisualBelow() {
  const moonCredit = getAsset('moon-texture-2k');
  return moonCredit ? <CreditCaption credit={moonCredit} /> : null;
}

type Ch2Props = {
  shortcutsEnabled?: boolean;
};

export default function Ch2({ shortcutsEnabled = true }: Ch2Props) {
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
          <IntroProse shortcutsEnabled={shortcutsEnabled} />
        </div>
        <section aria-labelledby={surfaceFeaturesHeadingId}>
          <h3 id={surfaceFeaturesHeadingId} className={styles.surfaceFeaturesTitle}>
            Surface features of the Moon
          </h3>
          <ol className={styles.fallbackList} aria-label="Notable surface features">
            {surfaceFeatures.map((feature) => (
              <li key={feature.id} className={styles.fallbackItem}>
                <OptimizedImage className={styles.fallbackImage} src="/moon/moon-2k.jpg" alt={`The Moon's near side; ${feature.name} is located at ${formatLatLon(feature.lat, feature.lon)}.`} loading="lazy" />
                <p className={styles.fallbackMarker}>
                  <span aria-hidden="true">&gt;</span> {formatLatLon(feature.lat, feature.lon)}
                </p>
                <h4 className={styles.fallbackName}>{feature.name}</h4>
                {feature.description.map((paragraph, index) => (
                  <p key={`${feature.id}-fallback-${index}`} className={styles.fallbackDescription}>
                    {paragraph}
                  </p>
                ))}
              </li>
            ))}
          </ol>
        </section>
      </>
    );
  }

  return (
    <>
      <div className={styles.intro}>
        <IntroProse shortcutsEnabled={shortcutsEnabled} />
      </div>
      <h3 id={surfaceFeaturesHeadingId} className={styles.surfaceFeaturesTitle}>
        Surface features of the Moon
      </h3>
      <ScrollyChapter
        ariaLabelledBy={surfaceFeaturesHeadingId}
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
              <h4>{feature.name}</h4>
              {feature.description.map((paragraph, index) => (
                <p key={`${feature.id}-${index}`}>{paragraph}</p>
              ))}
            </>
          ),
        }))}
      />
    </>
  );
}

function IntroProse({ shortcutsEnabled }: Required<Ch2Props>) {
  const aristarchusAsset = getAsset('ch2-aristarchus-crater');
  const orientaleAsset = getAsset('ch2-mare-orientale');
  const orientaleTopographicAsset = getAsset('ch2-mare-orientale-topographic');
  const hertzsprungAsset = getAsset('ch2-hertzsprung-basin');
  const hertzsprungTopographicAsset = getAsset('ch2-hertzsprung-basin-topographic');
  const [hertzsprungCompareValue, setHertzsprungCompareValue] = useState(50);
  const [orientaleCompareValue, setOrientaleCompareValue] = useState(50);

  const formatCompareStatus = (value: number) => (value === 100 ? 'Full original view' : value === 0 ? 'Full topographic view' : `${value}% original, ${100 - value}% topographic`);

  const basinCompareStatus = `Hertzsprung: ${formatCompareStatus(hertzsprungCompareValue)}. Mare Orientale: ${formatCompareStatus(orientaleCompareValue)}.`;

  const basinCompareRef = useRef<HTMLDivElement | null>(null);
  const hoveredFigureRef = useRef<string | null>(null);

  const applyBasinCompareShortcut = useCallback((nextValue: number, scope: string | null) => {
    if (scope === 'hertzsprung') {
      setHertzsprungCompareValue(nextValue);
      return;
    }

    if (scope === 'orientale') {
      setOrientaleCompareValue(nextValue);
      return;
    }

    setHertzsprungCompareValue(nextValue);
    setOrientaleCompareValue(nextValue);
  }, []);

  const handleBasinCompareKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    const key = event.key.toLowerCase();
    const nextValue = key === 'o' ? 100 : key === 't' ? 0 : null;

    if (nextValue === null) {
      return;
    }

    event.preventDefault();

    let scope: string | null = null;

    if (event.target instanceof HTMLElement && event.target !== event.currentTarget) {
      scope = event.target.closest<HTMLElement>('[data-basin-compare]')?.dataset.basinCompare ?? null;
    }

    applyBasinCompareShortcut(nextValue, scope);
  };

  const handleBasinComparePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!(event.target instanceof HTMLElement)) {
      hoveredFigureRef.current = null;
      return;
    }

    hoveredFigureRef.current = event.target.closest<HTMLElement>('[data-basin-compare]')?.dataset.basinCompare ?? null;
  };

  const handleBasinComparePointerLeave = () => {
    hoveredFigureRef.current = null;
  };

  useEffect(() => {
    if (!shortcutsEnabled) {
      return;
    }

    const handleWindowKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      if (shouldIgnoreTextEntryShortcutTarget(event.target)) {
        return;
      }

      const key = event.key.toLowerCase();
      const nextValue = key === 'o' ? 100 : key === 't' ? 0 : null;

      if (nextValue === null) {
        return;
      }

      const basinCompare = basinCompareRef.current;

      if (!basinCompare) {
        return;
      }

      const activeElement = document.activeElement;
      const focusInside = activeElement instanceof Node && basinCompare.contains(activeElement);

      if (focusInside) {
        return;
      }

      if (hoveredFigureRef.current === null) {
        return;
      }

      event.preventDefault();
      applyBasinCompareShortcut(nextValue, hoveredFigureRef.current);
    };

    window.addEventListener('keydown', handleWindowKeyDown);

    return () => {
      window.removeEventListener('keydown', handleWindowKeyDown);
    };
  }, [applyBasinCompareShortcut, shortcutsEnabled]);

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
        <p>
          A crater is a bowl-shaped depression on the surface of a planet or moon, typically formed by the high-speed impact of a meteorite, asteroid, or comet. These structures are characterized by a circular pit, a sunken floor, and a raised outer
          rim created by the displacement of rock during the collision. In smaller craters, the interior is usually a simple, smooth curve, while slightly larger ones may feature a central peak where the ground rebounded after the hit.
        </p>
        <figure className={styles.termFigure}>
          <OptimizedImage className={styles.termImage} src="/ch2/aristarchus.jpg" alt={aristarchusAsset?.alt ?? ''} loading="lazy" />
          {aristarchusAsset && <CreditCaption credit={aristarchusAsset} />}
        </figure>
      </section>

      <section className={styles.term} aria-labelledby="ch2-basin-heading">
        <h3 id="ch2-basin-heading" className={styles.termHeading}>
          Basin
        </h3>
        <p>
          A basin is a massive impact structure that represents the largest and most complex class of craters, generally defined by a diameter exceeding 300 kilometers. Unlike standard craters, the immense energy required to form a basin causes the
          crust to behave like a fluid, resulting in a flat interior floor and multiple concentric rings that resemble a bullseye.
        </p>
        <p>
          Over time, these giant depressions are often filled with lava rising from below, forming dark, smooth volcanic plains called maria (singular: mare). The maria are the dark areas we can see on the Moon without a telescope. They cover about a
          sixth of the lunar surface, almost all of it on the near side that faces Earth.
        </p>
        <div
          ref={basinCompareRef}
          className={styles.termDiptych}
          role="group"
          tabIndex={0}
          aria-label="Basin image comparisons"
          aria-describedby={`${basinCompareHintId} ${basinCompareLiveId}`}
          aria-keyshortcuts="O T"
          onKeyDownCapture={handleBasinCompareKeyDown}
          onPointerMove={handleBasinComparePointerMove}
          onPointerLeave={handleBasinComparePointerLeave}
        >
          <p id={basinCompareHintId} className={`${styles.hint} ${styles.basinCompareHint}`}>
            Drag, or press <kbd>←</kbd> <kbd>→</kbd> to slide.
            <br />
            Press <kbd>O</kbd> for original or <kbd>T</kbd> for topographic.
          </p>
          <p id={basinCompareLiveId} className="sr-only" aria-live="polite">
            {basinCompareStatus}
          </p>
          {hertzsprungAsset && hertzsprungTopographicAsset && (
            <figure className={styles.termDiptychFigure} data-basin-compare="hertzsprung">
              <ImageCompareSlider
                label="Compare Hertzsprung basin original and topographic views"
                originalSrc="/ch2/hertzsprung.jpg"
                originalAvifSrcSet={hertzsprungAvifSrcSet}
                originalAlt={hertzsprungAsset.alt}
                originalLabel="Original"
                topographicSrc="/ch2/hertzsprung-topographic.jpg"
                topographicAvifSrcSet={hertzsprungTopographicAvifSrcSet}
                topographicLabel="Topographic"
                describedBy={basinCompareHintId}
                sizes={compareImageSizes}
                value={hertzsprungCompareValue}
                onValueChange={setHertzsprungCompareValue}
              />
              <figcaption className={styles.termDiptychCaption}>
                <CreditCaption credit={hertzsprungAsset} />
                <CreditCaption credit={hertzsprungTopographicAsset} />
              </figcaption>
            </figure>
          )}
          {orientaleAsset && orientaleTopographicAsset && (
            <figure className={styles.termDiptychFigure} data-basin-compare="orientale">
              <ImageCompareSlider
                label="Compare Mare Orientale original and topographic views"
                originalSrc="/ch2/orientale-lro.png"
                originalAvifSrcSet={orientaleAvifSrcSet}
                originalAlt={orientaleAsset.alt}
                originalLabel="Original"
                topographicSrc="/ch2/orientale-topographic.jpg"
                topographicAvifSrcSet={orientaleTopographicAvifSrcSet}
                topographicLabel="Topographic"
                describedBy={basinCompareHintId}
                sizes={compareImageSizes}
                value={orientaleCompareValue}
                onValueChange={setOrientaleCompareValue}
              />
              <figcaption className={styles.termDiptychCaption}>
                <CreditCaption credit={orientaleAsset} />
                <CreditCaption credit={orientaleTopographicAsset} />
              </figcaption>
            </figure>
          )}
        </div>
      </section>
    </>
  );
}
