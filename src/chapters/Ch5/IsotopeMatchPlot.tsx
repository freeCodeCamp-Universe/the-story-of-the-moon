import { useId } from 'react';

import { isotopeBodies } from '@/content';

import styles from './IsotopeMatchPlot.module.css';

// True-to-scale oxygen three-isotope plot. x = δ18O, y = δ17O (per mil), both
// with numeric ticks. Each body's samples follow a mass-fractionation line of
// slope ~0.52; the lines are offset vertically by the body's Δ17O. Mars
// (+0.30) and Vesta (−0.24) sit on clearly separate lines; Earth and the Moon
// (Δ17O ≈ 0) share one line, their sample marks intermixed.
//
// Axis titles and units render as HTML (see the .axis* labels), not SVG text,
// so they stay the same size as the legend instead of scaling with the chart.
// Only the plot graphics and the tick numbers live in the SVG.

const SLOPE = 0.52;

const VIEW_W = 520;
const VIEW_H = 308;
const PLOT_L = 46;
const PLOT_R = 502;
const PLOT_T = 16;
const PLOT_B = 264;

const X_MIN = 2.6;
const X_MAX = 6.8;
const Y_MIN = 0.9;
const Y_MAX = 3.9;
const X_TICKS = [3, 4, 5, 6];
const Y_TICKS = [1, 2, 3];

const xPix = (delta18O: number) => PLOT_L + ((delta18O - X_MIN) / (X_MAX - X_MIN)) * (PLOT_R - PLOT_L);
const yPix = (delta17O: number) => PLOT_B - ((delta17O - Y_MIN) / (Y_MAX - Y_MIN)) * (PLOT_B - PLOT_T);
const lineDelta17O = (delta18O: number, offset: number) => SLOPE * delta18O + offset;

type BodyStyle = { fill: string; rim: string; centerD18O: number; beads: number };

// App-harmonious categorical palette: pale gray Moon, cyan Earth, slate Vesta,
// amber Mars. centerD18O is a representative whole-rock δ18O used to place each
// cluster along its line.
const BODY: Record<string, BodyStyle> = {
  moon: { fill: '#d6dade', rim: '#9aa1a8', centerD18O: 5.7, beads: 11 },
  earth: { fill: '#6fc3dd', rim: '#357f98', centerD18O: 5.3, beads: 11 },
  vesta: { fill: '#b0b57d', rim: '#6e7344', centerD18O: 3.8, beads: 9 },
  mars: { fill: '#dd9b52', rim: '#a3672c', centerD18O: 4.5, beads: 9 },
};

// Legend order, Moon first so the Earth-Moon pairing reads top of the list.
const LEGEND_ORDER = ['moon', 'earth', 'vesta', 'mars'];

function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

type Bead = { x: number; y: number; r: number };

// Deterministic bead positions (stable across reloads).
const BEADS: Record<string, Bead[]> = (() => {
  const rng = makeRng(20260602);
  const out: Record<string, Bead[]> = {};
  for (const body of isotopeBodies) {
    const style = BODY[body.id];
    out[body.id] = Array.from({ length: style.beads }, () => {
      const d18 = style.centerD18O + (rng() - 0.5) * 0.9;
      const d17 = lineDelta17O(d18, body.delta17O) + (rng() - 0.5) * 0.12;
      return { x: xPix(d18), y: yPix(d17), r: 4.5 + rng() * 2 };
    });
  }
  return out;
})();

export function IsotopeMatchPlot() {
  const titleId = useId();
  const descId = useId();

  return (
    <figure className={styles.figure}>
      <div className={styles.panel}>
        <div className={styles.chart}>
          <p className={`${styles.axisLabel} ${styles.axisY}`} aria-hidden="true">
            <span className={styles.axisName}>
              δ<sup>17</sup>O
            </span>
            <span className={styles.unit}>parts per thousand</span>
          </p>

          <svg className={styles.svg} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} role="img" aria-labelledby={titleId} aria-describedby={descId}>
            <title id={titleId}>Oxygen three-isotope plot</title>
            <desc id={descId}>
              A scatter plot of oxygen isotopes. The horizontal axis is δ18O and the vertical axis is δ17O, both in parts per thousand. Four clusters of sample marks, one per body, each lie along a straight line with the same gentle upward slope. At
              any point along the axis the lines are stacked: Vesta the asteroid lowest, Earth and the Moon together on a single shared line in the middle, and Mars highest. Vesta&apos;s and Mars&apos;s lines stand clearly apart from Earth&apos;s,
              but the Moon&apos;s marks fall directly on Earth&apos;s line and intermix with Earth&apos;s, showing that the Moon and Earth share one oxygen-isotope signature.
            </desc>

            <defs>
              <clipPath id="isotope-plot-clip">
                <rect x={PLOT_L} y={PLOT_T} width={PLOT_R - PLOT_L} height={PLOT_B - PLOT_T} />
              </clipPath>
            </defs>

            {/* Gridlines at ticks. */}
            {X_TICKS.map((t) => (
              <line key={`gx-${t}`} className={styles.grid} x1={xPix(t)} y1={PLOT_T} x2={xPix(t)} y2={PLOT_B} />
            ))}
            {Y_TICKS.map((t) => (
              <line key={`gy-${t}`} className={styles.grid} x1={PLOT_L} y1={yPix(t)} x2={PLOT_R} y2={yPix(t)} />
            ))}

            {/* Axes. */}
            <line className={styles.axis} x1={PLOT_L} y1={PLOT_T} x2={PLOT_L} y2={PLOT_B} />
            <line className={styles.axis} x1={PLOT_L} y1={PLOT_B} x2={PLOT_R} y2={PLOT_B} />

            {/* Ticks + numeric labels. dominant-baseline keeps the gap to the
                tick mark constant regardless of the responsive font size. */}
            {X_TICKS.map((t) => (
              <g key={`tx-${t}`}>
                <line className={styles.axis} x1={xPix(t)} y1={PLOT_B} x2={xPix(t)} y2={PLOT_B + 6} />
                <text className={styles.tickLabel} x={xPix(t)} y={PLOT_B + 13} textAnchor="middle" dominantBaseline="hanging">
                  {t}
                </text>
              </g>
            ))}
            {Y_TICKS.map((t) => (
              <g key={`ty-${t}`}>
                <line className={styles.axis} x1={PLOT_L - 6} y1={yPix(t)} x2={PLOT_L} y2={yPix(t)} />
                <text className={styles.tickLabel} x={PLOT_L - 12} y={yPix(t)} textAnchor="end" dominantBaseline="central">
                  {t}
                </text>
              </g>
            ))}

            {/* Fractionation lines (clipped). Earth and Moon share one. */}
            <g clipPath="url(#isotope-plot-clip)">
              {isotopeBodies.map((body) => (
                <line key={`line-${body.id}`} className={styles.bodyLine} x1={xPix(X_MIN)} y1={yPix(lineDelta17O(X_MIN, body.delta17O))} x2={xPix(X_MAX)} y2={yPix(lineDelta17O(X_MAX, body.delta17O))} stroke={BODY[body.id].fill} />
              ))}
            </g>

            {/* Flat sample marks along each line. */}
            {LEGEND_ORDER.map((id) => BEADS[id].map((bead, index) => <circle key={`${id}-${index}`} cx={bead.x} cy={bead.y} r={bead.r} fill={BODY[id].fill} stroke={BODY[id].rim} strokeWidth="1" />))}
          </svg>

          <p className={`${styles.axisLabel} ${styles.axisX}`} aria-hidden="true">
            <span className={styles.axisName}>
              δ<sup>18</sup>O
            </span>
            <span className={styles.unit}>parts per thousand</span>
          </p>
        </div>

        <ul className={styles.legend} aria-label="Bodies shown">
          {LEGEND_ORDER.map((id) => {
            const body = isotopeBodies.find((b) => b.id === id);
            if (!body) return null;
            return (
              <li key={id} className={styles.legendItem} style={{ '--swatch': BODY[id].fill } as React.CSSProperties}>
                <span className={styles.swatch} aria-hidden="true" />
                <span className={styles.legendName}>{body.name}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <figcaption className={styles.caption}>Oxygen isotope data: Wiechert et al. 2001; Herwartz et al. 2014; Cano et al. 2020. Sample positions are illustrative.</figcaption>
    </figure>
  );
}
