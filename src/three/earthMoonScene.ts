import * as THREE from 'three';

/**
 * Sun / Earth / Moon scene for Chapter 3.
 *
 * Composition is schematic, not physically accurate: sizes and
 * distances are tuned for legibility against a dark background.
 */

export type EarthMoonSceneHandle = {
  setWithMoon: (value: boolean) => void;
  setShowEclipse: (value: boolean) => void;
  setShowFullMoon: (value: boolean) => void;
  setShowLunarEclipse: (value: boolean) => void;
  dispose: () => void;
} | null;

const EARTH_RADIUS = 0.7;
const MOON_RADIUS = 0.18;
const MOON_ORBIT = 2.4;
const DEFAULT_TILT_DEG = 23.5;
// Real moon orbit is tilted ~5.14° off the ecliptic. The tilt is purely
// cosmetic here — there's no shadow physics, so it doesn't affect lighting.
// It just makes the orbit ring read as a gentle ellipse instead of a flat
// horizontal line.
const ORBIT_TILT_DEG = 5;
const SUN_X = -7;
// Schematic, not physical. True ratio is ~109× Earth's radius, which
// would fill the entire view. 2.57× (1.8 / 0.7) keeps the Sun clearly
// dominant while the composition stays readable. Earth:Moon at
// 0.7 / 0.18 ≈ 3.89× is close to the real 3.67× and left unchanged.
const SUN_RADIUS = 1.8;
const SUN_HALO_SCALE = 10;
const CAMERA_FOV_DEG = 40;
// Desktop camera distance. Pulled back from the original 10 so the
// horizontal visible span is wide enough to show the Moon clear of
// the step card AND keep a good portion of the Sun disc on-screen.
// At distance 14 the Sun is ~half visible on 1280-wide viewports and
// fully visible on 1440+.
const CAMERA_DISTANCE_DESKTOP = 12;

// Desktop layout: the immersive step card sits on the right with a
// fixed max-width (34rem = 544px) plus container gutter. We shift
// the scene so the Moon's rightmost orbit position stays left of
// the card with some visual breathing room.
const CARD_OCCLUDED_PX = 544 + 48 + 32;
// Below this canvas width the chapter falls back to a sticky sidebar
// layout (matching Ch2) and the camera fits the whole composition.
const IMMERSIVE_MIN_WIDTH = 900;
const IMMERSIVE_WIDE_MIN_WIDTH = 1800;
const IMMERSIVE_ULTRAWIDE_MIN_WIDTH = 2800;

type ImmersiveDesktopFrame = {
  moonOffsetPx: number;
  sunX: number;
};

function getImmersiveDesktopFrame(width: number): ImmersiveDesktopFrame | null {
  if (width >= IMMERSIVE_ULTRAWIDE_MIN_WIDTH) {
    return {
      moonOffsetPx: 600,
      sunX: -9.7,
    };
  }

  if (width >= IMMERSIVE_WIDE_MIN_WIDTH) {
    return {
      moonOffsetPx: 200,
      sunX: -8.75,
    };
  }

  return null;
}

function getCanvasSize(canvas: HTMLCanvasElement) {
  return {
    width: Math.max(canvas.clientWidth, 1),
    height: Math.max(canvas.clientHeight, 1),
  };
}

function makeOrbitRing(radius: number, color: number) {
  const segments = 128;
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineDashedMaterial({
    color,
    dashSize: 0.1,
    gapSize: 0.08,
  });
  const line = new THREE.Line(geometry, material);
  line.computeLineDistances();
  return { line, geometry, material };
}

function makeSunHalo(position: THREE.Vector3, scale: number) {
  const texture = new THREE.CanvasTexture(createHaloCanvas());
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    color: 0xffd27a,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.position.copy(position);
  sprite.scale.set(scale, scale, 1);
  return { sprite, material, texture };
}

function createHaloCanvas(): HTMLCanvasElement {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255, 244, 204, 1)');
  grad.addColorStop(0.2, 'rgba(255, 210, 122, 0.6)');
  grad.addColorStop(0.6, 'rgba(241, 190, 50, 0.15)');
  grad.addColorStop(1, 'rgba(241, 190, 50, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

function createEarthCanvas(): HTMLCanvasElement {
  // Stylized earth: ocean base with a handful of dark-green landmass
  // blobs drawn at pseudo-random positions. Seeded from fixed offsets
  // so the pattern is stable across runs — rotation reads because
  // there are obvious features, not because the texture is accurate.
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const ocean = ctx.createLinearGradient(0, 0, 0, height);
  ocean.addColorStop(0, '#3a7fb5');
  ocean.addColorStop(0.5, '#4d96c8');
  ocean.addColorStop(1, '#356b9a');
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, width, height);

  const blobs: Array<{ cx: number; cy: number; rx: number; ry: number; fill: string }> = [
    { cx: 0.15, cy: 0.38, rx: 0.04, ry: 0.07, fill: '#a6cde4' },
    { cx: 0.28, cy: 0.62, rx: 0.05, ry: 0.06, fill: '#b5d6e9' },
    { cx: 0.42, cy: 0.44, rx: 0.06, ry: 0.09, fill: '#9ec4e0' },
    { cx: 0.55, cy: 0.7, rx: 0.04, ry: 0.05, fill: '#b5d6e9' },
    { cx: 0.68, cy: 0.36, rx: 0.05, ry: 0.08, fill: '#a6cde4' },
    { cx: 0.82, cy: 0.58, rx: 0.05, ry: 0.07, fill: '#9ec4e0' },
  ];

  for (const blob of blobs) {
    ctx.fillStyle = blob.fill;
    ctx.beginPath();
    ctx.ellipse(blob.cx * width, blob.cy * height, blob.rx * width, blob.ry * height, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Polar caps — light cool bands top and bottom.
  const polar = ctx.createLinearGradient(0, 0, 0, height);
  polar.addColorStop(0, 'rgba(235, 240, 248, 0.85)');
  polar.addColorStop(0.08, 'rgba(235, 240, 248, 0)');
  polar.addColorStop(0.92, 'rgba(235, 240, 248, 0)');
  polar.addColorStop(1, 'rgba(235, 240, 248, 0.85)');
  ctx.fillStyle = polar;
  ctx.fillRect(0, 0, width, height);

  return canvas;
}

export function createEarthMoonScene(canvas: HTMLCanvasElement): EarthMoonSceneHandle {
  if (!(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))) {
    return null;
  }

  const { width, height } = getCanvasSize(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1b1b32);

  const camera = new THREE.PerspectiveCamera(CAMERA_FOV_DEG, width / height, 0.1, 200);

  // Pick a camera distance + lookAt that fits the scene for the
  // canvas size.
  //
  // Above IMMERSIVE_MIN_WIDTH the chapter is in its immersive
  // desktop layout (full-viewport sticky scene with a step card
  // overlaid on the right). The camera stays at its authored
  // distance; lookAt shifts right as the viewport widens so the
  // Moon's rightmost orbit position stays clear of the card, and
  // the Sun is allowed to run off the left edge (its halo carries
  // the composition).
  //
  // Below that threshold the chapter falls back to a sticky-sidebar
  // layout and the camera pulls back to fit the whole Sun–Earth–Moon
  // composition with margin.
  let currentSunX = SUN_X;

  const fitCamera = (w: number, h: number) => {
    const aspect = w / h;
    const fov = (CAMERA_FOV_DEG * Math.PI) / 180;

    if (w >= IMMERSIVE_MIN_WIDTH) {
      const frame = getImmersiveDesktopFrame(w);
      const distance = CAMERA_DISTANCE_DESKTOP;
      const halfViewWidth = distance * Math.tan(fov / 2) * aspect;
      currentSunX = frame?.sunX ?? SUN_X;
      // Target Moon pixel offset from viewport center = left of the card.
      // Smaller wide-screen offsets keep the moon-earth system farther left,
      // so 1920px and 4K layouts preserve the intended cropped-sun framing.
      const moonOffsetPx = frame?.moonOffsetPx ?? w / 2 - CARD_OCCLUDED_PX;
      const moonOffsetWorld = (moonOffsetPx / (w / 2)) * halfViewWidth;
      const lookAtX = MOON_ORBIT - moonOffsetWorld;
      // Keep the vertical camera angle the same across distances.
      camera.position.set(0, (2.5 * distance) / 10, distance);
      camera.lookAt(lookAtX, 0, 0);
      return;
    }

    // Mobile (sticky-sidebar) layout: mirror the desktop effect —
    // Earth and Moon prominent, Sun partially cut off on the left so
    // only the right edge of the disc and its halo read as the light
    // source. Distance matches the desktop camera so the elements
    // render at the same size across layouts.
    currentSunX = SUN_X;
    const distance = CAMERA_DISTANCE_DESKTOP;
    const halfViewWidth = distance * Math.tan(fov / 2) * aspect;
    // Target: Sun's right edge ~half a radius left of the view
    // centerline, so roughly a quarter of the disc is visible.
    let lookAtX = currentSunX + 0.5 * SUN_RADIUS + halfViewWidth;
    // Guard: on very narrow aspects the formula above would push the
    // Moon off the right edge. Clamp so Moon + radius stays inside
    // the view with a small margin.
    const minLookAtX = MOON_ORBIT + MOON_RADIUS - halfViewWidth + 0.3;
    lookAtX = Math.max(lookAtX, minLookAtX);
    camera.position.set(0, (2.5 * distance) / 10, distance);
    camera.lookAt(lookAtX, 0, 0);
  };

  fitCamera(width, height);

  const sunPosition = new THREE.Vector3(currentSunX, 0, 0);

  // ── Lighting ──────────────────────────────────────────────────────
  const ambientLight = new THREE.AmbientLight(0x445577, 0.25);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xfff2cc, 2.6);
  sunLight.position.copy(sunPosition);
  sunLight.target.position.set(0, 0, 0);
  scene.add(sunLight);
  scene.add(sunLight.target);

  // ── Sun ───────────────────────────────────────────────────────────
  const sunGeometry = new THREE.SphereGeometry(SUN_RADIUS, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffe8a8 });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  sun.position.copy(sunPosition);
  scene.add(sun);

  const halo = makeSunHalo(sunPosition, SUN_HALO_SCALE);
  scene.add(halo.sprite);

  // ── Earth ─────────────────────────────────────────────────────────
  // precessionGroup (Y rotation — where the tilt points)
  //   tiltGroup       (Z rotation — how far tilted)
  //     earth         (spins on local Y)
  //     tiltIndicator (amber spindle along tilt axis)
  const precessionGroup = new THREE.Group();
  scene.add(precessionGroup);

  const tiltGroup = new THREE.Group();
  tiltGroup.rotation.z = THREE.MathUtils.degToRad(DEFAULT_TILT_DEG);
  precessionGroup.add(tiltGroup);

  const earthTexture = new THREE.CanvasTexture(createEarthCanvas());
  earthTexture.colorSpace = THREE.SRGBColorSpace;
  earthTexture.wrapS = THREE.RepeatWrapping;
  earthTexture.wrapT = THREE.ClampToEdgeWrapping;
  earthTexture.anisotropy = 4;

  const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 48, 48);
  const earthMaterial = new THREE.MeshStandardMaterial({
    map: earthTexture,
    emissive: 0x0a1422,
    roughness: 0.85,
    metalness: 0.05,
  });
  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  tiltGroup.add(earth);

  const tiltGeometry = new THREE.CylinderGeometry(0.015, 0.015, 1.8, 8);
  const tiltMaterial = new THREE.MeshBasicMaterial({ color: 0xf1be32 });
  const tiltIndicator = new THREE.Mesh(tiltGeometry, tiltMaterial);
  tiltGroup.add(tiltIndicator);

  // ── Moon ──────────────────────────────────────────────────────────
  // The moon material is mutated per-step in the animation loop:
  //   • default / full moon / solar eclipse → bright silver, lit naturally
  //     by the directional sunlight (giving free phases as the moon orbits).
  //   • lunar eclipse → dim coppery base + faint red emissive, so the
  //     unlit far side stays visible against the dark background and the
  //     near side reads as warm-but-dim instead of bright silver.
  const MOON_DEFAULT_COLOR = new THREE.Color(0xd6cfc4);
  const MOON_DEFAULT_EMISSIVE = new THREE.Color(0x000000);
  // Coppery orange-red around Danjon L=2.5–3 (typical photographed blood
  // moon). The previous 0x3a1208 was Danjon L=1 territory — physically
  // possible but dark enough to read as Bordeaux against the scene's blue
  // background. Emissive stays dim so it lifts the unlit disc above the
  // background without dominating the shaded gradient.
  const MOON_BLOOD_COLOR = new THREE.Color(0x8a3e1c);
  const MOON_BLOOD_EMISSIVE = new THREE.Color(0x1c0a05);

  const moonGeometry = new THREE.SphereGeometry(MOON_RADIUS, 32, 32);
  const moonMaterial = new THREE.MeshStandardMaterial({
    color: MOON_DEFAULT_COLOR.clone(),
    emissive: MOON_DEFAULT_EMISSIVE.clone(),
    roughness: 0.9,
    metalness: 0,
  });
  const moon = new THREE.Mesh(moonGeometry, moonMaterial);
  moon.position.set(MOON_ORBIT, 0, 0);
  scene.add(moon);

  // ── Orbit ring ────────────────────────────────────────────────────
  const orbitTilt = THREE.MathUtils.degToRad(ORBIT_TILT_DEG);
  const orbitRing = makeOrbitRing(MOON_ORBIT, 0x6f98a8);
  orbitRing.line.rotation.z = orbitTilt;
  scene.add(orbitRing.line);

  // ── Umbra cone (solar eclipse visual) ─────────────────────────────
  // Hand-drawn shadow cone from moon toward earth, shown only during the
  // solar-eclipse step. With no shadow-mapping there's no automatic shadow
  // to render, so this stand-in conveys "moon's shadow falls on earth."
  const UMBRA_HEIGHT = 2.0;
  const umbraGeometry = new THREE.ConeGeometry(0.35, UMBRA_HEIGHT, 24, 1, true);
  const umbraMaterial = new THREE.MeshBasicMaterial({
    color: 0x050812,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const umbra = new THREE.Mesh(umbraGeometry, umbraMaterial);
  umbra.visible = false;
  scene.add(umbra);

  // ── State ─────────────────────────────────────────────────────────
  // Start moon at +z (closer to camera, clearly off the sun-earth axis).
  // With the new counterclockwise convention, position is
  //   (cos a · R · cos tilt, cos a · R · sin tilt, -sin a · R)
  // so a = -π/2 puts the moon at world (0, 0, +R).
  let moonAngle = -Math.PI / 2;
  let showEclipse = false;
  let showFullMoon = false;
  let showLunarEclipse = false;
  let withMoon = true;
  let wobblePhase = 0;
  // Smoothly interpolated precession/tilt so transitions between
  // stable (with moon) and wobbling (without moon) aren't jarring.
  let currentPrecession = 0;
  let currentTilt = THREE.MathUtils.degToRad(DEFAULT_TILT_DEG);

  const resizeObserver = new ResizeObserver(() => {
    const nextSize = getCanvasSize(canvas);
    renderer.setSize(nextSize.width, nextSize.height);
    camera.aspect = nextSize.width / nextSize.height;
    camera.updateProjectionMatrix();
    fitCamera(nextSize.width, nextSize.height);
    sunPosition.set(currentSunX, 0, 0);
    sun.position.copy(sunPosition);
    halo.sprite.position.copy(sunPosition);
    sunLight.position.copy(sunPosition);
  });
  resizeObserver.observe(canvas.parentElement ?? canvas);

  const clock = new THREE.Clock();

  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.1);

    // Earth spin (local Y of tiltGroup).
    earth.rotation.y += 0.25 * dt;

    // ── Earth wobble ────────────────────────────────────────────────
    // With moon: tilt locked at 23.5°, precession at 0.
    // Without moon: tilt wanders 8°–38°, precession sweeps around.
    let targetPrecession: number;
    let targetTilt: number;
    if (withMoon) {
      targetPrecession = 0;
      targetTilt = THREE.MathUtils.degToRad(DEFAULT_TILT_DEG);
    } else {
      wobblePhase += dt;
      targetPrecession = wobblePhase * 0.25;
      const tiltDeg = DEFAULT_TILT_DEG + Math.sin(wobblePhase * 0.45) * 9;
      targetTilt = THREE.MathUtils.degToRad(tiltDeg);
    }
    // Ease toward targets. Even in wobble mode the targets themselves
    // are changing every frame, so this ease just smooths the handoff
    // at step transitions rather than lagging the animation.
    const ease = 1 - Math.exp(-dt * 4);
    currentPrecession += (targetPrecession - currentPrecession) * ease;
    currentTilt += (targetTilt - currentTilt) * ease;
    precessionGroup.rotation.y = currentPrecession;
    tiltGroup.rotation.z = currentTilt;

    // ── Moon position ───────────────────────────────────────────────
    // Orbit is tilted by orbitTilt around the Z axis. The alignment steps
    // snap the moon onto the ring's ±X points (which sit slightly off the
    // ecliptic by R · sin(tilt)); the orbiting steps animate counterclockwise
    // as seen from above earth's north pole.
    if (withMoon) {
      if (showEclipse) {
        moon.position.set(-MOON_ORBIT * Math.cos(orbitTilt), -MOON_ORBIT * Math.sin(orbitTilt), 0);
        // Cone apex sits at the moon, base UMBRA_HEIGHT toward earth along
        // the moon→earth direction (cos t, sin t). Center is the midpoint.
        const dirX = Math.cos(orbitTilt);
        const dirY = Math.sin(orbitTilt);
        umbra.position.set((UMBRA_HEIGHT / 2 - MOON_ORBIT) * dirX, (UMBRA_HEIGHT / 2 - MOON_ORBIT) * dirY, 0);
        // Default cone axis is +Y; rotating around Z by π/2 + tilt aligns
        // the apex with the moon and the base with the earthward end.
        umbra.rotation.set(0, 0, Math.PI / 2 + orbitTilt);
        umbra.visible = true;
      } else if (showFullMoon || showLunarEclipse) {
        moon.position.set(MOON_ORBIT * Math.cos(orbitTilt), MOON_ORBIT * Math.sin(orbitTilt), 0);
        umbra.visible = false;
      } else {
        moonAngle += 0.09 * dt;
        moon.position.set(Math.cos(moonAngle) * MOON_ORBIT * Math.cos(orbitTilt), Math.cos(moonAngle) * MOON_ORBIT * Math.sin(orbitTilt), -Math.sin(moonAngle) * MOON_ORBIT);
        umbra.visible = false;
      }
    }

    // ── Moon appearance ─────────────────────────────────────────────
    // Lunar eclipse is the only case that needs a material override —
    // there's no shadow-mapping, so without this the moon would still look
    // bright silver at the eclipse position. Dim coppery base + faint red
    // emissive reads as a "blood moon" against the dark background while
    // keeping the silhouette solid (the original bright emissive made it
    // look translucent).
    if (showLunarEclipse) {
      moonMaterial.color.copy(MOON_BLOOD_COLOR);
      moonMaterial.emissive.copy(MOON_BLOOD_EMISSIVE);
    } else {
      moonMaterial.color.copy(MOON_DEFAULT_COLOR);
      moonMaterial.emissive.copy(MOON_DEFAULT_EMISSIVE);
    }

    renderer.render(scene, camera);
  });

  return {
    setWithMoon(value: boolean) {
      withMoon = value;
      moon.visible = value;
      orbitRing.line.visible = value;
      if (!value) umbra.visible = false;
      if (value) wobblePhase = 0;
    },
    setShowEclipse(value: boolean) {
      showEclipse = value;
      if (value) {
        showFullMoon = false;
        showLunarEclipse = false;
      }
      if (!value) umbra.visible = false;
    },
    setShowFullMoon(value: boolean) {
      showFullMoon = value;
      if (value) {
        showEclipse = false;
        showLunarEclipse = false;
      }
    },
    setShowLunarEclipse(value: boolean) {
      showLunarEclipse = value;
      if (value) {
        showEclipse = false;
        showFullMoon = false;
      }
    },
    dispose() {
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      sunGeometry.dispose();
      earthGeometry.dispose();
      earthTexture.dispose();
      moonGeometry.dispose();
      tiltGeometry.dispose();
      umbraGeometry.dispose();
      sunMaterial.dispose();
      earthMaterial.dispose();
      moonMaterial.dispose();
      tiltMaterial.dispose();
      umbraMaterial.dispose();
      orbitRing.geometry.dispose();
      orbitRing.material.dispose();
      halo.material.dispose();
      halo.texture.dispose();
      renderer.dispose();
    },
  };
}
