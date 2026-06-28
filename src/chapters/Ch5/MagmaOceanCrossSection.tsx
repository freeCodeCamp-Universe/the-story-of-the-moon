import styles from './MagmaOceanCrossSection.module.css';

// A vertical slice of the young Moon's outer shell. The whole wedge starts as a
// hot molten glow. As the step advances, a solid mantle builds UP from the base
// (heavy minerals sink and pile up), a pale crust caps the top (light minerals
// float up and harden), and a band of hot, molten rock stays trapped between
// them. Much later that trapped heat pushes up through the crust and floods the
// surface as the dark maria. The cross-section is schematic and kept at the
// chapter's altitude: three regions (crust, hot interior, mantle), no mineral
// names.
//
// The SVG is decorative (role="img" with a static <desc>); the canonical text
// equivalent is the stage marker rendered beneath each frame by
// MagmaOceanStages.

// Wedge outline (a flat-topped slice of the shell, wider at the surface and
// tapering with depth). Offset to the right so it clears the depth labels. The
// solid mantle and the molten glow are clipped to this shape.
const WEDGE = 'M86,44 L226,44 L191,324 L121,324 Z';

const SURFACE_Y = 44;
const BASE_Y = 324;
const SHELL_H = BASE_Y - SURFACE_Y;
// Nominal crust depth; the mantle and label geometry are measured from here.
const CRUST_H = 42;
const CRUST_BOTTOM = SURFACE_Y + CRUST_H;
const MANTLE_FULL_H = BASE_Y - CRUST_BOTTOM;

// The crust thickens as it solidifies: a thin skin at the cooling step, then a
// fuller cap once it has formed. Indexed by step.
const CRUST_STEP_H = [0, 14, 38, 38];

// How far the solid mantle has risen from the base, as a fraction of the shell
// below the crust, at each step (molten → cooling → crust → maria). It stops
// short of the crust so a band of hot interior stays trapped between them.
const FRONT_FRACTION = [0, 0.32, 0.62, 0.62];
const CRUST_FROM_STEP = 1;
const COOLING_STEP = 1;
const ERUPTS_FROM_STEP = 3;

// At the cooling step, a few grains crystallize within the molten band: light,
// buoyant ones rise toward the crust and dense ones settle down onto the mantle
// pile, so the "light floats, heavy sinks" mechanism is shown, not just
// labeled. Decorative; deterministic positions inside the melt.
const DRIFT_UP = [
  { cx: 128, cy: 104 },
  { cx: 158, cy: 94 },
  { cx: 182, cy: 110 },
];
const DRIFT_DOWN = [
  { cx: 136, cy: 214 },
  { cx: 170, cy: 222 },
  { cx: 192, cy: 206 },
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

// Static labels for the three regions, shown only at the cooling step where all
// three are visible at once. Positioned for that step's geometry (a thin crust,
// a tall molten band, a shallow mantle). Top to bottom: crust, the trapped
// molten band, then the mantle built up from the base.
const LABELS = [
  { id: 'crust', text: 'crust', y: 51 },
  { id: 'hot', text: 'hot interior', y: 165 },
  { id: 'mantle', text: 'mantle', y: 285 },
];

type Props = {
  /** Step index into `magmaOcean` (0–3); the wedge renders this stage statically. */
  step: number;
  titleId: string;
  descId: string;
};

export function MagmaOceanCrossSection({ step, titleId, descId }: Props) {
  const hasSolidified = step >= CRUST_FROM_STEP;
  const isCooling = step === COOLING_STEP;
  const isErupting = step >= ERUPTS_FROM_STEP;

  // The mantle is a rect anchored at the base and scaled up, so its upper edge
  // (the solidification front) rises toward the crust as the step advances.
  const frontScale = FRONT_FRACTION[step];

  return (
    <svg
      className={styles.svg}
      viewBox="6 0 300 356"
      role="img"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <title id={titleId}>Lunar magma ocean cross-section</title>
      <desc id={descId}>
        A vertical slice of the young Moon&apos;s outer shell. It starts as a
        hot molten ocean. As it cools, a solid mantle builds up from the base
        while light minerals float to the top and harden into a pale crust,
        leaving a band of hot, molten rock trapped between them. Much later that
        trapped heat pushes up through the crust and floods the surface as the
        dark maria.
      </desc>

      <defs>
        <clipPath id="magma-wedge-clip">
          <path d={WEDGE} />
        </clipPath>
        <radialGradient id="magma-molten" cx="50%" cy="40%" r="95%">
          <stop offset="0%" className={styles.moltenHot} />
          <stop offset="100%" className={styles.moltenCool} />
        </radialGradient>
      </defs>

      {/* Depth axis: surface at the top, deeper toward the base. Drawn only on
          the first frame; the row shares one orientation, so it need not repeat. */}
      {step === 0 && (
        <g aria-hidden="true">
          <text className={styles.axisLabel} x="36" y="40" textAnchor="middle">
            surface
          </text>
          <line className={styles.axisLine} x1="36" y1="50" x2="36" y2="314" />
          <path className={styles.axisArrow} d="M31,308 L36,318 L41,308 Z" />
          <text className={styles.axisLabel} x="36" y="336" textAnchor="middle">
            deeper
          </text>
        </g>
      )}

      <g clipPath="url(#magma-wedge-clip)">
        {/* Hot molten interior. The mantle (drawn over it from the base) and the
            crust (from the top) leave it visible as a band trapped between. */}
        <rect
          className={styles.molten}
          x="70"
          y={SURFACE_Y}
          width="172"
          height={SHELL_H}
          fill="url(#magma-molten)"
        />

        {/* Solid mantle: built up from the base as the front rises. */}
        <rect
          className={styles.mantle}
          style={{ '--front-scale': frontScale } as React.CSSProperties}
          x="70"
          y={CRUST_BOTTOM}
          width="172"
          height={MANTLE_FULL_H}
        />

        {/* Float / sink: shown only at the cooling step. Light grains rise toward
            the crust, dense grains settle toward the mantle (animated). */}
        {isCooling && (
          <g aria-hidden="true">
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

        {/* Pale anorthosite crust caps the surface once cooling begins, thickening
            from a thin skin to a fuller cap as it solidifies. */}
        <rect
          className={styles.crust}
          data-visible={hasSolidified ? '' : undefined}
          x="70"
          y={SURFACE_Y}
          width="172"
          height={CRUST_STEP_H[step]}
        />

        {/* Maria tie-back: the trapped hot interior pushes up through the crust. */}
        <g
          className={styles.eruption}
          data-visible={isErupting ? '' : undefined}
        >
          <path className={styles.eruptionPlume} d="M138,172 Q134,108 142,44" />
          <path className={styles.eruptionPlume} d="M180,172 Q186,108 178,44" />
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

      {/* Region labels: shown only at the cooling step, where the crust, molten
          band, and mantle are all visible together. */}
      {LABELS.map((label) => (
        <g
          key={label.id}
          className={styles.regionLabel}
          data-visible={isCooling ? '' : undefined}
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
          The one region label shown on the final frame. */}
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
