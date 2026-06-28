import { useId } from 'react';

import type { MagmaOceanStep } from '@/types/content';

import { MagmaOceanCrossSection } from './MagmaOceanCrossSection';
import styles from './MagmaOceanSection.module.css';

type MagmaOceanSectionProps = {
  steps: readonly MagmaOceanStep[];
};

export function MagmaOceanSection({ steps }: MagmaOceanSectionProps) {
  const baseId = useId();

  return (
    <figure
      className={styles.figure}
      aria-label="How the lunar magma ocean cooled, in four stages."
    >
      <ol className={styles.grid}>
        {steps.map((s, index) => {
          const titleId = `${baseId}-${index}-title`;
          const descId = `${baseId}-${index}-desc`;
          return (
            <li key={s.id} className={styles.stage}>
              <MagmaOceanCrossSection
                step={index}
                titleId={titleId}
                descId={descId}
              />
              <p className={styles.stageTitle}>{s.marker}</p>
            </li>
          );
        })}
      </ol>
    </figure>
  );
}
