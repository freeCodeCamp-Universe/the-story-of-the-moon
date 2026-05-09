import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';

import { createMoonScene } from '@/three/moonScene';

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

globalThis.ResizeObserver = vi.fn(function ResizeObserver() {
  return {
    observe: vi.fn(),
    disconnect: vi.fn(),
  };
}) as unknown as typeof ResizeObserver;

function makeMockCanvas(webglAvailable = true) {
  return {
    getContext: vi.fn().mockReturnValue(webglAvailable ? {} : null),
    clientWidth: 800,
    clientHeight: 600,
    parentElement: { addEventListener: vi.fn() },
  } as unknown as HTMLCanvasElement;
}

describe('createMoonScene', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('returns a non-null handle when WebGL is available', () => {
    const canvas = makeMockCanvas(true);

    const handle = createMoonScene(canvas);

    expect(handle).not.toBeNull();
  });

  it('creates moon geometry with expected segments', () => {
    const canvas = makeMockCanvas(true);

    createMoonScene(canvas);

    expect(THREE.SphereGeometry as unknown as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      1,
      64,
      64
    );
  });

  it('loads the 2k moon texture', () => {
    const canvas = makeMockCanvas(true);

    createMoonScene(canvas);

    const textureLoaderCtor = THREE.TextureLoader as unknown as ReturnType<typeof vi.fn>;
    expect(textureLoaderCtor).toHaveBeenCalled();

    const textureLoaderInstance = textureLoaderCtor.mock.results[0]?.value as {
      load: ReturnType<typeof vi.fn>;
    };
    expect(textureLoaderInstance.load).toHaveBeenCalledWith(
      '/moon/moon-2k.jpg',
      expect.any(Function)
    );
  });

  it('disposes renderer and geometry on dispose()', () => {
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

  it('returns null when WebGL is unavailable', () => {
    const canvas = makeMockCanvas(false);

    const handle = createMoonScene(canvas);

    expect(handle).toBeNull();
  });
});
