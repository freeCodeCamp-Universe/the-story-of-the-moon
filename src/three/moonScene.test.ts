import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';

import { cameraPositionToLatLon, createMoonScene } from '@/three/moonScene';

vi.mock('three', () => {
  const MockTextureLoader = vi.fn(function MockTextureLoader() {
    return {
      load: vi.fn((_: string, onLoad: (t: unknown) => void) => {
        onLoad({ colorSpace: '', dispose: vi.fn() });
      }),
    };
  });
  const MockWebGLRenderer = vi.fn(function MockWebGLRenderer() {
    return {
      setPixelRatio: vi.fn(),
      setSize: vi.fn(),
      setAnimationLoop: vi.fn(),
      render: vi.fn(),
      dispose: vi.fn(),
      outputColorSpace: '',
    };
  });
  const MockSphereGeometry = vi.fn(function MockSphereGeometry() {
    return { dispose: vi.fn() };
  });
  const MockMeshStandardMaterial = vi.fn(function MockMeshStandardMaterial() {
    return {
      map: null,
      needsUpdate: false,
      dispose: vi.fn(),
    };
  });
  const MockMesh = vi.fn(function MockMesh() {
    return {
      position: { set: vi.fn() },
    };
  });
  const MockScene = vi.fn(function MockScene() {
    return {
      add: vi.fn(),
      background: null,
      userData: {},
    };
  });
  const MockPerspectiveCamera = vi.fn(function MockPerspectiveCamera() {
    return {
      position: { set: vi.fn(), x: 0, y: 0, z: 2.5 },
      aspect: 1,
      updateProjectionMatrix: vi.fn(),
      lookAt: vi.fn(),
    };
  });
  const MockAmbientLight = vi.fn(function MockAmbientLight() {
    return {};
  });
  const MockDirectionalLight = vi.fn(function MockDirectionalLight() {
    return { position: { set: vi.fn() } };
  });
  const MockColor = vi.fn(function MockColor() {
    return {};
  });
  const MockVector3 = vi.fn(function MockVector3() {
    return {
      x: 0,
      y: 0,
      z: 0,
      copy: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      lerpVectors: vi.fn().mockReturnThis(),
    };
  });
  return {
    WebGLRenderer: MockWebGLRenderer,
    SphereGeometry: MockSphereGeometry,
    MeshStandardMaterial: MockMeshStandardMaterial,
    Mesh: MockMesh,
    Scene: MockScene,
    PerspectiveCamera: MockPerspectiveCamera,
    AmbientLight: MockAmbientLight,
    DirectionalLight: MockDirectionalLight,
    TextureLoader: MockTextureLoader,
    Color: MockColor,
    Vector3: MockVector3,
    SRGBColorSpace: 'srgb',
  };
});

vi.mock('three/addons/controls/OrbitControls.js', () => ({
  OrbitControls: vi.fn(function OrbitControls() {
    return {
      enablePan: true,
      enableZoom: true,
      enableDamping: true,
      dampingFactor: 0,
      autoRotate: false,
      autoRotateSpeed: 0,
      update: vi.fn(),
      dispose: vi.fn(),
      enabled: true,
    };
  }),
}));

let lastResizeCallback: ResizeObserverCallback | null = null;
let lastObserved: Element | null = null;

globalThis.ResizeObserver = vi.fn(function ResizeObserver(callback: ResizeObserverCallback) {
  lastResizeCallback = callback;
  return {
    observe: vi.fn((target: Element) => {
      lastObserved = target;
    }),
    disconnect: vi.fn(),
  };
}) as unknown as typeof ResizeObserver;

// The canvas fills its parent via CSS, so getCanvasSize measures the parent.
// The mock parent carries the dimensions; the canvas mirrors them.
function makeMockCanvas(webglAvailable = true) {
  const parentElement = { addEventListener: vi.fn(), clientWidth: 800, clientHeight: 600 };
  return {
    getContext: vi.fn().mockReturnValue(webglAvailable ? {} : null),
    clientWidth: 800,
    clientHeight: 600,
    parentElement,
  } as unknown as HTMLCanvasElement;
}

describe('createMoonScene', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastResizeCallback = null;
    lastObserved = null;
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })
    );
  });

  it('should return a non-null handle when WebGL is available', () => {
    const canvas = makeMockCanvas(true);

    const handle = createMoonScene(canvas);

    expect(handle).not.toBeNull();
  });

  it('should create moon geometry with expected segments', () => {
    const canvas = makeMockCanvas(true);

    createMoonScene(canvas);

    expect(THREE.SphereGeometry as unknown as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(1, 64, 64);
  });

  it('should load the 2k moon texture', () => {
    const canvas = makeMockCanvas(true);

    createMoonScene(canvas);

    const textureLoaderCtor = THREE.TextureLoader as unknown as ReturnType<typeof vi.fn>;
    expect(textureLoaderCtor).toHaveBeenCalled();

    const textureLoaderInstance = textureLoaderCtor.mock.results[0]?.value as {
      load: ReturnType<typeof vi.fn>;
    };
    expect(textureLoaderInstance.load).toHaveBeenCalledWith('/moon/moon-2k.avif', expect.any(Function), undefined, expect.any(Function));
  });

  it('should dispose renderer and geometry on dispose()', () => {
    const canvas = makeMockCanvas(true);
    const handle = createMoonScene(canvas);

    expect(handle).not.toBeNull();
    handle?.dispose();

    const rendererCtor = THREE.WebGLRenderer as unknown as ReturnType<typeof vi.fn>;
    const geometryCtor = THREE.SphereGeometry as unknown as ReturnType<typeof vi.fn>;
    const rendererInstance = rendererCtor.mock.results[0]?.value as {
      dispose: ReturnType<typeof vi.fn>;
    };
    const geometryInstance = geometryCtor.mock.results[0]?.value as {
      dispose: ReturnType<typeof vi.fn>;
    };

    expect(rendererInstance.dispose).toHaveBeenCalledTimes(1);
    expect(geometryInstance.dispose).toHaveBeenCalledTimes(1);
  });

  it('should pause and resume the animation loop', () => {
    const canvas = makeMockCanvas(true);
    const handle = createMoonScene(canvas);

    expect(handle).not.toBeNull();

    const rendererCtor = THREE.WebGLRenderer as unknown as ReturnType<typeof vi.fn>;
    const rendererInstance = rendererCtor.mock.results[0]?.value as {
      setAnimationLoop: ReturnType<typeof vi.fn>;
    };

    handle?.pause();
    handle?.resume();

    expect(rendererInstance.setAnimationLoop).toHaveBeenNthCalledWith(1, expect.any(Function));
    expect(rendererInstance.setAnimationLoop).toHaveBeenNthCalledWith(2, null);
    expect(rendererInstance.setAnimationLoop).toHaveBeenNthCalledWith(3, expect.any(Function));
  });

  it('should return null when WebGL is unavailable', () => {
    const canvas = makeMockCanvas(false);

    const handle = createMoonScene(canvas);

    expect(handle).toBeNull();
  });

  it('should round-trip camera lat/lon back from a camera position', () => {
    const radius = 2.5;
    const latLon = cameraPositionToLatLon({
      x: radius * 0.6123724357,
      y: radius * 0.5,
      z: radius * 0.6123724357,
    });

    expect(latLon.lat).toBeCloseTo(30, 6);
    expect(latLon.lon).toBeCloseTo(-45, 6);
  });

  it('should normalize a -180 longitude result to 180', () => {
    const latLon = cameraPositionToLatLon({ x: -2.5, y: 0, z: 0 });

    expect(latLon.lat).toBeCloseTo(0, 6);
    expect(latLon.lon).toBe(180);
  });

  it('should size the renderer without writing inline canvas styles', () => {
    const canvas = makeMockCanvas(true);

    createMoonScene(canvas);

    const rendererCtor = THREE.WebGLRenderer as unknown as ReturnType<typeof vi.fn>;
    const rendererInstance = rendererCtor.mock.results[0]?.value as {
      setSize: ReturnType<typeof vi.fn>;
    };

    // updateStyle=false keeps CSS in charge of the display size; passing the
    // default (true) would pin clientWidth and break adaptive resizing.
    expect(rendererInstance.setSize).toHaveBeenCalledWith(800, 600, false);
  });

  it('should observe the canvas parent so resize tracks the laid-out box', () => {
    const canvas = makeMockCanvas(true);

    createMoonScene(canvas);

    expect(lastObserved).toBe(canvas.parentElement);
  });

  it('should re-size the renderer and camera when the parent box changes', () => {
    const canvas = makeMockCanvas(true);

    createMoonScene(canvas);

    const rendererCtor = THREE.WebGLRenderer as unknown as ReturnType<typeof vi.fn>;
    const cameraCtor = THREE.PerspectiveCamera as unknown as ReturnType<typeof vi.fn>;
    const rendererInstance = rendererCtor.mock.results[0]?.value as {
      setSize: ReturnType<typeof vi.fn>;
    };
    const cameraInstance = cameraCtor.mock.results[0]?.value as {
      aspect: number;
      updateProjectionMatrix: ReturnType<typeof vi.fn>;
    };

    rendererInstance.setSize.mockClear();
    cameraInstance.updateProjectionMatrix.mockClear();

    // Simulate the viewport growing wider (e.g. portrait -> landscape).
    const parent = canvas.parentElement as unknown as { clientWidth: number; clientHeight: number };
    parent.clientWidth = 1200;
    parent.clientHeight = 600;

    expect(lastResizeCallback).not.toBeNull();
    lastResizeCallback?.([], {} as ResizeObserver);

    expect(rendererInstance.setSize).toHaveBeenCalledWith(1200, 600, false);
    expect(cameraInstance.aspect).toBe(2);
    expect(cameraInstance.updateProjectionMatrix).toHaveBeenCalledTimes(1);
  });

  it('should ignore sub-pixel resize jitter so the moon does not visibly resize', () => {
    const canvas = makeMockCanvas(true);

    createMoonScene(canvas);

    const rendererCtor = THREE.WebGLRenderer as unknown as ReturnType<typeof vi.fn>;
    const cameraCtor = THREE.PerspectiveCamera as unknown as ReturnType<typeof vi.fn>;
    const rendererInstance = rendererCtor.mock.results[0]?.value as {
      setSize: ReturnType<typeof vi.fn>;
    };
    const cameraInstance = cameraCtor.mock.results[0]?.value as {
      aspect: number;
      updateProjectionMatrix: ReturnType<typeof vi.fn>;
    };

    rendererInstance.setSize.mockClear();
    cameraInstance.updateProjectionMatrix.mockClear();
    const aspectBefore = cameraInstance.aspect;

    // Simulate fractional-pixel jitter (e.g. mobile URL-bar animation
    // or pinch-zoom): both deltas under 1 CSS px.
    const parent = canvas.parentElement as unknown as { clientWidth: number; clientHeight: number };
    parent.clientWidth = 800.4;
    parent.clientHeight = 600.3;

    expect(lastResizeCallback).not.toBeNull();
    lastResizeCallback?.([], {} as ResizeObserver);

    expect(rendererInstance.setSize).not.toHaveBeenCalled();
    expect(cameraInstance.updateProjectionMatrix).not.toHaveBeenCalled();
    expect(cameraInstance.aspect).toBe(aspectBefore);
  });

  it('should still apply a resize once the cumulative change crosses one pixel', () => {
    const canvas = makeMockCanvas(true);

    createMoonScene(canvas);

    const rendererCtor = THREE.WebGLRenderer as unknown as ReturnType<typeof vi.fn>;
    const rendererInstance = rendererCtor.mock.results[0]?.value as {
      setSize: ReturnType<typeof vi.fn>;
    };

    rendererInstance.setSize.mockClear();

    const parent = canvas.parentElement as unknown as { clientWidth: number; clientHeight: number };

    // First tick: 0.4 px wider — below the dead-band, ignored.
    parent.clientWidth = 800.4;
    lastResizeCallback?.([], {} as ResizeObserver);
    expect(rendererInstance.setSize).not.toHaveBeenCalled();

    // Second tick: now 2 px wider than the last observed size (800),
    // crossing the threshold — resize must fire.
    parent.clientWidth = 802;
    lastResizeCallback?.([], {} as ResizeObserver);
    expect(rendererInstance.setSize).toHaveBeenCalledWith(802, 600, false);
  });
});
