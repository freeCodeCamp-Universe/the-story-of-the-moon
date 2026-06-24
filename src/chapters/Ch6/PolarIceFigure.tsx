import { useState } from 'react';

import { CreditCaption } from '@/components/CreditCaption/CreditCaption';
import { OptimizedImage } from '@/components/OptimizedImage/OptimizedImage';
import { SegmentedControl } from '@/components/SegmentedControl/SegmentedControl';
import { Switch } from '@/components/Switch/Switch';
import { getAsset } from '@/content';

import styles from './PolarIceFigure.module.css';

type PoleId = 'south' | 'north';

const POLES = [
  { id: 'south', label: 'South pole', mask: '/ch6/south-pole-ice-mask.png' },
  { id: 'north', label: 'North pole', mask: '/ch6/north-pole-ice-mask.png' },
] as const satisfies readonly { id: PoleId; label: string; mask: string }[];

export function PolarIceFigure() {
  const south = getAsset('ch6-south-pole-ice');
  const north = getAsset('ch6-north-pole-ice');

  const [pole, setPole] = useState<PoleId>('south');
  const [highlight, setHighlight] = useState(false);

  if (!south || !north) {
    return null;
  }

  const current = pole === 'south' ? { ...south, ...POLES[0] } : { ...north, ...POLES[1] };

  return (
    <figure className={styles.figure}>
      <div className={styles.controls}>
        <SegmentedControl name="ch6-pole" label="Choose pole" options={POLES.map((option) => ({ value: option.id, label: option.label }))} value={pole} onChange={setPole} />
        <Switch className={styles.highlightSwitch} label="Highlight ice" labelPosition="start" checked={highlight} onChange={setHighlight} />
      </div>

      <div className={`${styles.viewport}${highlight ? ` ${styles.isHighlighting}` : ''}`}>
        <OptimizedImage className={styles.baseLayer} src={`/${current.file}`} alt={current.alt} draggable={false} loading="lazy" />
        <OptimizedImage className={styles.iceLayer} src={current.mask} alt="" aria-hidden="true" draggable={false} loading="lazy" />
      </div>

      <figcaption className={styles.figcaption}>
        <CreditCaption credit={south} />
      </figcaption>
    </figure>
  );
}
