import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { missions, getAsset } from '@/content';
import { CreditCaption } from '@/components/CreditCaption/CreditCaption';
import { Kbd } from '@/components/Kbd/Kbd';
import { OptimizedImage } from '@/components/OptimizedImage/OptimizedImage';
import { Prose } from '@/components/Prose';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { Mission } from '@/types/content';
import { shouldIgnoreInteractiveShortcutTarget } from '@/utils/keyboardShortcuts';
import { MissionDropdown, type JumpItem } from './MissionDropdown';
import styles from './Ch4.module.css';

type Step = { kind: 'mission'; mission: Mission } | { kind: 'interlude' };

const INTERLUDE_BEFORE_KEY = 'artemis-2';
const INTERLUDE_TEXT = 'Fifty-three years pass.';

// Per-mission photo framing overrides. Cover-crops can clip the wrong edge of
// a given photo; map the mission key to a CSS class that nudges object-position.
const PHOTO_POSITION_CLASS: Partial<Record<string, string>> = {
  'apollo-8': styles.photoTop,
};

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
  const launchFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const splashMonthFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const splashDayFormatter = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
  });

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
            <Prose as="p" width="full" key={i} className={styles.prose}>
              {p}
            </Prose>
          ))}
        </div>
        <figure className={styles.panelPhoto}>
          <div className={styles.photoFrame}>
            <OptimizedImage src={mission.photo.src} alt={mission.photo.alt} className={PHOTO_POSITION_CLASS[mission.key]} loading="lazy" />
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

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const wide = window.matchMedia('(min-width: 900px)');

    const update = () => setIsDesktop(wide.matches);
    update();
    wide.addEventListener('change', update);

    return () => {
      wide.removeEventListener('change', update);
    };
  }, []);

  return isDesktop;
}

function PinnedTimeline({ steps, shortcutsEnabled, reducedMotion }: { steps: Step[]; shortcutsEnabled: boolean; reducedMotion: boolean }) {
  const [active, setActive] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isDesktop = useIsDesktop();
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const sentinelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const liveRef = useRef<HTMLDivElement | null>(null);
  const pendingJumpRef = useRef<{ index: number; scrollTop: number } | null>(null);
  const pendingJumpTimeoutRef = useRef<number | null>(null);
  const keyboardHintId = useId();

  const missionCount = useMemo(() => steps.filter((s) => s.kind === 'mission').length, [steps]);
  const items = useMemo<JumpItem[]>(() => steps.map((step) => (step.kind === 'mission' ? { label: `${step.mission.label} · ${formatMissionDateRange(step.mission)}`, isInterlude: false } : { label: INTERLUDE_TEXT, isInterlude: true })), [steps]);

  const activeMissionNumber = useMemo(() => steps.slice(0, active + 1).filter((s) => s.kind === 'mission').length, [steps, active]);
  const activeStep = steps[active];
  const activeLabel = activeStep?.kind === 'mission' ? activeStep.mission.label : INTERLUDE_TEXT;
  const triggerLabel = `Jump to a mission. Step ${activeMissionNumber} of ${missionCount}: ${activeLabel}`;

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
      window.scrollTo({ top: clamped, behavior: reducedMotion ? 'auto' : 'smooth' });
    },
    [clearPendingJump, reducedMotion]
  );

  const handleKey = useCallback(
    (e: Pick<KeyboardEvent, 'key' | 'preventDefault'>) => {
      let next: number;
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
    if (!shortcutsEnabled) {
      return;
    }

    function handleWindowKeyDown(event: KeyboardEvent) {
      const section = sectionRef.current;
      if (!section) return;

      const target = event.target;
      if (target instanceof HTMLElement) {
        const isInsideTimeline = section.contains(target);
        if (isInsideTimeline) return;

        if (shouldIgnoreInteractiveShortcutTarget(target)) return;
      }

      const sectionRect = section.getBoundingClientRect();
      const navHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 0;
      const isInView = sectionRect.top < window.innerHeight && sectionRect.bottom > navHeight;

      if (!isInView) return;

      handleKey(event);
    }

    window.addEventListener('keydown', handleWindowKeyDown);
    return () => window.removeEventListener('keydown', handleWindowKeyDown);
  }, [handleKey, shortcutsEnabled]);

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
          {isDesktop ? (
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
          ) : (
            <button ref={triggerRef} type="button" className={styles.railTrigger} aria-haspopup="menu" aria-expanded={dropdownOpen} aria-controls="ch4-mission-dropdown" aria-label={triggerLabel} onClick={() => setDropdownOpen(true)}>
              <span className={styles.railTriggerTicks} aria-hidden="true">
                {steps.map((step, i) => (
                  <span key={i} className={`${styles.triggerTick} ${i === active ? styles.triggerTickActive : ''} ${step.kind === 'interlude' ? styles.triggerTickInterlude : ''}`} />
                ))}
              </span>
            </button>
          )}
          <p id={keyboardHintId} className={styles.keyboardHint}>
            Scroll up / down or use <Kbd tone="muted">←</Kbd> / <Kbd tone="muted">→</Kbd> to move through the timeline. Use <Kbd tone="muted">[</Kbd> / <Kbd tone="muted">]</Kbd> to jump to first / last.
          </p>
          {!isDesktop && (
            <MissionDropdown
              isOpen={dropdownOpen}
              onClose={() => setDropdownOpen(false)}
              triggerRef={triggerRef}
              items={items}
              activeIndex={active}
              onSelect={(i) => {
                jumpTo(i);
                setDropdownOpen(false);
              }}
            />
          )}
        </div>

        <div data-deck className={`${styles.deck} ${reducedMotion ? styles.deckInstant : ''}`}>
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
        The same horizon
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
      <Prose as="p" className={styles.diptychTie}>
        In 1968, the Apollo 8 crew was caught off guard by a striking sight: Earth rising as a fragile blue marble against the dark void. Bill Anders captured the moment spontaneously during an unplanned pause in their schedule, and said afterward
        that they had come to explore the Moon and ended up discovering Earth. The picture he brought back changed how the planet saw itself.
      </Prose>
      <Prose as="p" className={styles.diptychTie}>
        Fifty-eight years later, the Artemis II crew headed for the same vantage with cameras already set up, taking Earthset as Earth slipped behind the lunar horizon. This time, looking backward was a deliberate act of self-discovery.
      </Prose>
    </section>
  );
}

type Ch4Props = {
  shortcutsEnabled?: boolean;
};

export default function Ch4({ shortcutsEnabled = true }: Ch4Props) {
  const steps = useMemo(() => buildSteps(missions), []);
  const reducedMotion = useReducedMotion();

  return (
    <>
      <Prose className={styles.intro}>
        <p>
          For thousands of years, reaching the Moon lived only in the human imagination. As early as the second century, the satirist Lucian of Samosata wrote of sailing ships lifted into the sky by a whirlwind, a whimsical dream that 17th-century
          astronomy began translating into mathematics and 19th-century science fiction kept alive.
        </p>
        <p>
          By the mid-20th century, this dream finally shifted from fantasy to physics. To conquer a journey so vast, exploration had to become a step-by-step blueprint. This methodical strategy defined NASA's Apollo program, and it remains the
          approach driving the modern Artemis missions today.
        </p>
      </Prose>

      <PinnedTimeline steps={steps} shortcutsEnabled={shortcutsEnabled} reducedMotion={reducedMotion} />

      <Diptych />
    </>
  );
}
