import { useState } from 'react';

import { CreditCaption } from '@/components/CreditCaption/CreditCaption';
import { OptimizedImage } from '@/components/OptimizedImage/OptimizedImage';
import { SegmentedControl } from '@/components/SegmentedControl/SegmentedControl';
import { Switch } from '@/components/Switch/Switch';
import { getAsset } from '@/content';

import styles from './PolarIceFigure.module.css';

type PoleId = 'north' | 'south';

const POLES = [
  { id: 'north', label: 'North pole', mask: '/ch6/north-pole-ice-mask.png' },
  { id: 'south', label: 'South pole', mask: '/ch6/south-pole-ice-mask.png' },
] as const satisfies readonly { id: PoleId; label: string; mask: string }[];

export function PolarIceFigure() {
  const south = getAsset('ch6-south-pole-ice');
  const north = getAsset('ch6-north-pole-ice');

  const [pole, setPole] = useState<PoleId>('north');
  const [highlight, setHighlight] = useState(false);

  if (!south || !north) {
    return null;
  }

  const current =
    pole === 'north' ? { ...north, ...POLES[0] } : { ...south, ...POLES[1] };

  const figureLabel = highlight
    ? `${current.alt} The detected water ice is highlighted in bright cyan against the dimmed relief.`
    : current.alt;

  return (
    <figure className={styles.figure}>
      <div className={styles.controls}>
        <SegmentedControl
          name="ch6-pole"
          label="Choose pole"
          options={POLES.map((option) => ({
            value: option.id,
            label: option.label,
          }))}
          value={pole}
          onChange={setPole}
        />
        <Switch
          className={styles.highlightSwitch}
          label="Highlight ice"
          labelPosition="start"
          checked={highlight}
          onChange={setHighlight}
        />
      </div>

      {/*
       * The two stacked layers (base relief + brightened ice mask) are one
       * composite graphic, exposed as a single image via role="img". Each <img>
       * is alt="" ONLY: an <img> requires an alt attribute, alt="" already removes
       * it from the accessibility tree, and aria-hidden would be redundant on a
       * leaf image.
       *
       * The "Highlight ice" toggle is NOT decorative: dimming the relief and
       * lighting the ice in cyan is how the figure communicates where the ice is
       * and how it clusters. That information must reach screen readers, so the
       * accessible name is state-aware (it gains the highlight clause when on) and
       * the polite live region below announces the change on toggle and on pole
       * switch. Do not revert this to a static, toggle-independent label.
       */}
      <div
        className={`${styles.viewport}${highlight ? ` ${styles.isHighlighting}` : ''}`}
        role="img"
        aria-label={figureLabel}
      >
        <OptimizedImage
          className={styles.baseLayer}
          src={`/${current.file}`}
          alt=""
          draggable={false}
          loading="lazy"
        />
        <OptimizedImage
          className={styles.iceLayer}
          src={current.mask}
          alt=""
          draggable={false}
          loading="lazy"
        />
      </div>

      <figcaption className={styles.figcaption}>
        <CreditCaption credit={current} />
      </figcaption>
    </figure>
  );
}
