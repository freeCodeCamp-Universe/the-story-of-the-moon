import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export type FeatureProjection = {
  /** Pixel x relative to the canvas's top-left corner (CSS px). */
  x: number;
  /** Pixel y relative to the canvas's top-left corner (CSS px). */
  y: number;
  /** Apparent radius of the feature in CSS px, accounting for perspective. */
  radius: number;
  /** False when the feature is on the back side of the sphere from the camera. */
  visible: boolean;
};

export type MoonSceneHandle = {
  setOverlay: (overlayId: string | null) => void;
  setCameraTarget: (target: { lat: number; lon: number }) => void;
  setView: (view: string) => void;
  /** Toggle user camera control (drag-to-rotate). */
  setControlsEnabled: (enabled: boolean) => void;
  /**
   * Rotate the camera around the Moon by the given deltas (radians).
   * Cancels any in-flight tween so the rotation is responsive to the
   * caller (e.g. an arrow-key handler).
   */
  rotateBy: (delta: { deltaAzimuth?: number; deltaPolar?: number }) => void;
  /**
   * Project a feature at (lat, lon) with a given km diameter into
   * canvas pixel space, using the current camera.
   * Returns null when the scene isn't ready yet.
   */
  projectFeature: (lat: number, lon: number, diameterKm: number) => FeatureProjection | null;
  dispose: () => void;
} | null;

export type MoonSceneOptions = {
  enableOrbitControls?: boolean;
  autoRotate?: boolean;
  initialTarget?: { lat: number; lon: number };
  /** Render the Moon with an unlit material, so the baked color-shaded
   * texture is shown as imaged with no additional sun-direction shading.
   * Use for teaching scenes where features on every side should remain
   * legible (e.g. surface-feature tour). Default false keeps the
   * lit-vs-unlit hemisphere split that drives shadow-based stories
   * (e.g. south-pole permanent shadows). */
  unlit?: boolean;
};

const CAMERA_RADIUS_BASE = 2.5;
const CAMERA_FOV_DEG = 45;
// Sphere (radius 1) plus a little breathing room. Used to pick the
// camera distance that keeps the whole disc inside the canvas on the
// narrower of the two axes.
const FIT_RADIUS = 1.15;

function getCanvasSize(canvas: HTMLCanvasElement) {
  return {
    width: Math.max(canvas.clientWidth, 1),
    height: Math.max(canvas.clientHeight, 1),
  };
}

// Distance at which the sphere just fits both axes of a canvas with
// the given aspect. On narrow (portrait) canvases this grows so the
// Moon doesn't clip horizontally.
function fitCameraRadius(aspect: number): number {
  const halfFov = (CAMERA_FOV_DEG * Math.PI) / 180 / 2;
  const byHeight = FIT_RADIUS / Math.tan(halfFov);
  const byWidth = FIT_RADIUS / (Math.tan(halfFov) * aspect);
  return Math.max(CAMERA_RADIUS_BASE, byHeight, byWidth);
}

function slerpOnSphere(out: THREE.Vector3, from: THREE.Vector3, to: THREE.Vector3, t: number) {
  const a = from.length();
  const b = to.length();
  if (a === 0 || b === 0) {
    out.lerpVectors(from, to, t);
    return;
  }
  const cos = Math.min(1, Math.max(-1, from.dot(to) / (a * b)));
  const omega = Math.acos(cos);
  if (omega < 1e-4) {
    out.lerpVectors(from, to, t);
    return;
  }
  const sin = Math.sin(omega);
  const wa = Math.sin((1 - t) * omega) / sin;
  const wb = Math.sin(t * omega) / sin;
  out.copy(from).multiplyScalar(wa).addScaledVector(to, wb);
}

function latLonToCameraPosition(lat: number, lon: number, radius: number) {
  const phi = ((90 - lat) * Math.PI) / 180;
  // Longitude is negated to match the moon texture (NASA SVS 4720 CGI
  // Moon Kit): its equirectangular image centers on lon 0° and grows
  // east to the right, while three.js SphereGeometry's default UVs put
  // u=0.75 at the 3D point (0, 0, -1). So east +90° must land at -Z.
  const theta = (-lon * Math.PI) / 180;

  return {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
}

export function createMoonScene(
  canvas: HTMLCanvasElement,
  options?: MoonSceneOptions
): MoonSceneHandle {
  if (!(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))) {
    return null;
  }

  const { width, height } = getCanvasSize(canvas);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1b1b32);

  let cameraRadius = fitCameraRadius(width / height);

  const camera = new THREE.PerspectiveCamera(CAMERA_FOV_DEG, width / height, 0.1, 100);
  camera.position.set(0, 0, cameraRadius);
  camera.lookAt(0, 0, 0);

  let texture2k: THREE.Texture | null = null;
  let texture8k: THREE.Texture | null = null;
  let disposed = false;

  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const material = options?.unlit
    ? new THREE.MeshBasicMaterial({ map: texture2k })
    : new THREE.MeshStandardMaterial({ map: texture2k });
  const moon = new THREE.Mesh(geometry, material);
  moon.position.set(0, 0, 0);
  scene.add(moon);

  if (!options?.unlit) {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.4);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
  }

  const textureLoader = new THREE.TextureLoader();

  const loadTexture = (primarySrc: string, fallbackSrc: string, onLoad: (texture: THREE.Texture) => void) => {
    const handleLoad = (loadedTexture: THREE.Texture) => {
      if (disposed) {
        loadedTexture.dispose();
        return;
      }
      onLoad(loadedTexture);
    };

    textureLoader.load(primarySrc, handleLoad, undefined, () => {
      if (primarySrc === fallbackSrc || disposed) {
        return;
      }
      textureLoader.load(fallbackSrc, handleLoad);
    });
  };

  loadTexture('/moon/moon-2k.webp', '/moon/moon-2k.jpg', (loadedTexture) => {
    loadedTexture.colorSpace = THREE.SRGBColorSpace;
    texture2k = loadedTexture;
    material.map = loadedTexture;
    material.needsUpdate = true;

    if (window.matchMedia('(min-width: 1200px) and (min-resolution: 2dppx)').matches) {
      loadTexture('/moon/moon-8k.webp', '/moon/moon-8k.jpg', (hiResTexture) => {
        hiResTexture.colorSpace = THREE.SRGBColorSpace;
        texture8k = hiResTexture;
        material.map = hiResTexture;
        material.needsUpdate = true;
      });
    }
  });

  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = options?.autoRotate ?? true;
  controls.autoRotateSpeed = 0.3;
  controls.enabled = options?.enableOrbitControls ?? true;

  // Tween source/target for smooth camera moves between steps
  const tweenFrom = new THREE.Vector3().copy(camera.position);
  const tweenTo = new THREE.Vector3().copy(camera.position);
  let tweenStart = 0;
  let tweenDuration = 0;

  let tweenTargetLat = options?.initialTarget?.lat ?? 0;
  let tweenTargetLon = options?.initialTarget?.lon ?? 0;

  const setCameraTarget = (target: { lat: number; lon: number }) => {
    tweenTargetLat = target.lat;
    tweenTargetLon = target.lon;
    const { x, y, z } = latLonToCameraPosition(target.lat, target.lon, cameraRadius);
    tweenFrom.copy(camera.position);
    tweenTo.set(x, y, z);
    tweenStart = performance.now();
    tweenDuration = 900;
  };

  if (options?.initialTarget) {
    setCameraTarget(options.initialTarget);
  }

  scene.userData.overlayId = null as string | null;
  scene.userData.view = 'default';

  const resizeObserver = new ResizeObserver(() => {
    const nextSize = getCanvasSize(canvas);
    renderer.setSize(nextSize.width, nextSize.height);
    const aspect = nextSize.width / nextSize.height;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    const nextRadius = fitCameraRadius(aspect);
    if (Math.abs(nextRadius - cameraRadius) > 0.001) {
      cameraRadius = nextRadius;
      // Rescale whatever camera move is currently in flight (or at
      // rest) to the new fit distance, keeping the same lat/lon.
      const { x, y, z } = latLonToCameraPosition(tweenTargetLat, tweenTargetLon, cameraRadius);
      tweenTo.set(x, y, z);
      // If not mid-tween, snap position; otherwise let the tween drive.
      if (tweenDuration === 0) {
        camera.position.copy(tweenTo);
        camera.lookAt(0, 0, 0);
      }
    }
  });
  resizeObserver.observe(canvas.parentElement ?? canvas);

  renderer.setAnimationLoop(() => {
    if (tweenDuration > 0) {
      const elapsed = performance.now() - tweenStart;
      const t = Math.min(elapsed / tweenDuration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      // Slerp along the sphere of radius cameraRadius instead of a
      // straight lerp. A straight line between two points on the
      // sphere cuts through the origin; for nearly-antipodal targets
      // (e.g. South Pole–Aitken from a nearside feature) that would
      // plunge the camera toward the Moon mid-tween and read as a
      // dramatic zoom-in.
      slerpOnSphere(camera.position, tweenFrom, tweenTo, eased);
      camera.lookAt(0, 0, 0);
      if (t >= 1) tweenDuration = 0;
    }
    controls.update();
    renderer.render(scene, camera);
  });

  // Reused vectors for projectFeature so we don't allocate per frame.
  const projCenter = new THREE.Vector3();
  const projEdge = new THREE.Vector3();
  const projAxis = new THREE.Vector3();
  const projTangent = new THREE.Vector3();
  const toCamera = new THREE.Vector3();
  const MOON_RADIUS_KM = 1737;

  return {
    setOverlay(overlayId: string | null) {
      scene.userData.overlayId = overlayId;
    },
    setCameraTarget,
    setView(view: string) {
      scene.userData.view = view;
    },
    setControlsEnabled(enabled: boolean) {
      controls.enabled = enabled;
    },
    rotateBy({ deltaAzimuth = 0, deltaPolar = 0 }) {
      // Cancel any in-flight camera tween so the keyboard rotation
      // takes effect immediately rather than fighting with the easing.
      tweenDuration = 0;
      const spherical = new THREE.Spherical().setFromVector3(camera.position);
      spherical.theta += deltaAzimuth;
      // Clamp polar angle away from the poles to avoid gimbal flip.
      const EPS = 0.05;
      spherical.phi = Math.max(EPS, Math.min(Math.PI - EPS, spherical.phi + deltaPolar));
      camera.position.setFromSpherical(spherical);
      camera.lookAt(0, 0, 0);
    },
    projectFeature(lat: number, lon: number, diameterKm: number): FeatureProjection | null {
      const phi = ((90 - lat) * Math.PI) / 180;
      // See latLonToCameraPosition for why longitude is negated.
      const theta = (-lon * Math.PI) / 180;

      // Unit vector from sphere center to the feature's surface point.
      projCenter.set(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
      );

      // Visible if the surface normal at the feature has a component
      // toward the camera (dot product > 0).
      toCamera.copy(camera.position).sub(projCenter).normalize();
      const visible = toCamera.dot(projCenter) > 0;

      // Pick a tangent direction perpendicular to the center vector,
      // then rotate around the axis perpendicular to both to get a
      // point on the sphere one feature-radius away along the surface.
      if (Math.abs(projCenter.y) < 0.98) {
        projTangent.set(-projCenter.z, 0, projCenter.x).normalize();
      } else {
        projTangent.set(1, 0, 0);
      }
      projAxis.crossVectors(projCenter, projTangent).normalize();
      const arcAngle = diameterKm / 2 / MOON_RADIUS_KM;
      projEdge.copy(projCenter).applyAxisAngle(projAxis, arcAngle);

      // Project center and edge through the camera to NDC.
      projCenter.project(camera);
      projEdge.project(camera);

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const cx = ((projCenter.x + 1) / 2) * w;
      const cy = ((1 - projCenter.y) / 2) * h;
      const ex = ((projEdge.x + 1) / 2) * w;
      const ey = ((1 - projEdge.y) / 2) * h;

      const radius = Math.hypot(ex - cx, ey - cy);
      return { x: cx, y: cy, radius, visible };
    },
    dispose() {
      disposed = true;
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      controls.dispose();
      geometry.dispose();
      material.dispose();
      texture2k?.dispose();
      texture8k?.dispose();
      renderer.dispose();
    },
  };
}
