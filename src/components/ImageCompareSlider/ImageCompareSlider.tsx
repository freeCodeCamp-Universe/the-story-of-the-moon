import type { CSSProperties, ChangeEvent, KeyboardEvent } from "react";

import { OptimizedImage } from "@/components/OptimizedImage/OptimizedImage";

import styles from "./ImageCompareSlider.module.css";

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

export function ImageCompareSlider({
  label,
  originalSrc,
  originalAvifSrcSet,
  originalAlt,
  originalLabel,
  topographicSrc,
  topographicAvifSrcSet,
  topographicLabel,
  describedBy,
  sizes,
  value,
  onValueChange,
}: Props) {
  const valueText = getValueText(value, originalLabel, topographicLabel);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onValueChange(clampValue(event.currentTarget.valueAsNumber));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const keySteps: Record<string, number> = {
      ArrowLeft: -STEP,
      ArrowDown: -STEP,
      ArrowRight: STEP,
      ArrowUp: STEP,
      PageDown: -PAGE_STEP,
      PageUp: PAGE_STEP,
    };

    const delta = keySteps[event.key];

    if (delta === undefined) {
      return;
    }

    event.preventDefault();
    onValueChange(clampValue(value + delta));
  };

  return (
    <div
      className={styles.root}
      style={{ "--split-position": `${value}%` } as CSSProperties}
    >
      <div className={styles.frame}>
        <input
          className={styles.sliderInput}
          type="range"
          min={MIN_VALUE}
          max={MAX_VALUE}
          step={1}
          value={value}
          aria-label={label}
          aria-describedby={describedBy}
          aria-valuetext={valueText}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <div className={styles.scene}>
          <OptimizedImage
            className={styles.baseImage}
            src={topographicSrc}
            avifSrcSet={topographicAvifSrcSet}
            sizes={sizes}
            alt=""
            aria-hidden="true"
            loading="lazy"
          />
          <div className={styles.overlayLayer}>
            <OptimizedImage
              className={styles.overlayImage}
              src={originalSrc}
              avifSrcSet={originalAvifSrcSet}
              sizes={sizes}
              alt={originalAlt}
              loading="lazy"
            />
          </div>
          <div className={styles.divider} aria-hidden="true">
            <span className={styles.handle} />
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
