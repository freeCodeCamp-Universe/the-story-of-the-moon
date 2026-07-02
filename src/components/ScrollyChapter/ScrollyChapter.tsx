import { useEffect, useRef, type ReactNode } from 'react';
import { SECTION_NAV_EVENT } from '@/hooks/useKeyboardNav';
import { useScrollySteps } from '@/hooks/useScrollySteps';
import styles from './ScrollyChapter.module.css';

export type ScrollyStep = {
  id: string;
  marker?: string;
  content: ReactNode;
};

/**
 * Layout variants:
 *   - 'side' (default): visual sticky on the left at >=900px, prose
 *     steps scroll in the right column.
 *   - 'immersive': visual fills the viewport as a sticky full-bleed
 *     layer; prose steps scroll as cards overlaid on top.
 */
type Variant = 'side' | 'immersive';

type Props = {
  visual: ReactNode;
  steps: ScrollyStep[];
  onActiveStepChange?: (id: string) => void;
  initialStepId?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  variant?: Variant;
  /** Whether to mark the visual frame aria-hidden (default true). Set
   * to false when the visual hosts focusable controls or interactive
   * regions that should remain reachable to assistive tech. */
  visualAriaHidden?: boolean;
  /** Optional content rendered below the bordered visual frame, in the
   * same sticky column. Use for captions, credits, or interaction
   * hints that should travel with the visual. */
  visualBelow?: ReactNode;
};

export function ScrollyChapter({
  visual,
  steps,
  onActiveStepChange,
  initialStepId,
  ariaLabel,
  ariaLabelledBy,
  variant = 'side',
  visualAriaHidden = true,
  visualBelow,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stepIds = steps.map((s) => s.id);
  const activeId = useScrollySteps(containerRef, stepIds, initialStepId);

  useEffect(() => {
    if (activeId) onActiveStepChange?.(activeId);
  }, [activeId, onActiveStepChange]);

  // A drawer link to a heading inside a step must land on that step. The step
  // is active only when its box crosses the mid-viewport trigger line, and the
  // immersive cards are spaced by tall gaps, so aligning the heading to the top
  // leaves the reader between steps. Claim the nav event and center the owning
  // step instead. Smooth so the scroll tracks content that mounts on the way.
  useEffect(() => {
    function handleSectionNav(event: Event) {
      const detail = (event as CustomEvent<{ id: string }>).detail;
      const container = containerRef.current;
      if (!detail?.id || !container) return;

      const target = document.getElementById(detail.id);
      const stepEl = target?.closest<HTMLElement>('[data-step-id]');
      if (!stepEl || !container.contains(stepEl)) return;

      event.preventDefault();
      stepEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }

    window.addEventListener(SECTION_NAV_EVENT, handleSectionNav);
    return () =>
      window.removeEventListener(SECTION_NAV_EVENT, handleSectionNav);
  }, []);

  const containerClass =
    variant === 'immersive'
      ? `${styles.container} ${styles.containerImmersive}`
      : styles.container;

  return (
    <div
      ref={containerRef}
      className={containerClass}
      role="group"
      aria-label={ariaLabelledBy ? undefined : ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      <ol className={styles.steps}>
        {steps.map((step) => (
          <li
            key={step.id}
            data-step-id={step.id}
            className={`${styles.step}${activeId === step.id ? ` ${styles.stepActive}` : ''}`}
          >
            {step.marker && (
              <span className={styles.marker}>
                <span aria-hidden="true">&gt;</span> {step.marker}
              </span>
            )}
            <div className={styles.stepContent}>{step.content}</div>
          </li>
        ))}
      </ol>
      <div className={styles.visual}>
        <div
          className={styles.visualFrame}
          aria-hidden={visualAriaHidden ? 'true' : undefined}
        >
          <div className={styles.visualInner}>{visual}</div>
        </div>
        {visualBelow && <div className={styles.visualBelow}>{visualBelow}</div>}
      </div>
    </div>
  );
}
