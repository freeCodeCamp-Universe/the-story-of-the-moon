import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { missions, getAsset } from '@/content';
import CreditCaption from '@/components/CreditCaption';
import OptimizedImage from '@/components/OptimizedImage';
import type { Mission } from '@/types/content';
import styles from './Ch4.module.css';

type Step = { kind: 'mission'; mission: Mission } | { kind: 'interlude' };

const INTERLUDE_BEFORE_KEY = 'artemis-2';
const INTERLUDE_TEXT = 'Fifty-three years pass.';

function buildSteps(list: Mission[]): Step[] {
  const out: Step[] = [];
  for (const m of list) {
    if (m.key === INTERLUDE_BEFORE_KEY) out.push({ kind: 'interlude' });
    out.push({ kind: 'mission', mission: m });
  }
  return out;
}

function formatMissionDateRange(mission: Mission) {
  const launch = new Date(mission.date);
  const splash = new Date(mission.splashdownDate);
  const enDash = '\u2013';

  if (Number.isNaN(launch.getTime()) || Number.isNaN(splash.getTime())) {
    return `${mission.date}${enDash}${mission.splashdownDate}`;
  }

  const sameYear = launch.getFullYear() === splash.getFullYear();
  const sameMonth = sameYear && launch.getMonth() === splash.getMonth();
  const launchFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
  const splashMonthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
  const splashDayFormatter = new Intl.DateTimeFormat('en-US', { day: 'numeric' });

  if (sameYear && sameMonth) {
    return `${launchFormatter.format(launch)}${enDash}${splashDayFormatter.format(splash)}, ${launch.getFullYear()}`;
  }

  if (sameYear) {
    return `${launchFormatter.format(launch)}${enDash}${splashMonthFormatter.format(splash)}, ${launch.getFullYear()}`;
  }

  return `${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(launch)}${enDash}${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(splash)}`;
}

function MissionPanel({ mission }: { mission: Mission }) {
  const credit = getAsset(mission.photo.creditId);
  return (
    <article className={styles.panel} aria-labelledby={`mission-${mission.key}`}>
      <header className={styles.panelHeader}>
        <span className={styles.panelLabel}>
          {mission.label} · {formatMissionDateRange(mission)}
        </span>
      </header>
      <div className={styles.panelBody}>
        <div className={styles.panelText}>
          <h3 id={`mission-${mission.key}`} className={styles.oneLiner}>
            {mission.oneLiner}
          </h3>
          <p className={styles.crew}>{mission.crew.join(' · ')}</p>
          {mission.prose.map((p, i) => (
            <p key={i} className={styles.prose}>
              {p}
            </p>
          ))}
        </div>
        <figure className={styles.panelPhoto}>
          <div className={styles.photoFrame}>
            <OptimizedImage src={mission.photo.src} alt={mission.photo.alt} loading="lazy" />
          </div>
          {credit && (
            <figcaption className={styles.photoCaption}>
              <CreditCaption credit={credit} />
            </figcaption>
          )}
        </figure>
      </div>
    </article>
  );
}

function InterludePanel() {
  return (
    <div className={styles.interlude}>
      <p className={styles.interludeText}>{INTERLUDE_TEXT}</p>
    </div>
  );
}

function StepContent({ step }: { step: Step }) {
  return step.kind === 'mission' ? <MissionPanel mission={step.mission} /> : <InterludePanel />;
}

function useTimelineMode() {
  const [mode, setMode] = useState<'static' | 'animated'>('static');

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const wide = window.matchMedia('(min-width: 900px)');

    const update = () => {
      setMode(!motion.matches && wide.matches ? 'animated' : 'static');
    };
    update();
    motion.addEventListener('change', update);
    wide.addEventListener('change', update);
    return () => {
      motion.removeEventListener('change', update);
      wide.removeEventListener('change', update);
    };
  }, []);

  return mode;
}

function StaticTimeline({ steps }: { steps: Step[] }) {
  return (
    <ol className={styles.staticList}>
      {steps.map((step, i) => (
        <li key={i} className={styles.staticItem}>
          <StepContent step={step} />
        </li>
      ))}
    </ol>
  );
}

function PinnedTimeline({ steps }: { steps: Step[] }) {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const sentinelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const liveRef = useRef<HTMLDivElement | null>(null);
  const pendingJumpRef = useRef<{ index: number; scrollTop: number } | null>(null);
  const pendingJumpTimeoutRef = useRef<number | null>(null);
  const keyboardHintId = useId();

  const missionCount = useMemo(() => steps.filter((s) => s.kind === 'mission').length, [steps]);

  const clearPendingJump = useCallback(() => {
    pendingJumpRef.current = null;
    if (pendingJumpTimeoutRef.current !== null) {
      window.clearTimeout(pendingJumpTimeoutRef.current);
      pendingJumpTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => clearPendingJump, [clearPendingJump]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const pendingJump = pendingJumpRef.current;
        if (pendingJump) {
          const targetVisible = entries.some((entry) => {
            if (!entry.isIntersecting) return false;
            const idx = Number((entry.target as HTMLDivElement).dataset.step);
            return idx === pendingJump.index;
          });

          if (targetVisible || Math.abs(window.scrollY - pendingJump.scrollTop) <= 2) {
            setActive(pendingJump.index);
            clearPendingJump();
            return;
          }

          return;
        }

        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLDivElement).dataset.step);
            if (!Number.isNaN(idx)) setActive(idx);
          }
        }
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    );
    sentinelRefs.current.forEach((el) => el && observer.observe(el));
    return () => {
      observer.disconnect();
      clearPendingJump();
    };
  }, [steps, clearPendingJump]);

  useEffect(() => {
    if (!liveRef.current) return;
    const step = steps[active];
    if (!step) return;
    if (step.kind === 'mission') {
      const num = steps.slice(0, active + 1).filter((s) => s.kind === 'mission').length;
      liveRef.current.textContent = `${step.mission.label}, ${formatMissionDateRange(step.mission)}. ${num} of ${missionCount}.`;
    } else {
      liveRef.current.textContent = `Interlude. ${INTERLUDE_TEXT}`;
    }
  }, [active, steps, missionCount]);

  const jumpTo = useCallback(
    (index: number) => {
      const target = sentinelRefs.current[index];
      const section = sectionRef.current;
      const stage = stageRef.current;
      if (!target || !section) return;

      const targetRect = target.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      const stageHeight = stage ? stage.getBoundingClientRect().height : window.innerHeight;
      const navHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 0;

      const desired = window.scrollY + targetRect.top + targetRect.height / 2 - window.innerHeight / 2;
      const minScroll = window.scrollY + sectionRect.top - navHeight;
      const maxScroll = window.scrollY + sectionRect.bottom - navHeight - stageHeight;
      const clamped = Math.max(minScroll, Math.min(maxScroll, desired));

      clearPendingJump();
      pendingJumpRef.current = { index, scrollTop: clamped };
      pendingJumpTimeoutRef.current = window.setTimeout(() => {
        pendingJumpRef.current = null;
        pendingJumpTimeoutRef.current = null;
      }, 1000);

      setActive(index);
      window.scrollTo({ top: clamped, behavior: 'smooth' });
    },
    [clearPendingJump]
  );

  const handleKey = useCallback(
    (e: Pick<KeyboardEvent, 'key' | 'preventDefault'>) => {
      let next = active;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = Math.min(steps.length - 1, active + 1);
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = Math.max(0, active - 1);
      else if (e.key === '[') next = 0;
      else if (e.key === ']') next = steps.length - 1;
      else return;
      e.preventDefault();
      jumpTo(next);
    },
    [active, steps.length, jumpTo]
  );

  useEffect(() => {
    function handleWindowKeyDown(event: KeyboardEvent) {
      const section = sectionRef.current;
      if (!section) return;

      const target = event.target;
      if (target instanceof HTMLElement) {
        const isInsideTimeline = section.contains(target);
        if (isInsideTimeline) return;

        const isInteractive = target.isContentEditable || target.closest('input, textarea, select, button, a, [role="button"], [role="link"]');

        if (isInteractive) return;
      }

      const sectionRect = section.getBoundingClientRect();
      const navHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 0;
      const isInView = sectionRect.top < window.innerHeight && sectionRect.bottom > navHeight;

      if (!isInView) return;

      handleKey(event);
    }

    window.addEventListener('keydown', handleWindowKeyDown);
    return () => window.removeEventListener('keydown', handleWindowKeyDown);
  }, [handleKey]);

  return (
    <section ref={sectionRef} className={styles.pinSection} aria-label="Apollo and Artemis missions" aria-describedby={keyboardHintId} tabIndex={0} onKeyDown={handleKey}>
      <div className={styles.sentinelTrack} aria-hidden="true">
        {steps.map((step, i) => (
          <div
            key={i}
            ref={(el) => {
              sentinelRefs.current[i] = el;
            }}
            data-step={i}
            className={`${styles.sentinel} ${step.kind === 'interlude' ? styles.sentinelInterlude : ''}`}
          />
        ))}
      </div>

      <div ref={stageRef} className={styles.stage}>
        <div className={styles.rail}>
          <ol className={styles.railTicks} aria-label="Timeline progress">
            {steps.map((step, i) => {
              const isActive = i === active;
              const label = step.kind === 'mission' ? `${step.mission.label}, ${formatMissionDateRange(step.mission)}` : 'Interlude';
              return (
                <li key={i} className={`${styles.tickItem} ${step.kind === 'interlude' ? styles.tickItemInterlude : ''}`}>
                  <button type="button" className={`${styles.tick} ${isActive ? styles.tickActive : ''}`} aria-label={label} aria-current={isActive ? 'true' : undefined} onClick={() => jumpTo(i)} />
                </li>
              );
            })}
          </ol>
          <p id={keyboardHintId} className={styles.keyboardHint}>
            Use <kbd>←</kbd> / <kbd>→</kbd> to move through the timeline. Use <kbd>[</kbd> / <kbd>]</kbd> to jump to first / last.
          </p>
        </div>

        <div className={styles.deck}>
          {steps.map((step, i) => {
            const isActive = i === active;
            const offset = i - active;
            return (
              <div
                key={i}
                className={`${styles.deckSlot} ${isActive ? styles.deckSlotActive : ''} ${step.kind === 'interlude' ? styles.deckSlotInterlude : ''}`}
                style={{ '--offset': offset } as React.CSSProperties}
                aria-hidden={!isActive}
                inert={!isActive}
              >
                <StepContent step={step} />
              </div>
            );
          })}
        </div>
      </div>

      <div ref={liveRef} className={styles.srOnly} aria-live="polite" aria-atomic="true" />
    </section>
  );
}

function Diptych() {
  const earthrise = getAsset('apollo-8-earthrise');
  const earthset = getAsset('artemis-ii-earthset');
  return (
    <section className={styles.diptych} aria-labelledby="diptych-title">
      <h3 id="diptych-title" className={styles.diptychTitle}>
        The Same Horizon
      </h3>
      <div className={styles.diptychImages}>
        {earthrise && (
          <figure className={styles.diptychFigure}>
            <div className={styles.diptychFrame}>
              <OptimizedImage src={`/${earthrise.file}`} className={styles.earthriseImage} alt={earthrise.alt} loading="lazy" />
            </div>
            <figcaption className={styles.diptychCaption}>
              <CreditCaption credit={earthrise} />
            </figcaption>
          </figure>
        )}
        {earthset && (
          <figure className={styles.diptychFigure}>
            <div className={styles.diptychFrame}>
              <OptimizedImage src={`/${earthset.file}`} alt={earthset.alt} loading="lazy" />
            </div>
            <figcaption className={styles.diptychCaption}>
              <CreditCaption credit={earthset} />
            </figcaption>
          </figure>
        )}
      </div>
      <p className={styles.diptychTie}>
        In 1968, the Earth appeared to the Apollo 8 crew as a sudden revelation—a fragile, blue marble emerging from the darkness. Bill Anders captured it in a moment of unplanned observation. Fifty-eight years later, the Artemis II crew arrived at
        that same horizon with their cameras ready. These two moments stand in contrast: the first was the unexpected discovery of our world from a distance, while the second is the intentional return to that vantage point.
      </p>
    </section>
  );
}

export default function Ch4() {
  const steps = useMemo(() => buildSteps(missions), []);
  const mode = useTimelineMode();

  return (
    <>
      <div className={styles.intro}>
        <p>
          The Apollo program began in 1961 with the objective of landing humans on the Moon and returning them safely to Earth. The goal was achieved through a systematic roadmap of discovery, where each mission served as a vital prerequisite for the
          next.
        </p>
        <p>
          This progression established the foundation for our return to deep space. From the pioneering lunar orbits of Apollo 8 to the completion of Artemis II, every mission in this sequence represents a necessary step in the ongoing evolution of
          lunar exploration.
        </p>
      </div>

      {mode === 'animated' ? <PinnedTimeline steps={steps} /> : <StaticTimeline steps={steps} />}

      <Diptych />
    </>
  );
}
