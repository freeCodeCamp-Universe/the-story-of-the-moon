import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { BP_DESKTOP, BP_ULTRAWIDE, BP_WIDE } from '@/utils/breakpoints';

const threeState = vi.hoisted(() => ({
  renderers: [] as Array<{
    animationLoop: (() => void) | null;
    setPixelRatio: ReturnType<typeof vi.fn>;
    setSize: ReturnType<typeof vi.fn>;
    setAnimationLoop: ReturnType<typeof vi.fn>;
    render: ReturnType<typeof vi.fn>;
    dispose: ReturnType<typeof vi.fn>;
    outputColorSpace: string;
  }>,
  clocks: [] as Array<{
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    getDelta: ReturnType<typeof vi.fn>;
  }>,
}));

vi.mock('three', async () => {
  const actual = await vi.importActual<typeof import('three')>('three');

  class MockWebGLRenderer {
    animationLoop: (() => void) | null = null;
    outputColorSpace = '';
    setPixelRatio = vi.fn();
    setSize = vi.fn();
    setAnimationLoop = vi.fn((loop: (() => void) | null) => {
      this.animationLoop = loop;
    });
    render = vi.fn();
    dispose = vi.fn();

    constructor(_: unknown) {
      threeState.renderers.push(this);
    }
  }

  class MockClock {
    start = vi.fn();
    stop = vi.fn();
    getDelta = vi.fn(() => 0.25);

    constructor() {
      threeState.clocks.push(this);
    }
  }

  return {
    ...actual,
    WebGLRenderer: MockWebGLRenderer,
    Clock: MockClock,
  };
});

import { createEarthMoonScene } from '@/three/earthMoonScene';

type ResizeObserverInstance = {
  callback: ResizeObserverCallback;
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
};

const resizeObservers: ResizeObserverInstance[] = [];
let allow2dContext = true;

function create2dContext() {
  const gradient = { addColorStop: vi.fn() };

  return {
    createLinearGradient: vi.fn(() => gradient),
    createRadialGradient: vi.fn(() => gradient),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    ellipse: vi.fn(),
    fill: vi.fn(),
    fillStyle: '',
  };
}

function makeCanvas(webglAvailable = true, width = 800, height = 600) {
  const canvas = document.createElement('canvas');

  Object.defineProperty(canvas, 'clientWidth', {
    configurable: true,
    get: () => width,
  });
  Object.defineProperty(canvas, 'clientHeight', {
    configurable: true,
    get: () => height,
  });

  if (webglAvailable) {
    canvas.dataset.webgl = 'enabled';
  }

  const wrapper = document.createElement('div');
  wrapper.appendChild(canvas);

  return {
    canvas,
    setSize(nextWidth: number, nextHeight: number) {
      width = nextWidth;
      height = nextHeight;
    },
    wrapper,
  };
}

function getRenderer() {
  const renderer = threeState.renderers[threeState.renderers.length - 1];

  expect(renderer).toBeDefined();

  return renderer!;
}

function getClock() {
  const clock = threeState.clocks[threeState.clocks.length - 1];

  expect(clock).toBeDefined();

  return clock!;
}

function getRenderFrame(renderer = getRenderer()) {
  const renderFrame = renderer.animationLoop;

  expect(renderFrame).toEqual(expect.any(Function));

  return renderFrame!;
}

function getLatestSceneState(renderer = getRenderer()) {
  const scene = renderer.render.mock.lastCall?.[0] as THREE.Scene | undefined;
  const camera = renderer.render.mock.lastCall?.[1] as THREE.PerspectiveCamera | undefined;

  expect(scene).toBeDefined();
  expect(camera).toBeDefined();

  const systemGroup = scene!.children[0] as THREE.Group;
  const precessionGroup = systemGroup.children[0] as THREE.Group;
  const tiltGroup = precessionGroup.children[0] as THREE.Group;

  return {
    scene: scene!,
    camera: camera!,
    systemGroup,
    precessionGroup,
    tiltGroup,
    earth: tiltGroup.children[0] as THREE.Mesh,
    moon: systemGroup.children[1] as THREE.Mesh,
    orbitRing: systemGroup.children[2] as THREE.Line,
    umbra: systemGroup.children[3] as THREE.Mesh,
    sunLight: scene!.children[2] as THREE.DirectionalLight,
    sun: scene!.children[4] as THREE.Mesh,
    halo: scene!.children[5] as THREE.Sprite,
  };
}

describe('createEarthMoonScene', () => {
  beforeEach(() => {
    threeState.renderers.length = 0;
    threeState.clocks.length = 0;
    resizeObservers.length = 0;
    allow2dContext = true;
    vi.clearAllMocks();

    Object.defineProperty(window, 'devicePixelRatio', {
      configurable: true,
      value: 1,
    });

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function getContext(this: HTMLCanvasElement, type: string) {
      if (type === '2d') {
        if (!allow2dContext) {
          return null;
        }
        return create2dContext() as unknown as ReturnType<HTMLCanvasElement['getContext']>;
      }

      if (type === 'webgl2' || type === 'webgl') {
        return this.dataset.webgl === 'enabled'
          ? ({} as ReturnType<HTMLCanvasElement['getContext']>)
          : null;
      }

      return null;
    });

    vi.stubGlobal(
      'ResizeObserver',
      vi.fn(function ResizeObserver(callback: ResizeObserverCallback) {
        const instance = {
          callback,
          observe: vi.fn(),
          disconnect: vi.fn(),
        };
        resizeObservers.push(instance);
        return instance;
      }) as unknown as typeof ResizeObserver,
    );
  });

  it('should return a handle when WebGL is available', () => {
    const { canvas } = makeCanvas(true);

    const handle = createEarthMoonScene(canvas);

    expect(handle).not.toBeNull();
  });

  it('should return null when WebGL is unavailable', () => {
    const { canvas } = makeCanvas(false);

    const handle = createEarthMoonScene(canvas);

    expect(handle).toBeNull();
    expect(threeState.renderers).toHaveLength(0);
  });

  it('should keep pause and resume idempotent', () => {
    const { canvas } = makeCanvas(true);
    const handle = createEarthMoonScene(canvas);

    expect(handle).not.toBeNull();

    const renderer = getRenderer();

    handle?.resume();
    handle?.pause();
    handle?.pause();
    handle?.resume();
    handle?.resume();

    expect(renderer.setAnimationLoop).toHaveBeenNthCalledWith(1, expect.any(Function));
    expect(renderer.setAnimationLoop).toHaveBeenNthCalledWith(2, null);
    expect(renderer.setAnimationLoop).toHaveBeenNthCalledWith(3, expect.any(Function));
    expect(renderer.setAnimationLoop).toHaveBeenCalledTimes(3);
  });

  it('should rotate the earth and advance the default moon orbit over time', () => {
    const { canvas } = makeCanvas(true);
    const handle = createEarthMoonScene(canvas);
    const clock = getClock();
    const renderFrame = getRenderFrame();

    expect(handle).not.toBeNull();

    clock.getDelta.mockReturnValue(0.1);
    renderFrame();

    const { earth, moon, umbra } = getLatestSceneState();

    expect(earth.rotation.y).toBeGreaterThan(0);
    expect(moon.position.x).toBeGreaterThan(0);
    expect(moon.position.z).toBeGreaterThan(0);
    expect(moon.position.z).toBeLessThan(2.4);
    expect(umbra.visible).toBe(false);
  });

  it('should animate axial wobble without the moon and ease back toward baseline when restored', () => {
    const { canvas } = makeCanvas(true);
    const handle = createEarthMoonScene(canvas);
    const clock = getClock();
    const renderFrame = getRenderFrame();
    const baselineTilt = THREE.MathUtils.degToRad(23.5);

    expect(handle).not.toBeNull();

    clock.getDelta.mockReturnValue(0.1);
    renderFrame();

    handle?.setWithMoon(false);
    renderFrame();

    let { precessionGroup, tiltGroup, moon, orbitRing } = getLatestSceneState();
    const wobblePrecession = precessionGroup.rotation.y;
    const wobbleTilt = tiltGroup.rotation.z;

    expect(wobblePrecession).toBeGreaterThan(0);
    expect(wobbleTilt).toBeGreaterThan(baselineTilt);
    expect(moon.visible).toBe(false);
    expect(orbitRing.visible).toBe(false);

    handle?.setWithMoon(true);

    for (let i = 0; i < 10; i += 1) {
      renderFrame();
    }

    ({ precessionGroup, tiltGroup, moon, orbitRing } = getLatestSceneState());

    expect(precessionGroup.rotation.y).toBeLessThan(wobblePrecession);
    expect(Math.abs(tiltGroup.rotation.z - baselineTilt)).toBeLessThan(
      Math.abs(wobbleTilt - baselineTilt),
    );
    expect(moon.visible).toBe(true);
    expect(orbitRing.visible).toBe(true);
  });

  it('should switch eclipse and full-moon alignment states', () => {
    const { canvas } = makeCanvas(true);
    const handle = createEarthMoonScene(canvas);
    const renderFrame = getRenderFrame();

    expect(handle).not.toBeNull();

    handle?.setShowEclipse(true);
    renderFrame();

    let { moon, umbra } = getLatestSceneState();
    expect(moon.position.x).toBeLessThan(0);
    expect(moon.position.z).toBeCloseTo(0, 6);
    expect(umbra.visible).toBe(true);

    handle?.setShowEclipse(false);
    expect(getLatestSceneState().umbra.visible).toBe(false);

    handle?.setShowFullMoon(true);
    renderFrame();

    ({ moon, umbra } = getLatestSceneState());
    expect(moon.position.x).toBeGreaterThan(0);
    expect(moon.position.z).toBeCloseTo(0, 6);
    expect(umbra.visible).toBe(false);
  });

  it('should apply and clear the lunar-eclipse material override', () => {
    const { canvas } = makeCanvas(true);
    const handle = createEarthMoonScene(canvas);
    const renderFrame = getRenderFrame();

    expect(handle).not.toBeNull();

    handle?.setShowLunarEclipse(true);
    renderFrame();

    let { moon } = getLatestSceneState();
    let material = moon.material as THREE.MeshStandardMaterial;

    expect(material.color.getHex()).toBe(0x8a3e1c);
    expect(material.emissive.getHex()).toBe(0x1c0a05);

    handle?.setShowFullMoon(true);
    renderFrame();

    ({ moon } = getLatestSceneState());
    material = moon.material as THREE.MeshStandardMaterial;

    expect(material.color.getHex()).toBe(0xd6cfc4);
    expect(material.emissive.getHex()).toBe(0x000000);
  });

  it('should hide the moon system when the moon is disabled', () => {
    const { canvas } = makeCanvas(true);
    const handle = createEarthMoonScene(canvas);
    const renderFrame = getRenderFrame();

    expect(handle).not.toBeNull();

    handle?.setShowEclipse(true);
    renderFrame();
    handle?.setWithMoon(false);

    const { moon, orbitRing, umbra } = getLatestSceneState();

    expect(moon.visible).toBe(false);
    expect(orbitRing.visible).toBe(false);
    expect(umbra.visible).toBe(false);
  });

  it('should use the narrow mobile framing below desktop', () => {
    const { canvas } = makeCanvas(true, 800, 600);
    const handle = createEarthMoonScene(canvas);
    const clock = getClock();
    const renderFrame = getRenderFrame();

    expect(handle).not.toBeNull();

    clock.getDelta.mockReturnValue(0);
    renderFrame();

    const { camera, systemGroup, sun } = getLatestSceneState();

    expect(camera.position.x).toBeLessThan(0);
    expect(camera.position.z).toBeCloseTo(12, 6);
    expect(systemGroup.position.x).toBeCloseTo(0, 6);
    expect(sun.position.x).toBeCloseTo(-7, 6);
  });

  it('should shift the earth-moon system right on wide tablet layouts below desktop', () => {
    const { canvas } = makeCanvas(true, BP_DESKTOP - 50, 300);
    const handle = createEarthMoonScene(canvas);
    const clock = getClock();
    const renderFrame = getRenderFrame();

    expect(handle).not.toBeNull();

    clock.getDelta.mockReturnValue(0);
    renderFrame();

    const { camera, systemGroup, sun } = getLatestSceneState();

    expect(camera.position.x).toBeGreaterThan(0);
    expect(systemGroup.position.x).toBeGreaterThan(0);
    expect(sun.position.x).toBeCloseTo(-7, 6);
  });

  it('should keep desktop framing and update wide-screen sun offsets on resize', () => {
    const { canvas, setSize, wrapper } = makeCanvas(true, 1200, 600);
    const handle = createEarthMoonScene(canvas);
    const clock = getClock();
    const renderFrame = getRenderFrame();

    expect(handle).not.toBeNull();
    expect(resizeObservers[0].observe).toHaveBeenCalledWith(wrapper);

    clock.getDelta.mockReturnValue(0);
    renderFrame();

    let { camera, systemGroup, sun, halo, sunLight } = getLatestSceneState();

    expect(camera.position.x).toBeCloseTo(0, 6);
    expect(camera.position.y).toBeCloseTo(3, 6);
    expect(camera.position.z).toBeCloseTo(12, 6);
    expect(systemGroup.position.x).toBeCloseTo(0, 6);
    expect(sun.position.x).toBeCloseTo(-7, 6);
    expect(halo.position.x).toBeCloseTo(-7, 6);
    expect(sunLight.position.x).toBeCloseTo(-7, 6);

    setSize(BP_WIDE + 100, 600);
    resizeObservers[0].callback([], {} as ResizeObserver);
    renderFrame();

    ({ sun, halo, sunLight } = getLatestSceneState());

    expect(sun.position.x).toBeCloseTo(-8.75, 6);
    expect(halo.position.x).toBeCloseTo(-8.75, 6);
    expect(sunLight.position.x).toBeCloseTo(-8.75, 6);

    setSize(BP_ULTRAWIDE + 100, 600);
    resizeObservers[0].callback([], {} as ResizeObserver);
    renderFrame();

    ({ sun, halo, sunLight } = getLatestSceneState());

    expect(sun.position.x).toBeCloseTo(-9.7, 6);
    expect(halo.position.x).toBeCloseTo(-9.7, 6);
    expect(sunLight.position.x).toBeCloseTo(-9.7, 6);
  });

  it('should still create the scene when 2d canvas contexts are unavailable', () => {
    allow2dContext = false;

    const { canvas } = makeCanvas(true);
    const handle = createEarthMoonScene(canvas);
    const renderFrame = getRenderFrame();

    expect(handle).not.toBeNull();

    renderFrame();

    const renderer = getRenderer();
    expect(renderer.render).toHaveBeenCalledTimes(1);
  });

  it('should resize with the observed wrapper and dispose scene resources', () => {
    const { canvas, setSize, wrapper } = makeCanvas(true);
    const handle = createEarthMoonScene(canvas);

    expect(handle).not.toBeNull();
    expect(resizeObservers).toHaveLength(1);
    expect(resizeObservers[0].observe).toHaveBeenCalledWith(wrapper);

    setSize(1200, 500);
    resizeObservers[0].callback([], {} as ResizeObserver);

    const renderer = getRenderer();
    const renderFrame = getRenderFrame(renderer);
    renderFrame();

    const { camera, earth, moon, orbitRing, halo } = getLatestSceneState(renderer);
    const earthMap = (earth.material as THREE.MeshStandardMaterial).map as THREE.Texture;
    const haloTexture = (halo.material as THREE.SpriteMaterial).map as THREE.Texture;

    const earthGeometryDispose = vi.spyOn(earth.geometry, 'dispose');
    const moonGeometryDispose = vi.spyOn(moon.geometry, 'dispose');
    const orbitGeometryDispose = vi.spyOn(orbitRing.geometry, 'dispose');
    const orbitMaterialDispose = vi.spyOn(orbitRing.material as THREE.Material, 'dispose');
    const earthTextureDispose = vi.spyOn(earthMap, 'dispose');
    const haloTextureDispose = vi.spyOn(haloTexture, 'dispose');

    expect(renderer.setSize).toHaveBeenLastCalledWith(1200, 500);
    expect(camera.aspect).toBeCloseTo(1200 / 500, 6);

    handle?.dispose();

    expect(resizeObservers[0].disconnect).toHaveBeenCalledTimes(1);
    expect(renderer.dispose).toHaveBeenCalledTimes(1);
    expect(earthGeometryDispose).toHaveBeenCalledTimes(1);
    expect(moonGeometryDispose).toHaveBeenCalledTimes(1);
    expect(orbitGeometryDispose).toHaveBeenCalledTimes(1);
    expect(orbitMaterialDispose).toHaveBeenCalledTimes(1);
    expect(earthTextureDispose).toHaveBeenCalledTimes(1);
    expect(haloTextureDispose).toHaveBeenCalledTimes(1);
  });
});
