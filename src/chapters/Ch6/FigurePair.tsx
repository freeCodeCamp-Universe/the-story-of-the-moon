import { CreditCaption } from '@/components/CreditCaption/CreditCaption';
import { OptimizedImage } from '@/components/OptimizedImage/OptimizedImage';
import type { AssetCredit } from '@/types/content';

import styles from './FigurePair.module.css';

type FigurePairProps = {
  first: AssetCredit;
  second: AssetCredit;
  /** Short figure names. Without one, screen readers might name each group with the
      full img alt and read it twice. */
  firstLabel: string;
  secondLabel: string;
};

export function FigurePair({
  first,
  second,
  firstLabel,
  secondLabel,
}: FigurePairProps) {
  return (
    <div className={styles.figurePair}>
      <figure className={styles.figure} aria-label={firstLabel}>
        <div className={styles.figureFrame}>
          <OptimizedImage
            className={styles.figureImage}
            src={`/${first.file}`}
            alt={first.alt}
            loading="lazy"
          />
        </div>
        <figcaption>
          <CreditCaption credit={first} />
        </figcaption>
      </figure>

      <figure className={styles.figure} aria-label={secondLabel}>
        <div className={styles.figureFrame}>
          <OptimizedImage
            className={styles.figureImage}
            src={`/${second.file}`}
            alt={second.alt}
            loading="lazy"
          />
        </div>
        <figcaption>
          <CreditCaption credit={second} />
        </figcaption>
      </figure>
    </div>
  );
}
