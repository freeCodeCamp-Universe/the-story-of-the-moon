import { useEffect, useRef, type ReactNode } from 'react';
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

export default function ScrollyChapter({ visual, steps, onActiveStepChange, initialStepId, ariaLabel, variant = 'side', visualAriaHidden = true, visualBelow }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stepIds = steps.map((s) => s.id);
  const activeId = useScrollySteps(containerRef, stepIds, initialStepId);

  useEffect(() => {
    if (activeId) onActiveStepChange?.(activeId);
  }, [activeId, onActiveStepChange]);

  const containerClass = variant === 'immersive' ? `${styles.container} ${styles.containerImmersive}` : styles.container;

  return (
    <div ref={containerRef} className={containerClass} role="group" aria-label={ariaLabel}>
      <div className={styles.visual}>
        <div className={styles.visualFrame} aria-hidden={visualAriaHidden ? 'true' : undefined}>
          <div className={styles.visualInner}>{visual}</div>
        </div>
        {visualBelow && <div className={styles.visualBelow}>{visualBelow}</div>}
      </div>
      <ol className={styles.steps}>
        {steps.map((step) => (
          <li key={step.id} data-step-id={step.id} className={`${styles.step}${activeId === step.id ? ` ${styles.stepActive}` : ''}`}>
            {step.marker && (
              <span className={styles.marker}>
                <span aria-hidden="true">&gt;</span> {step.marker}
              </span>
            )}
            <div className={styles.stepContent}>{step.content}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}
