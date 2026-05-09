import { useEffect, useRef, useState, type RefObject } from 'react';

/**
 * Track which scrollytelling step is active based on viewport position.
 *
 * Uses the Scrollama-standard "trigger line" approach: a 1%-tall
 * rootMargin band at 50% of the viewport. A step is "active" when its
 * box contains that trigger line — i.e., its top has scrolled above
 * the line and its bottom is still below. This is reliable at step
 * boundaries where a ratio-based heuristic tends to stick on the
 * previous step as the next one slides in.
 *
 * When multiple steps briefly intersect the band (fast scroll across
 * short steps), we pick the one whose vertical center is closest to
 * the trigger line.
 */
export function useScrollySteps(
  containerRef: RefObject<HTMLElement | null>,
  stepIds: string[],
  initialStepId?: string
): string | null {
  const [activeStepId, setActiveStepId] = useState<string | null>(
    initialStepId ?? stepIds[0] ?? null
  );
  const activeIdRef = useRef(activeStepId);
  activeIdRef.current = activeStepId;

  const stepKey = stepIds.join(',');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const stepEls = Array.from(container.querySelectorAll<HTMLElement>('[data-step-id]'));
    if (stepEls.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let best: { id: string; distance: number } | null = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = (entry.target as HTMLElement).dataset.stepId;
          if (!id) continue;
          const viewportH = entry.rootBounds?.height ?? window.innerHeight;
          const triggerY = viewportH * 0.5;
          const rect = entry.boundingClientRect;
          const centerY = rect.top + rect.height / 2;
          const distance = Math.abs(centerY - triggerY);
          if (!best || distance < best.distance) {
            best = { id, distance };
          }
        }
        if (best && best.id !== activeIdRef.current) {
          setActiveStepId(best.id);
        }
      },
      {
        // 1%-tall band at 50% viewport: rootMargin shrinks the root
        // by 50% from the top and 49% from the bottom.
        rootMargin: '-50% 0px -49% 0px',
        threshold: 0,
      }
    );

    stepEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [containerRef, stepKey]);

  return activeStepId;
}
