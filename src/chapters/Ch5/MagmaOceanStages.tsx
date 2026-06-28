import { useId } from 'react';

import type { MagmaOceanStep } from '@/types/content';

import { MagmaOceanCrossSection } from './MagmaOceanCrossSection';
import styles from './MagmaOceanStages.module.css';

type MagmaOceanStagesProps = {
  steps: readonly MagmaOceanStep[];
};

export function MagmaOceanStages({ steps }: MagmaOceanStagesProps) {
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
                title={s.marker}
              />
              <p className={styles.stageTitle} aria-hidden="true">
                {/* The visible caption repeats the SVG title, which is the image's accessible name. */}
                {s.marker}
              </p>
            </li>
          );
        })}
      </ol>
    </figure>
  );
}
