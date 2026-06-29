import { CreditCaption } from '@/components/CreditCaption/CreditCaption';
import { OptimizedImage } from '@/components/OptimizedImage/OptimizedImage';
import type { AssetCredit } from '@/types/content';

import styles from './FigurePair.module.css';

type FigurePairProps = {
  first: AssetCredit;
  second: AssetCredit;
};

export function FigurePair({ first, second }: FigurePairProps) {
  return (
    <div className={styles.figurePair}>
      <figure className={styles.figure}>
        <div className={styles.figureFrame}>
          <OptimizedImage
            className={styles.figureImage}
            src={`/${first.file}`}
            alt={first.alt}
            loading="lazy"
          />
        </div>
        <CreditCaption credit={first} />
      </figure>

      <figure className={styles.figure}>
        <div className={styles.figureFrame}>
          <OptimizedImage
            className={styles.figureImage}
            src={`/${second.file}`}
            alt={second.alt}
            loading="lazy"
          />
        </div>
        <CreditCaption credit={second} />
      </figure>
    </div>
  );
}
