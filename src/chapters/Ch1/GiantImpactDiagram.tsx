import type { ReactNode } from "react";

import styles from "./GiantImpactDiagram.module.css";

type Star = {
  cx: number;
  cy: number;
  r: number;
  duration: string;
  delay: string;
};

type BodyMark = {
  dx: number;
  dy: number;
  rx: number;
  ry: number;
  rotate?: number;
};

type StageSvgProps = {
  idPrefix: string;
  title: string;
  desc: string;
  stageTitle: string;
  stars: readonly Star[];
  children: ReactNode;
};

type PlanetProps = {
  cx: number;
  cy: number;
  radius: number;
  fillId: string;
  marks: readonly BodyMark[];
  markFill: string;
  markOpacity?: number;
};

const stageWidth = 280;
const stageHeight = 244;
const stageViewBox = `0 0 ${stageWidth} ${stageHeight}`;

const earthMarks = [
  { dx: -0.42, dy: 0.08, rx: 0.1, ry: 0.09, rotate: -20 },
  { dx: -0.1, dy: -0.42, rx: 0.08, ry: 0.06, rotate: 18 },
  { dx: 0.3, dy: -0.2, rx: 0.11, ry: 0.08, rotate: 28 },
  { dx: 0.36, dy: 0.2, rx: 0.08, ry: 0.06, rotate: -14 },
  { dx: 0.02, dy: 0.34, rx: 0.06, ry: 0.05, rotate: 10 },
] as const satisfies readonly BodyMark[];

const craterMarks = [
  { dx: -0.3, dy: -0.16, rx: 0.2, ry: 0.12, rotate: 25 },
  { dx: 0.26, dy: -0.28, rx: 0.12, ry: 0.08, rotate: -10 },
  { dx: -0.22, dy: 0.28, rx: 0.16, ry: 0.11, rotate: 8 },
  { dx: 0.3, dy: 0.16, rx: 0.12, ry: 0.09, rotate: -25 },
] as const satisfies readonly BodyMark[];

const starSets = {
  approach: [
    { cx: 20, cy: 26, r: 0.9, duration: "4.8s", delay: "0.4s" },
    { cx: 34, cy: 156, r: 1.1, duration: "5.9s", delay: "2.2s" },
    { cx: 58, cy: 108, r: 1.4, duration: "5.3s", delay: "1.1s" },
    { cx: 94, cy: 180, r: 0.8, duration: "3.6s", delay: "0.8s" },
    { cx: 214, cy: 24, r: 1, duration: "4.3s", delay: "2.7s" },
    { cx: 244, cy: 38, r: 1.2, duration: "6.2s", delay: "1.9s" },
    { cx: 272, cy: 128, r: 1.6, duration: "4.2s", delay: "0.2s" },
  ],
  impact: [
    { cx: 18, cy: 34, r: 1.1, duration: "4.5s", delay: "0.3s" },
    { cx: 28, cy: 150, r: 1.4, duration: "6.1s", delay: "1.7s" },
    { cx: 66, cy: 100, r: 0.8, duration: "3.6s", delay: "2.6s" },
    { cx: 212, cy: 28, r: 1, duration: "4.7s", delay: "1.4s" },
    { cx: 242, cy: 48, r: 1.2, duration: "5.3s", delay: "1.1s" },
    { cx: 260, cy: 146, r: 1.1, duration: "4.3s", delay: "2.2s" },
    { cx: 252, cy: 96, r: 1.5, duration: "6.2s", delay: "0.8s" },
    { cx: 204, cy: 174, r: 0.9, duration: "4.0s", delay: "2.9s" },
  ],
  debris: [
    { cx: 18, cy: 24, r: 1.1, duration: "4.9s", delay: "0.5s" },
    { cx: 30, cy: 142, r: 1.2, duration: "5.7s", delay: "1.6s" },
    { cx: 74, cy: 40, r: 0.8, duration: "3.5s", delay: "2.3s" },
    { cx: 216, cy: 24, r: 1, duration: "4.2s", delay: "0.9s" },
    { cx: 244, cy: 62, r: 1.4, duration: "6.3s", delay: "1.9s" },
    { cx: 252, cy: 152, r: 1, duration: "4.4s", delay: "2.8s" },
    { cx: 210, cy: 176, r: 1.2, duration: "5.0s", delay: "0.7s" },
    { cx: 48, cy: 176, r: 0.9, duration: "5.4s", delay: "2.5s" },
  ],
  coalesce: [
    { cx: 18, cy: 28, r: 1, duration: "4.3s", delay: "0.6s" },
    { cx: 34, cy: 150, r: 1.3, duration: "5.9s", delay: "2.1s" },
    { cx: 86, cy: 20, r: 0.9, duration: "3.4s", delay: "1.4s" },
    { cx: 208, cy: 34, r: 1.1, duration: "5.4s", delay: "0.2s" },
    { cx: 238, cy: 80, r: 1.2, duration: "4.7s", delay: "2.5s" },
    { cx: 250, cy: 156, r: 1, duration: "6.2s", delay: "1.3s" },
    { cx: 188, cy: 176, r: 1.5, duration: "5.0s", delay: "2.7s" },
    { cx: 62, cy: 182, r: 1.1, duration: "5.7s", delay: "0.8s" },
  ],
} as const satisfies Record<string, readonly Star[]>;

function StageDefs({ prefix }: { prefix: string }) {
  return (
    <defs>
      <radialGradient id={`${prefix}-earth`} cx="35%" cy="28%" r="75%">
        <stop offset="0%" stopColor="#b4efff" />
        <stop offset="58%" stopColor="#67c5dc" />
        <stop offset="100%" stopColor="#266d8f" />
      </radialGradient>
      <radialGradient id={`${prefix}-theia`} cx="35%" cy="28%" r="75%">
        <stop offset="0%" stopColor="#a8b0b8" />
        <stop offset="58%" stopColor="#7a8490" />
        <stop offset="100%" stopColor="#454c55" />
      </radialGradient>
      <radialGradient id={`${prefix}-moon`} cx="35%" cy="28%" r="75%">
        <stop offset="0%" stopColor="#eef2f3" />
        <stop offset="58%" stopColor="#d2d9dd" />
        <stop offset="100%" stopColor="#adb7bf" />
      </radialGradient>
      <clipPath id={`${prefix}-back-half`}>
        <rect x="0" y="0" width={stageWidth} height="102" />
      </clipPath>
      <clipPath id={`${prefix}-front-half`}>
        <rect x="0" y="102" width={stageWidth} height={stageHeight - 102} />
      </clipPath>
      <marker
        id={`${prefix}-arrow`}
        markerWidth="6"
        markerHeight="6"
        refX="5.2"
        refY="3"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path d="M0 0 L6 3 L0 6 z" fill="#f5f6f7" />
      </marker>
    </defs>
  );
}

function Stars({ stars }: { stars: readonly Star[] }) {
  return (
    <g className={styles.stars}>
      {stars.map((star, index) => (
        <circle
          key={`${star.cx}-${star.cy}-${index}`}
          className={styles.star}
          cx={star.cx}
          cy={star.cy}
          r={star.r}
          fill="#ffffff"
          style={{
            animationDuration: star.duration,
            animationDelay: star.delay,
          }}
        />
      ))}
    </g>
  );
}

function Planet({
  cx,
  cy,
  radius,
  fillId,
  marks,
  markFill,
  markOpacity = 0.32,
}: PlanetProps) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={radius} fill={`url(#${fillId})`} />
      {marks.map((mark, index) => {
        const markCx = cx + mark.dx * radius;
        const markCy = cy + mark.dy * radius;

        return (
          <ellipse
            key={`${mark.dx}-${mark.dy}-${index}`}
            cx={markCx}
            cy={markCy}
            rx={mark.rx * radius}
            ry={mark.ry * radius}
            fill={markFill}
            opacity={markOpacity}
            transform={`rotate(${mark.rotate ?? 0} ${markCx} ${markCy})`}
          />
        );
      })}
    </g>
  );
}

function Caption({ stageTitle }: { stageTitle: string }) {
  return (
    <text className={styles.stageTitle} x="140" y="220">
      {stageTitle}
    </text>
  );
}

function StageSvg({
  idPrefix,
  title,
  desc,
  stageTitle,
  stars,
  children,
}: StageSvgProps) {
  const titleId = `${idPrefix}-title`;
  const descId = `${idPrefix}-desc`;

  return (
    <svg
      className={styles.svg}
      viewBox={stageViewBox}
      role="img"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <title id={titleId}>{title}</title>
      <desc id={descId}>{desc}</desc>
      <rect
        width={stageWidth}
        height={stageHeight}
        rx="12"
        style={{ fill: "var(--color-bg)" }}
      />
      <StageDefs prefix={idPrefix} />
      <Stars stars={stars} />
      {children}
      <Caption stageTitle={stageTitle} />
    </svg>
  );
}

function ApproachStage() {
  const prefix = "giant-impact-approach";

  return (
    <div className={styles.stage}>
      <StageSvg
        idPrefix={prefix}
        title="Approach stage of the giant-impact hypothesis."
        desc="Theia approaches the young Earth from the upper left on an angled path."
        stageTitle="Approach"
        stars={starSets.approach}
      >
        <Planet
          cx={74}
          cy={58}
          radius={24}
          fillId={`${prefix}-theia`}
          marks={craterMarks}
          markFill="#8c969e"
          markOpacity={0.34}
        />
        <Planet
          cx={202}
          cy={120}
          radius={48}
          fillId={`${prefix}-earth`}
          marks={earthMarks}
          markFill="#2682a4"
          markOpacity={0.38}
        />
        <text className={styles.label} x={110} y={35}>
          Theia
        </text>
        <text className={styles.label} x={202} y={186}>
          Earth
        </text>
        <path
          d="M102 77 L150 100"
          fill="none"
          stroke="#f5f6f7"
          strokeWidth="1.75"
          strokeDasharray="5 4"
          strokeLinecap="round"
          markerEnd={`url(#${prefix}-arrow)`}
        />
      </StageSvg>
    </div>
  );
}

function ImpactStage() {
  const prefix = "giant-impact-impact";
  // Theia at (129, 67) struck Earth from upper-left. Ejecta is kept on Theia's
  // side of the scene as a tight blast plume reaching back along Theia's
  // incoming trajectory (upper-left), so it reads clearly against the dark
  // background and doesn't clash with Earth's blue.
  const ejectaChunks = [
    "M118 52 l6 -4 l3 6 z",
    "M108 60 l5 -3 l2 6 z",
    "M100 46 l5 -6 l4 5 z",
    "M112 38 l6 -3 l1 6 z",
    "M92 54 l-4 -6 l8 -1 z",
    "M86 38 l5 -5 l3 6 z",
  ] as const;
  const ejectaDust = [
    // ring of dust along Theia's blast-side edge
    { cx: 120, cy: 60, r: 0.9 },
    { cx: 114, cy: 66, r: 0.7 },
    { cx: 108, cy: 52, r: 0.8 },
    { cx: 122, cy: 48, r: 0.6 },
    { cx: 116, cy: 44, r: 0.8 },
    { cx: 104, cy: 70, r: 0.6 },
    // plume reaching upper-left
    { cx: 96, cy: 38, r: 0.9 },
    { cx: 88, cy: 46, r: 0.7 },
    { cx: 82, cy: 32, r: 0.8 },
    { cx: 78, cy: 48, r: 0.5 },
    { cx: 72, cy: 38, r: 0.6 },
    { cx: 102, cy: 32, r: 0.7 },
    { cx: 90, cy: 22, r: 0.6 },
    { cx: 96, cy: 60, r: 0.5 },
    { cx: 84, cy: 60, r: 0.7 },
    // far stragglers
    { cx: 64, cy: 30, r: 0.5 },
    { cx: 70, cy: 50, r: 0.6 },
    { cx: 80, cy: 18, r: 0.5 },
  ] as const;

  return (
    <div className={styles.stage}>
      <StageSvg
        idPrefix={prefix}
        title="Impact stage of the giant-impact hypothesis."
        desc="Theia is partly swallowed by Earth during the impact, while bright fragments spray outward."
        stageTitle="Impact"
        stars={starSets.impact}
      >
        <Planet
          cx={129}
          cy={67}
          radius={23}
          fillId={`${prefix}-theia`}
          marks={craterMarks}
          markFill="#8c969e"
          markOpacity={0.34}
        />
        <Planet
          cx={176}
          cy={102}
          radius={48}
          fillId={`${prefix}-earth`}
          marks={earthMarks}
          markFill="#2682a4"
          markOpacity={0.38}
        />
        {ejectaChunks.map((d) => (
          <path key={d} d={d} fill="#f5f6f7" opacity="0.9" />
        ))}
        {ejectaDust.map((dot) => (
          <circle
            key={`${dot.cx}-${dot.cy}`}
            cx={dot.cx}
            cy={dot.cy}
            r={dot.r}
            fill="#f5f6f7"
            opacity="0.75"
          />
        ))}
      </StageSvg>
    </div>
  );
}

function DebrisRingStage() {
  const prefix = "giant-impact-debris";
  const ringCx = 145;
  const ringCy = 102;
  const ringRx = 84;
  const ringRy = 34;
  const bandHalf = 10;

  type DebrisSpec = readonly [number, number, number, "circle" | "chunk"];
  // [angleDeg, bandOffset in [-1, 1], size, shape]
  // Gaps intentionally left around 118-148° and 232-258° so the ring is not uniformly packed.
  // Sizes are baked at their final rendered values: circles >= 0.8 so dust is
  // visible at the diagram scale; chunks 2.0-3.5 for the larger fragments.
  const debrisSpecs: readonly DebrisSpec[] = [
    [8, 0.3, 1.0, "circle"],
    [16, -0.4, 1.4, "circle"],
    [22, 0.6, 0.9, "circle"],
    [28, 0.6, 3.0, "chunk"],
    [36, -0.6, 1.2, "circle"],
    [42, 0.2, 2.0, "chunk"],
    [50, -0.4, 1.0, "circle"],
    [58, 0.5, 1.6, "circle"],
    [66, 0.7, 2.6, "chunk"],
    [74, -0.3, 0.9, "circle"],
    [82, 0.4, 1.3, "circle"],
    [88, -0.6, 3.4, "chunk"],
    [96, 0.5, 0.9, "circle"],
    [104, -0.2, 1.7, "circle"],
    [112, 0.5, 1.0, "circle"],
    // gap 118-148 (mostly empty)
    [130, -0.3, 0.9, "circle"],
    [142, 0.4, 1.0, "circle"],
    [152, 0.3, 2.2, "chunk"],
    [160, -0.4, 1.1, "circle"],
    [168, 0.6, 1.4, "circle"],
    [174, -0.5, 2.8, "chunk"],
    [182, 0.2, 0.9, "circle"],
    [188, -0.6, 1.2, "circle"],
    [196, 0.4, 2.0, "chunk"],
    [204, -0.2, 1.0, "circle"],
    [212, 0.6, 1.5, "circle"],
    [220, -0.4, 0.9, "circle"],
    [226, 0.3, 1.0, "circle"],
    // gap 232-258 (mostly empty)
    [240, 0.4, 0.9, "circle"],
    [254, -0.5, 1.0, "circle"],
    [264, 0.4, 1.8, "chunk"],
    [272, -0.5, 1.0, "circle"],
    [278, 0.6, 1.3, "circle"],
    [284, -0.2, 3.0, "chunk"],
    [292, 0.3, 0.9, "circle"],
    [298, -0.6, 1.4, "circle"],
    [304, 0.2, 1.0, "circle"],
    [310, -0.3, 2.4, "chunk"],
    [318, 0.7, 1.0, "circle"],
    [326, -0.4, 1.3, "circle"],
    [334, 0.3, 2.2, "chunk"],
    [342, -0.5, 1.1, "circle"],
    [350, 0.4, 1.2, "circle"],
    [358, -0.2, 0.9, "circle"],
  ];

  const debris = debrisSpecs.map(([deg, n, size, shape]) => {
    const t = (deg * Math.PI) / 180;
    const cosT = Math.cos(t);
    const sinT = Math.sin(t);
    const mag = Math.sqrt(
      ringRy * ringRy * cosT * cosT + ringRx * ringRx * sinT * sinT,
    );
    const nx = (ringRy * cosT) / mag;
    const ny = (ringRx * sinT) / mag;
    return {
      x: ringCx + ringRx * cosT + bandHalf * n * nx,
      y: ringCy + ringRy * sinT + bandHalf * n * ny,
      size,
      shape,
    };
  });

  const back = debris.filter((piece) => piece.y < ringCy);
  const front = debris.filter((piece) => piece.y >= ringCy);

  const renderPiece = (
    piece: (typeof debris)[number],
    key: string,
  ): ReactNode => {
    if (piece.shape === "circle") {
      return (
        <circle
          key={key}
          cx={piece.x}
          cy={piece.y}
          r={piece.size}
          fill="#dde1e6"
          opacity="0.95"
        />
      );
    }
    const half = piece.size / 2;
    return (
      <rect
        key={key}
        x={piece.x - half}
        y={piece.y - half}
        width={piece.size}
        height={piece.size}
        fill="#dde1e6"
        opacity="0.95"
        transform={`rotate(${(piece.x * 7) % 60} ${piece.x} ${piece.y})`}
      />
    );
  };

  return (
    <div className={styles.stage}>
      <StageSvg
        idPrefix={prefix}
        title="Debris-ring stage of the giant-impact hypothesis."
        desc="Earth sits inside a tilted debris ring, with the back half hidden behind the planet and the front half passing in front."
        stageTitle="Debris ring"
        stars={starSets.debris}
      >
        <g
          transform="rotate(24 145 102)"
          clipPath={`url(#${prefix}-back-half)`}
        >
          <ellipse
            cx="145"
            cy="102"
            rx="84"
            ry="34"
            fill="none"
            stroke="#b8bec7"
            strokeWidth="22"
            opacity="0.34"
          />
          {back.map((piece, index) =>
            renderPiece(piece, `back-${index}-${piece.x.toFixed(1)}`),
          )}
        </g>
        <Planet
          cx={145}
          cy={102}
          radius={48}
          fillId={`${prefix}-earth`}
          marks={earthMarks}
          markFill="#2682a4"
          markOpacity={0.38}
        />
        <g
          transform="rotate(24 145 102)"
          clipPath={`url(#${prefix}-front-half)`}
        >
          <ellipse
            cx="145"
            cy="102"
            rx="84"
            ry="34"
            fill="none"
            stroke="#b8bec7"
            strokeWidth="22"
            opacity="0.34"
          />
          {front.map((piece, index) =>
            renderPiece(piece, `front-${index}-${piece.x.toFixed(1)}`),
          )}
        </g>
      </StageSvg>
    </div>
  );
}

function CoalesceStage() {
  const prefix = "giant-impact-coalesce";
  const orbitCenterX = 144;
  const orbitCenterY = 102;

  return (
    <div className={styles.stage}>
      <StageSvg
        idPrefix={prefix}
        title="Coalescence stage of the giant-impact hypothesis."
        desc="A small moon now orbits Earth after the debris ring gathers into one body."
        stageTitle="Coalesce"
        stars={starSets.coalesce}
      >
        <g
          transform={`rotate(17 ${orbitCenterX} ${orbitCenterY})`}
          clipPath={`url(#${prefix}-back-half)`}
        >
          <ellipse
            cx={orbitCenterX}
            cy={orbitCenterY}
            rx="103"
            ry="38"
            fill="none"
            stroke="#858b95"
            strokeWidth="2.25"
            opacity="0.78"
          />
        </g>
        <Planet
          cx={153}
          cy={102}
          radius={48}
          fillId={`${prefix}-earth`}
          marks={earthMarks}
          markFill="#2682a4"
          markOpacity={0.38}
        />
        <g
          transform={`rotate(17 ${orbitCenterX} ${orbitCenterY})`}
          clipPath={`url(#${prefix}-front-half)`}
        >
          <ellipse
            cx={orbitCenterX}
            cy={orbitCenterY}
            rx="103"
            ry="38"
            fill="none"
            stroke="#8d949e"
            strokeWidth="2.25"
            opacity="0.82"
          />
        </g>
        <text className={styles.label} x={66} y={34}>
          Moon
        </text>
        <Planet
          cx={64}
          cy={54}
          radius={13}
          fillId={`${prefix}-moon`}
          marks={craterMarks}
          markFill="#98a3ac"
          markOpacity={0.26}
        />
      </StageSvg>
    </div>
  );
}

export default function GiantImpactDiagram() {
  return (
    <figure
      className={styles.figure}
      aria-label="The giant-impact hypothesis in four stages."
    >
      <div className={styles.grid}>
        <ApproachStage />
        <ImpactStage />
        <DebrisRingStage />
        <CoalesceStage />
      </div>
    </figure>
  );
}
