import { useState } from 'react';

import { CreditCaption } from '@/components/CreditCaption/CreditCaption';
import { OptimizedImage } from '@/components/OptimizedImage/OptimizedImage';
import { getAsset } from '@/content';
import { useReducedMotion } from '@/hooks/useReducedMotion';

import styles from './PolarIceFigure.module.css';

type PoleId = 'south' | 'north';

const POLES = [
  { id: 'south', label: 'South pole', mask: '/ch6/south-pole-ice-mask.png' },
  { id: 'north', label: 'North pole', mask: '/ch6/north-pole-ice-mask.png' },
] as const satisfies readonly { id: PoleId; label: string; mask: string }[];

export function PolarIceFigure() {
  const reducedMotion = useReducedMotion();
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
      {reducedMotion ? (
        <div className={styles.staticPair}>
          {POLES.map((option) => {
            const asset = option.id === 'south' ? south : north;
            return (
              <div key={option.id} className={styles.staticItem}>
                <OptimizedImage className={styles.staticImage} src={`/${asset.file}`} alt={asset.alt} loading="lazy" />
                <p className={styles.staticLabel}>{option.label}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <div className={styles.controls}>
            <div className={styles.poleGroup} role="radiogroup" aria-label="Choose pole">
              {POLES.map((option) => (
                <label key={option.id} className={styles.option}>
                  <input className={styles.input} type="radio" name="ch6-pole" value={option.id} checked={pole === option.id} onChange={() => setPole(option.id)} />
                  <span className={styles.button}>{option.label}</span>
                </label>
              ))}
            </div>
            <label className={styles.switch}>
              <span className={styles.switchLabel}>Highlight ice</span>
              <input className={styles.switchInput} type="checkbox" role="switch" checked={highlight} onChange={(event) => setHighlight(event.currentTarget.checked)} />
              <span className={styles.switchTrack} aria-hidden="true">
                <span className={styles.switchThumb} />
              </span>
            </label>
          </div>

          <div className={`${styles.viewport}${highlight ? ` ${styles.isHighlighting}` : ''}`}>
            <OptimizedImage className={styles.baseLayer} src={`/${current.file}`} alt={current.alt} draggable={false} loading="lazy" />
            <OptimizedImage className={styles.iceLayer} src={current.mask} alt="" aria-hidden="true" draggable={false} loading="lazy" />
          </div>
        </>
      )}

      <figcaption className={styles.figcaption}>
        <CreditCaption credit={south} />
      </figcaption>
    </figure>
  );
}
