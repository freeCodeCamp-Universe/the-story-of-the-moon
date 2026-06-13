import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { magmaOcean } from '@/content';
import { useReducedMotion } from '@/hooks/useReducedMotion';

import { MagmaOceanCrossSection } from './MagmaOceanCrossSection';
import styles from './MagmaOceanSection.module.css';

const LAST = magmaOcean.length - 1;

export function MagmaOceanSection() {
  const reducedMotion = useReducedMotion();
  const titleId = useId();
  const descId = useId();
  const liveRef = useRef<HTMLDivElement | null>(null);
  const stepRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [step, setStep] = useState(0);

  // Announce the active step.
  useEffect(() => {
    if (reducedMotion || !liveRef.current) return;
    liveRef.current.textContent = `${magmaOcean[step].marker}. ${magmaOcean[step].caption}`;
  }, [step, reducedMotion]);

  const goTo = useCallback((index: number, moveFocus = false) => {
    const clamped = Math.min(LAST, Math.max(0, index));
    setStep(clamped);
    if (moveFocus) stepRefs.current[clamped]?.focus();
  }, []);

  const handleKey = useCallback(
    (event: React.KeyboardEvent<HTMLOListElement>) => {
      let next: number;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = step + 1;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = step - 1;
      else return;
      event.preventDefault();
      goTo(next, true);
    },
    [step, goTo]
  );

  const active = magmaOcean[step];

  return (
    <figure className={styles.figure}>
      <div className={styles.frame}>
        {reducedMotion ? (
          <div className={styles.layout}>
            <div className={styles.stage}>
              <MagmaOceanCrossSection step={magmaOcean.length - 1} animate={false} titleId={titleId} descId={descId} />
            </div>
            <ol className={styles.legend} aria-label="Crystallization steps">
              {magmaOcean.map((s) => (
                <li key={s.id} className={styles.legendItem}>
                  <span className={styles.marker}>
                    <span aria-hidden="true">&gt;</span> {s.marker}
                  </span>
                  <span className={styles.legendCaption}>{s.caption}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div className={styles.layout}>
            <div className={styles.stage}>
              <MagmaOceanCrossSection step={step} animate titleId={titleId} descId={descId} />
            </div>

            <div className={styles.controlsColumn}>
              <ol className={styles.steps} aria-label="Crystallization steps" onKeyDown={handleKey}>
                {magmaOcean.map((s, index) => {
                  const isActive = index === step;
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        ref={(el) => {
                          stepRefs.current[index] = el;
                        }}
                        className={styles.step}
                        data-active={isActive ? '' : undefined}
                        aria-current={isActive ? 'step' : undefined}
                        aria-label={s.marker}
                        aria-keyshortcuts="ArrowLeft ArrowRight"
                        tabIndex={isActive ? 0 : -1}
                        onClick={() => goTo(index)}
                      >
                        <span className={styles.pill} aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
              </ol>

              <div className={styles.readout}>
                <p className={styles.marker}>
                  <span aria-hidden="true">&gt;</span> {active.marker}
                </p>
                <p className={styles.caption}>{active.caption}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <figcaption className={styles.scaleNote}>Schematic, not to scale. Lunar magma ocean model after Elkins-Tanton et al. 2011.</figcaption>

      <div ref={liveRef} className="sr-only" aria-live="polite" aria-atomic="true" />
    </figure>
  );
}
