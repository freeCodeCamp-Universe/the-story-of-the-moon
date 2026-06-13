import type { CSSProperties } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import styles from './MoonInterlude.module.css';

const MOON_FILL = '#f1e8db';
const MOON_SHADE = '#b8aea2';
const CRATER_FLOOR = '#cfc5b9';
const CRATER_DEPTH = '#9f958a';
const STAR_COLOR = '#f5f6f7';

const MOON_VIEW = 100;
const MOON_CENTER = MOON_VIEW / 2;
const MOON_R = MOON_VIEW / 2;

const CRATERS = [
  { x: -0.27, y: -0.48, radius: 0.115, depth: 0.24 },
  { x: -0.7, y: -0.3, radius: 0.035, depth: 0.13 },
  { x: -0.55, y: -0.2, radius: 0.06, depth: 0.13 },
  { x: 0.12, y: -0.46, radius: 0.024, depth: 0.18 },
  { x: 0.4, y: -0.2, radius: 0.068, depth: 0.22 },
  { x: -0.51, y: 0.23, radius: 0.06, depth: 0.2 },
  { x: 0.15, y: 0.01, radius: 0.04, depth: 0.16 },
  { x: 0.34, y: 0.41, radius: 0.15, depth: 0.2 },
  { x: -0.07, y: 0.56, radius: 0.078, depth: 0.22 },
  { x: -0.3, y: 0.52, radius: 0.02, depth: 0.16 },
  { x: -0.05, y: 0.11, radius: 0.06, depth: 0.14 },
];

const LIT_FACE_CX = MOON_CENTER - MOON_R * 0.28;
const LIT_FACE_CY = MOON_CENTER - MOON_R * 0.03;
const LIT_FACE_ROTATION_DEG = (-0.16 * 180) / Math.PI;

type Star = {
  xPct: number;
  yPct: number;
  diameterPx: number;
  low: number;
  high: number;
  duration: string;
  delay: string;
};

function generateStars(): Star[] {
  let seed = 1701;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const MIN_DISTANCE = 0.085;
  const MAX_ATTEMPTS = 24;
  const placed: { x: number; y: number }[] = [];
  const farEnough = (x: number, y: number) => placed.every(({ x: px, y: py }) => (x - px) ** 2 + (y - py) ** 2 >= MIN_DISTANCE ** 2);

  const stars: Star[] = [];
  for (let i = 0; i < 72; i += 1) {
    let x = 0.02 + random() * 0.96;
    let y = 0.04 + random() * 0.9;
    for (let attempt = 1; attempt < MAX_ATTEMPTS && !farEnough(x, y); attempt += 1) {
      x = 0.02 + random() * 0.96;
      y = 0.04 + random() * 0.9;
    }
    placed.push({ x, y });

    const radius = 0.65 + random() * 1.7;
    const baseAlpha = 0.38 + random() * 0.42;
    const twinkle = 0.1 + random() * 0.2;
    const periodMs = 2000 + random() * 2800;
    const phase = random() * Math.PI * 2;
    const periodSeconds = periodMs / 1000;

    stars.push({
      xPct: x * 100,
      yPct: y * 100,
      diameterPx: radius * 2,
      low: Math.max(0.14, baseAlpha - twinkle),
      high: Math.min(1, baseAlpha + twinkle),
      duration: `${periodSeconds.toFixed(3)}s`,
      delay: `${(-(phase / (Math.PI * 2)) * periodSeconds).toFixed(3)}s`,
    });
  }
  return stars;
}

const STARS = generateStars();

const MOON_CLIP_ID = 'moon-interlude-disc';
const craterClipId = (index: number) => `moon-interlude-crater-${index}`;

type StarStyle = CSSProperties & {
  '--moon-star-low': string;
  '--moon-star-high': string;
  '--moon-star-duration': string;
  '--moon-star-delay': string;
};

export function MoonInterlude() {
  const reducedMotion = useReducedMotion();

  return (
    <figure className={styles.container} role="img" aria-label={reducedMotion ? 'Static moon illustration with stars between chapter 6 and chapter 7.' : 'Animated moon illustration with softly blinking stars between chapter 6 and chapter 7.'}>
      {STARS.map((star, index) => {
        const style: StarStyle = {
          '--moon-star-low': String(star.low),
          '--moon-star-high': String(star.high),
          '--moon-star-duration': star.duration,
          '--moon-star-delay': star.delay,
          insetInlineStart: `${star.xPct}%`,
          insetBlockStart: `${star.yPct}%`,
          inlineSize: `${star.diameterPx}px`,
          blockSize: `${star.diameterPx}px`,
          opacity: star.low,
          background: STAR_COLOR,
        };
        const tierClass = index % 3 === 1 ? styles.starTablet : index % 3 === 2 ? styles.starDesktop : undefined;
        return <span key={index} className={tierClass ? `${styles.star} ${tierClass}` : styles.star} style={style} aria-hidden="true" />;
      })}

      <div className={styles.moonWrapper} aria-hidden="true">
        <svg className={styles.moonSvg} viewBox={`0 0 ${MOON_VIEW} ${MOON_VIEW}`}>
          <defs>
            <clipPath id={MOON_CLIP_ID}>
              <circle cx={MOON_CENTER} cy={MOON_CENTER} r={MOON_R} />
            </clipPath>
            {CRATERS.map((crater, index) => {
              const cx = MOON_CENTER + crater.x * MOON_R;
              const cy = MOON_CENTER + crater.y * MOON_R;
              const r = crater.radius * MOON_R;
              return (
                <clipPath id={craterClipId(index)} key={index}>
                  <circle cx={cx} cy={cy} r={r} />
                </clipPath>
              );
            })}
          </defs>

          <circle cx={MOON_CENTER} cy={MOON_CENTER} r={MOON_R} fill={MOON_SHADE} />

          <g clipPath={`url(#${MOON_CLIP_ID})`}>
            <ellipse cx={LIT_FACE_CX} cy={LIT_FACE_CY} rx={MOON_R * 0.98} ry={MOON_R * 1.02} fill={MOON_FILL} transform={`rotate(${LIT_FACE_ROTATION_DEG} ${LIT_FACE_CX} ${LIT_FACE_CY})`} />
            {CRATERS.map((crater, index) => {
              const cx = MOON_CENTER + crater.x * MOON_R;
              const cy = MOON_CENTER + crater.y * MOON_R;
              const r = crater.radius * MOON_R;
              const litR = r * (0.9 + crater.depth * 0.06);
              const litX = cx + r * (0.16 + crater.depth * 0.1);
              const litY = cy - r * 0.02;
              return (
                <g key={index} clipPath={`url(#${craterClipId(index)})`}>
                  <circle cx={cx} cy={cy} r={r} fill={CRATER_DEPTH} />
                  <circle cx={litX} cy={litY} r={litR} fill={CRATER_FLOOR} />
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </figure>
  );
}
