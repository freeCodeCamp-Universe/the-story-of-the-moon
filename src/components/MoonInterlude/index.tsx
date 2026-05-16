import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./MoonInterlude.module.css";

const MOON_FILL = "#f1e8db";
const MOON_SHADE = "#b8aea2";
const CRATER_FLOOR = "#cfc5b9";
const CRATER_DEPTH = "#9f958a";
const STAR_COLOR = "#f5f6f7";

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

let starsCache: Array<{
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkle: number;
  periodMs: number;
  phase: number;
}> | null = null;

function getStars() {
  if (starsCache) return starsCache;

  let seed = 1701;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const stars = [];

  for (let index = 0; index < 72; index += 1) {
    stars.push({
      x: 0.02 + random() * 0.96,
      y: 0.04 + random() * 0.9,
      radius: 0.65 + random() * 1.7,
      baseAlpha: 0.38 + random() * 0.42,
      twinkle: 0.1 + random() * 0.2,
      periodMs: 2000 + random() * 2800,
      phase: random() * Math.PI * 2,
    });
  }

  starsCache = stars;
  return stars;
}

function getCanvasContext(canvas: HTMLCanvasElement) {
  if (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent)) {
    return null;
  }

  try {
    return canvas.getContext("2d");
  } catch {
    return null;
  }
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsedMs: number,
  animate: boolean,
  star: ReturnType<typeof getStars>[number],
) {
  const oscillation = animate
    ? Math.sin((elapsedMs / star.periodMs) * Math.PI * 2 + star.phase) *
      star.twinkle
    : 0;

  ctx.globalAlpha = Math.max(0.14, Math.min(1, star.baseAlpha + oscillation));
  ctx.fillStyle = STAR_COLOR;
  ctx.beginPath();
  ctx.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawCrater(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  moonRadius: number,
  crater: (typeof CRATERS)[number],
) {
  const craterX = centerX + crater.x * moonRadius;
  const craterY = centerY + crater.y * moonRadius;
  const craterRadius = crater.radius * moonRadius;
  const litRadius = craterRadius * (0.9 + crater.depth * 0.06);
  const litX = craterX + craterRadius * (0.16 + crater.depth * 0.1);
  const litY = craterY - craterRadius * 0.02;

  ctx.save();
  ctx.beginPath();
  ctx.arc(craterX, craterY, craterRadius, 0, Math.PI * 2);
  ctx.clip();

  ctx.fillStyle = CRATER_DEPTH;
  ctx.beginPath();
  ctx.arc(craterX, craterY, craterRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = CRATER_FLOOR;
  ctx.beginPath();
  ctx.arc(litX, litY, litRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawMoonScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsedMs: number,
  animate: boolean,
) {
  ctx.clearRect(0, 0, width, height);

  for (const star of getStars()) {
    drawStar(ctx, width, height, elapsedMs, animate, star);
  }

  const moonRadius = Math.min(width * 0.155, height * 0.285);
  const moonX = width * 0.3;
  const moonY = height * 0.34;

  ctx.fillStyle = MOON_SHADE;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
  ctx.clip();

  ctx.fillStyle = MOON_FILL;
  ctx.beginPath();
  ctx.ellipse(
    moonX - moonRadius * 0.28,
    moonY - moonRadius * 0.03,
    moonRadius * 0.98,
    moonRadius * 1.02,
    -0.16,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  for (const crater of CRATERS) {
    drawCrater(ctx, moonX, moonY, moonRadius, crater);
  }

  ctx.restore();
}

export default function MoonInterlude() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = getCanvasContext(canvas);
    if (!ctx) return;

    let frameId: number | null = null;
    let startTime: number | null = null;

    const drawCurrentFrame = (elapsedMs: number) => {
      const bounds = canvas.getBoundingClientRect();
      const displayWidth = Math.max(1, Math.round(bounds.width));
      const displayHeight = Math.max(1, Math.round(bounds.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextWidth = Math.round(displayWidth * dpr);
      const nextHeight = Math.round(displayHeight * dpr);

      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawMoonScene(
        ctx,
        displayWidth,
        displayHeight,
        elapsedMs,
        !reducedMotion,
      );
    };

    const onAnimationFrame = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
      }

      drawCurrentFrame(timestamp - startTime);
      frameId = window.requestAnimationFrame(onAnimationFrame);
    };

    drawCurrentFrame(0);

    let cleanupResize: (() => void) | undefined;

    if (typeof ResizeObserver === "function") {
      const resizeObserver = new ResizeObserver(() => drawCurrentFrame(0));
      resizeObserver.observe(canvas);
      cleanupResize = () => resizeObserver.disconnect();
    } else {
      const onResize = () => drawCurrentFrame(0);
      window.addEventListener("resize", onResize);
      cleanupResize = () => window.removeEventListener("resize", onResize);
    }

    if (!reducedMotion) {
      frameId = window.requestAnimationFrame(onAnimationFrame);
    }

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      cleanupResize?.();
    };
  }, [reducedMotion]);

  return (
    <figure
      className={styles.container}
      role="img"
      aria-label={
        reducedMotion
          ? "Static moon illustration with stars between chapter 6 and chapter 7."
          : "Animated moon illustration with softly blinking stars between chapter 6 and chapter 7."
      }
    >
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
    </figure>
  );
}
