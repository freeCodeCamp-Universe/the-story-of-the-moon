import styles from './MagmaOceanCrossSection.module.css';

// A vertical slice of the young Moon's outer shell. The whole wedge starts as a
// hot molten glow. As the active step advances, a solid mantle grows DOWN from
// the surface (the Moon cools from the outside in), a pale crust caps the top,
// and a shrinking pocket of hot interior remains at depth — which later feeds
// the dark maria. The cross-section is schematic and kept at the chapter's
// altitude: three regions (crust, mantle, hot interior), no mineral names.
//
// The SVG is decorative (role="img" with a static <desc>); the canonical text
// equivalent is the step legend / live caption rendered by MagmaOceanSection.

const VIEW_W = 386;
const VIEW_H = 380;

// Wedge outline (a flat-topped slice of the shell, wider at the surface and
// tapering with depth). Offset to the right so it clears the depth labels. The
// solid mantle and the molten glow are clipped to this shape.
const WEDGE = 'M86,44 L226,44 L196,344 L116,344 Z';

const SURFACE_Y = 44;
const BASE_Y = 344;
const SHELL_H = BASE_Y - SURFACE_Y;
const CRUST_H = 30;

// How far the solidification front has descended from the surface, as a
// fraction of the shell, at each step (molten → cooling → crust → maria).
const FRONT_FRACTION = [0, 0.45, 0.85, 0.85];
const CRUST_FROM_STEP = 1;
const COOLING_STEP = 1;
const ERUPTS_FROM_STEP = 3;

// At the cooling step, a few grains float up toward the crust (light, buoyant
// minerals) and a few sink toward the deep interior (dense minerals), so the
// "light floats, heavy sinks" mechanism is shown, not just labeled. Decorative;
// deterministic positions.
const DRIFT_UP = [
  { cx: 128, cy: 132 },
  { cx: 158, cy: 122 },
  { cx: 182, cy: 138 },
];
const DRIFT_DOWN = [
  { cx: 136, cy: 206 },
  { cx: 170, cy: 216 },
  { cx: 192, cy: 198 },
];

// Dark basalt pooled at the surface once the eruptions break through, shown at
// the final step. Two shallow flood deposits centered where the plumes reach
// the surface — the dark maria the reader sees on the Moon. Clipped to the wedge.
const MARIA = [
  'M116,44 L164,44 L162,55 Q140,59 118,55 Z',
  'M168,44 L206,44 L204,54 Q186,57 170,54 Z',
];

const LABEL_X = 252;
const WEDGE_RIGHT = 230;

// Static labels for the three regions, placed where each region sits once the
// crust and mantle exist (from the cooling step onward).
const LABELS = [
  { id: 'crust', text: 'crust', y: 70 },
  { id: 'mantle', text: 'mantle', y: 150 },
  { id: 'hot', text: 'hot interior', y: 318 },
];

type Props = {
  /** Active step index into `magmaOcean` (0–3). */
  step: number;
  /** When false, transitions are off and the wedge renders its final state. */
  animate: boolean;
  titleId: string;
  descId: string;
};

export function MagmaOceanCrossSection({
  step,
  animate,
  titleId,
  descId,
}: Props) {
  // Without animation we always render the fully crystallized wedge.
  const activeStep = animate ? step : FRONT_FRACTION.length - 1;
  const hasSolidified = activeStep >= CRUST_FROM_STEP;
  const isCooling = activeStep === COOLING_STEP;
  const isErupting = activeStep >= ERUPTS_FROM_STEP;

  // The mantle is a full-shell rect scaled down from the top, so the cooling
  // front (its lower edge) descends as the step advances.
  const frontScale = FRONT_FRACTION[activeStep];

  return (
    <svg
      className={`${styles.svg} ${animate ? styles.animated : ''}`}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      role="img"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <title id={titleId}>Lunar magma ocean cross-section</title>
      <desc id={descId}>
        A vertical slice of the young Moon&apos;s outer shell. It starts as a
        hot molten ocean. The Moon cools from the outside in: a solid mantle
        grows downward from the surface, light minerals float up to form a pale
        crust on top, and a pocket of hot interior remains deep below. Much
        later that hot interior erupts up through the crust and floods the
        surface as the dark maria.
      </desc>

      <defs>
        <clipPath id="magma-wedge-clip">
          <path d={WEDGE} />
        </clipPath>
        <radialGradient id="magma-molten" cx="50%" cy="92%" r="95%">
          <stop offset="0%" className={styles.moltenHot} />
          <stop offset="100%" className={styles.moltenCool} />
        </radialGradient>
      </defs>

      {/* Depth axis: surface at the top, deeper toward the base. Sits just far
          enough from the left edge that the larger labels do not clip. */}
      <g aria-hidden="true">
        <text className={styles.axisLabel} x="36" y="40" textAnchor="middle">
          surface
        </text>
        <line className={styles.axisLine} x1="36" y1="50" x2="36" y2="334" />
        <path className={styles.axisArrow} d="M31,328 L36,338 L41,328 Z" />
        <text className={styles.axisLabel} x="36" y="356" textAnchor="middle">
          deeper
        </text>
      </g>

      <g clipPath="url(#magma-wedge-clip)">
        {/* Hot molten interior, glowing from the deep base. Revealed wherever
            the solid mantle has not yet grown down over it. */}
        <rect
          className={styles.molten}
          x="70"
          y={SURFACE_Y}
          width="172"
          height={SHELL_H}
          fill="url(#magma-molten)"
        />

        {/* Solid mantle: grows down from the surface as the front descends. */}
        <rect
          className={styles.mantle}
          style={{ '--front-scale': frontScale } as React.CSSProperties}
          x="70"
          y={SURFACE_Y}
          width="172"
          height={SHELL_H}
        />

        {/* Float / sink: shown only at the cooling step. */}
        {isCooling && (
          <g className={styles.drift} aria-hidden="true">
            {DRIFT_UP.map((g, i) => (
              <circle
                key={`up-${i}`}
                className={styles.driftUp}
                style={{ '--i': i } as React.CSSProperties}
                cx={g.cx}
                cy={g.cy}
                r="3.4"
              />
            ))}
            {DRIFT_DOWN.map((g, i) => (
              <circle
                key={`down-${i}`}
                className={styles.driftDown}
                style={{ '--i': i } as React.CSSProperties}
                cx={g.cx}
                cy={g.cy}
                r="3.8"
              />
            ))}
          </g>
        )}

        {/* Pale anorthosite crust caps the surface once cooling begins. */}
        <rect
          className={styles.crust}
          data-visible={hasSolidified ? '' : undefined}
          x="70"
          y={SURFACE_Y}
          width="172"
          height={CRUST_H}
        />

        {/* Maria tie-back: the hot interior erupts up through the crust. */}
        <g
          className={styles.eruption}
          data-visible={isErupting ? '' : undefined}
        >
          <path className={styles.eruptionPlume} d="M138,330 Q134,150 142,44" />
          <path className={styles.eruptionPlume} d="M180,330 Q186,150 178,44" />
        </g>

        {/* Dark maria: basalt pooled at the surface where the plumes break through. */}
        <g
          className={styles.maria}
          data-visible={isErupting ? '' : undefined}
          aria-hidden="true"
        >
          {MARIA.map((d, i) => (
            <path key={`maria-${i}`} className={styles.mariaPatch} d={d} />
          ))}
        </g>
      </g>

      {/* Wedge edge. */}
      <path className={styles.wedgeEdge} d={WEDGE} />

      {/* Region labels, fading in once the crust and mantle exist. */}
      {LABELS.map((label) => (
        <g
          key={label.id}
          className={styles.regionLabel}
          data-visible={hasSolidified ? '' : undefined}
        >
          <line
            className={styles.leader}
            x1={WEDGE_RIGHT - 12}
            y1={label.y}
            x2={LABEL_X - 6}
            y2={label.y}
          />
          <text
            className={styles.regionLabelText}
            x={LABEL_X}
            y={label.y}
            dominantBaseline="central"
          >
            {label.text}
          </text>
        </g>
      ))}

      {/* Maria label: the dark surface patches, called out only once they erupt.
          Sits at the surface level, above the crust label. */}
      <g
        className={styles.regionLabel}
        data-visible={isErupting ? '' : undefined}
      >
        <line
          className={styles.leader}
          x1={WEDGE_RIGHT - 12}
          y1="46"
          x2={LABEL_X - 6}
          y2="46"
        />
        <text
          className={styles.regionLabelText}
          x={LABEL_X}
          y="46"
          dominantBaseline="central"
        >
          maria
        </text>
      </g>
    </svg>
  );
}
