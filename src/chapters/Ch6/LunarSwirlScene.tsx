import { useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

import { CreditCaption } from '@/components/CreditCaption/CreditCaption';
import { OptimizedImage } from '@/components/OptimizedImage/OptimizedImage';
import { getAsset } from '@/content';

import styles from './LunarSwirlScene.module.css';

// The right-column visualization for the lunar-swirl section. The surrounding
// prose lives in Ch6 (text left, this viz right, matching the other sections).
//
// Three views of the one photo, selected with a tablist. "Original" is the
// default so the reader meets the swirl before opting into the explanation. The
// overlay (field arcs, solar-wind arrows, darkening mask) is decorative; the
// caption above the image carries the meaning as DOM text and names the field
// and the solar wind without decoding colors.
type SwirlView = 'photo' | 'shielded' | 'unshielded';

const VIEWS: { id: SwirlView; label: string; caption: string }[] = [
  {
    id: 'photo',
    label: 'Original',
    caption: 'The swirl as seen from orbit: bright loops lying flat on the dark plain.',
  },
  {
    id: 'shielded',
    label: 'With the shield',
    caption: 'A magnetic field arcs over the swirl and turns the solar wind aside before it reaches the ground, so the surface stays bright.',
  },
  {
    id: 'unshielded',
    label: 'Without the shield',
    caption: 'Research suggests that with no field to turn it aside, the solar wind would reach the ground and slowly darken the swirl until it matched the plain around it.',
  },
];

export function LunarSwirlScene() {
  const baseId = useId();
  const panelId = `${baseId}-panel`;
  const tabId = (index: number) => `${baseId}-tab-${index}`;

  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const credit = getAsset('ch6-reiner-gamma');
  const view = VIEWS[active];

  const handleKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = (index + 1) % VIEWS.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = (index - 1 + VIEWS.length) % VIEWS.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = VIEWS.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className={styles.viz}>
      <div className={styles.tablist} role="tablist" aria-label="Reiner Gamma views">
        {VIEWS.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={tabId(index)}
            aria-selected={active === index}
            aria-controls={panelId}
            tabIndex={active === index ? 0 : -1}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            className={styles.tab}
            onClick={() => setActive(index)}
            onKeyDown={(event) => handleKey(event, index)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div id={panelId} role="tabpanel" aria-labelledby={tabId(active)} tabIndex={0} className={styles.tabpanel}>
        <p className={styles.caption}>{view.caption}</p>

        {credit && (
          <figure className={styles.figure}>
            <div className={styles.figureFrame}>
              <OptimizedImage className={styles.figureImage} src={`/${credit.file}`} alt={credit.alt} loading="lazy" />
              <svg className={styles.overlay} data-view={view.id} viewBox="0 0 800 1000" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <marker id="swirl-arrowhead" markerWidth="7" markerHeight="7" refX="3" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="#f5f6f7" />
                  </marker>
                  <radialGradient id="swirl-darkblob" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#3a3a44" />
                    <stop offset="70%" stopColor="#41414c" />
                    <stop offset="100%" stopColor="#41414c" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Darkening mask: sinks the bright swirl into the mare tone for the
                    "without the shield" view. Two rotated lobes follow the swirl axis. */}
                <g className={styles.darken}>
                  <ellipse cx="292" cy="505" rx="165" ry="78" transform="rotate(-16 292 505)" fill="url(#swirl-darkblob)" />
                  <ellipse cx="470" cy="370" rx="105" ry="46" transform="rotate(-30 470 370)" fill="url(#swirl-darkblob)" />
                  <ellipse cx="150" cy="600" rx="70" ry="34" transform="rotate(-10 150 600)" fill="url(#swirl-darkblob)" />
                </g>

                {/* Magnetic field loops over the swirl (shielded view). */}
                <g className={styles.field} fill="none" strokeWidth="3.5">
                  <path d="M205,560 Q300,470 430,495" opacity="0.8" />
                  <path d="M195,575 Q300,400 450,500" opacity="0.9" />
                  <path d="M185,590 Q305,320 470,505" opacity="1" />
                  <path d="M175,605 Q310,240 490,512" opacity="0.85" />
                </g>

                {/* Solar wind, deflected (shielded view): curves away, never lands. */}
                <g className={styles.arrowsDeflected} fill="none" stroke="#f5f6f7" strokeWidth="2.5">
                  <path d="M180,70 Q180,300 90,470" markerEnd="url(#swirl-arrowhead)" />
                  <path d="M300,70 Q300,260 150,440" markerEnd="url(#swirl-arrowhead)" />
                  <path d="M420,70 Q420,250 560,440" markerEnd="url(#swirl-arrowhead)" />
                  <path d="M540,70 Q540,300 650,470" markerEnd="url(#swirl-arrowhead)" />
                </g>

                {/* Solar wind, straight (unshielded view): reaches the surface. */}
                <g className={styles.arrowsStraight} stroke="#f5f6f7" strokeWidth="2.5">
                  <line x1="180" y1="70" x2="180" y2="560" markerEnd="url(#swirl-arrowhead)" />
                  <line x1="300" y1="70" x2="300" y2="500" markerEnd="url(#swirl-arrowhead)" />
                  <line x1="420" y1="70" x2="420" y2="470" markerEnd="url(#swirl-arrowhead)" />
                  <line x1="540" y1="70" x2="540" y2="540" markerEnd="url(#swirl-arrowhead)" />
                </g>
              </svg>
            </div>
            <CreditCaption credit={credit} />
          </figure>
        )}
      </div>
    </div>
  );
}
