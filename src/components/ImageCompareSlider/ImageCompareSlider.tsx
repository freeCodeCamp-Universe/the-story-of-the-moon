import { useLayoutEffect, useRef } from 'react';
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react';

import { OptimizedImage } from '@/components/OptimizedImage/OptimizedImage';

import styles from './ImageCompareSlider.module.css';

type Props = {
  label: string;
  originalSrc: string;
  originalAvifSrcSet?: string;
  originalAlt: string;
  originalLabel: string;
  topographicSrc: string;
  topographicAvifSrcSet?: string;
  topographicLabel: string;
  describedBy?: string;
  sizes?: string;
  value: number;
  onValueChange: (value: number) => void;
};

const MIN_VALUE = 0;
const MAX_VALUE = 100;
const STEP = 1;
const PAGE_STEP = 10;

function clampValue(value: number) {
  return Math.min(MAX_VALUE, Math.max(MIN_VALUE, value));
}

function getValueText(value: number, originalLabel: string, topographicLabel: string) {
  if (value <= MIN_VALUE) {
    return `Full ${topographicLabel.toLowerCase()} view`;
  }

  if (value >= MAX_VALUE) {
    return `Full ${originalLabel.toLowerCase()} view`;
  }

  return `${value}% ${originalLabel.toLowerCase()}, ${MAX_VALUE - value}% ${topographicLabel.toLowerCase()}`;
}

export function ImageCompareSlider({ label, originalSrc, originalAvifSrcSet, originalAlt, originalLabel, topographicSrc, topographicAvifSrcSet, topographicLabel, describedBy, sizes, value, onValueChange }: Props) {
  const valueText = getValueText(value, originalLabel, topographicLabel);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<HTMLDivElement | null>(null);
  const activePointerRef = useRef<number | null>(null);
  const lastReportedValueRef = useRef(value);

  useLayoutEffect(() => {
    if (value === lastReportedValueRef.current) {
      return;
    }

    lastReportedValueRef.current = value;

    const frame = frameRef.current;
    const pointerId = activePointerRef.current;

    if (frame && pointerId !== null) {
      try {
        frame.releasePointerCapture(pointerId);
      } catch {
        // pointer was not captured; nothing to release
      }
    }

    activePointerRef.current = null;
  }, [value]);

  const reportValue = (nextValue: number) => {
    lastReportedValueRef.current = nextValue;
    onValueChange(nextValue);
  };

  const updateFromPointer = (clientX: number) => {
    const frame = frameRef.current;

    if (!frame) {
      return;
    }

    const rect = frame.getBoundingClientRect();

    if (rect.width <= 0) {
      return;
    }

    const ratio = (clientX - rect.left) / rect.width;
    reportValue(clampValue(Math.round(ratio * MAX_VALUE)));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== undefined && event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    activePointerRef.current = event.pointerId;
    handleRef.current?.focus({ preventScroll: true, focusVisible: false } as FocusOptions & { focusVisible?: boolean });
    updateFromPointer(event.clientX);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (activePointerRef.current !== event.pointerId) {
      return;
    }

    updateFromPointer(event.clientX);
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (activePointerRef.current !== event.pointerId) {
      return;
    }

    activePointerRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keySteps: Record<string, number> = {
      ArrowLeft: -STEP,
      ArrowDown: -STEP,
      ArrowRight: STEP,
      ArrowUp: STEP,
      PageDown: -PAGE_STEP,
      PageUp: PAGE_STEP,
      Home: -MAX_VALUE,
      End: MAX_VALUE,
    };

    const delta = keySteps[event.key];

    if (delta === undefined) {
      return;
    }

    event.preventDefault();
    reportValue(clampValue(value + delta));
  };

  return (
    <div className={styles.root} style={{ '--split-position': `${value}%` } as CSSProperties}>
      <div ref={frameRef} className={styles.frame} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerEnd} onPointerCancel={handlePointerEnd}>
        <div className={styles.scene}>
          <OptimizedImage className={styles.baseImage} src={topographicSrc} avifSrcSet={topographicAvifSrcSet} sizes={sizes} alt="" aria-hidden="true" loading="lazy" />
          <div className={styles.overlayLayer}>
            <OptimizedImage className={styles.overlayImage} src={originalSrc} avifSrcSet={originalAvifSrcSet} sizes={sizes} alt={originalAlt} loading="lazy" />
          </div>
          <div className={styles.divider}>
            <div
              ref={handleRef}
              className={styles.handle}
              role="slider"
              tabIndex={0}
              aria-label={label}
              aria-describedby={describedBy}
              aria-valuemin={MIN_VALUE}
              aria-valuemax={MAX_VALUE}
              aria-valuenow={value}
              aria-valuetext={valueText}
              aria-orientation="horizontal"
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className={styles.badgeRow} aria-hidden="true">
            <span className={styles.badge}>{originalLabel}</span>
            <span className={styles.badge}>{topographicLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
