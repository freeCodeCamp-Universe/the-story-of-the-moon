import { createRef } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { MoonExpandDialog } from '@/chapters/Ch2/MoonExpandDialog';

const handle = {
  rotateBy: vi.fn(),
  dispose: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  setCameraTarget: vi.fn(),
  getCameraLatLon: vi.fn(() => ({ lat: 0, lon: 0 })),
  projectFeature: vi.fn(() => ({ x: 0, y: 0, visible: false })),
};

const createMoonScene = vi.fn(() => handle);
const originalDialogShowModal = globalThis.HTMLDialogElement?.prototype.showModal;
const originalDialogClose = globalThis.HTMLDialogElement?.prototype.close;

vi.mock('@/three/moonScene', () => ({
  createMoonScene,
}));

type OverlayHarnessProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

function DialogHarness({ isOpen = true, onClose = vi.fn() }: OverlayHarnessProps) {
  const triggerRef = createRef<HTMLButtonElement>();

  return (
    <>
      <button ref={triggerRef} type="button">
        open expanded moon view
      </button>
      <MoonExpandDialog isOpen={isOpen} onClose={onClose} triggerRef={triggerRef} initialTarget={{ lat: 0, lon: 0 }} reducedMotion={false} />
    </>
  );
}

describe('MoonExpandDialog', () => {
  beforeAll(() => {
    if (globalThis.HTMLDialogElement && typeof globalThis.HTMLDialogElement.prototype.showModal !== 'function') {
      Object.defineProperty(globalThis.HTMLDialogElement.prototype, 'showModal', {
        configurable: true,
        value() {
          this.setAttribute('open', '');
        },
      });
    }

    if (globalThis.HTMLDialogElement && typeof globalThis.HTMLDialogElement.prototype.close !== 'function') {
      Object.defineProperty(globalThis.HTMLDialogElement.prototype, 'close', {
        configurable: true,
        value() {
          this.removeAttribute('open');
          this.dispatchEvent(new Event('close'));
        },
      });
    }
  });

  afterAll(() => {
    if (globalThis.HTMLDialogElement) {
      if (originalDialogShowModal) {
        Object.defineProperty(globalThis.HTMLDialogElement.prototype, 'showModal', {
          configurable: true,
          value: originalDialogShowModal,
        });
      }

      if (originalDialogClose) {
        Object.defineProperty(globalThis.HTMLDialogElement.prototype, 'close', {
          configurable: true,
          value: originalDialogClose,
        });
      }
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should rotate the overlay scene with the arrow keys', async () => {
    const STEP = (8 * Math.PI) / 180;

    render(<DialogHarness />);

    await waitFor(() => {
      expect(createMoonScene).toHaveBeenCalled();
    });

    const sceneGroup = screen.getByRole('group', {
      name: 'Interactive view of the Moon; drag or use arrow keys to rotate',
    });

    fireEvent.keyDown(sceneGroup, { key: 'ArrowLeft' });
    expect(handle.rotateBy).toHaveBeenNthCalledWith(1, {
      deltaAzimuth: -STEP,
      deltaPolar: 0,
    });

    fireEvent.keyDown(sceneGroup, { key: 'ArrowRight' });
    expect(handle.rotateBy).toHaveBeenNthCalledWith(2, {
      deltaAzimuth: STEP,
      deltaPolar: 0,
    });

    fireEvent.keyDown(sceneGroup, { key: 'ArrowUp' });
    expect(handle.rotateBy).toHaveBeenNthCalledWith(3, {
      deltaAzimuth: 0,
      deltaPolar: -STEP,
    });

    fireEvent.keyDown(sceneGroup, { key: 'ArrowDown' });
    expect(handle.rotateBy).toHaveBeenNthCalledWith(4, {
      deltaAzimuth: 0,
      deltaPolar: STEP,
    });
  });

  it('should ignore non-arrow keys', async () => {
    render(<DialogHarness />);

    await waitFor(() => {
      expect(createMoonScene).toHaveBeenCalled();
    });

    const sceneGroup = screen.getByRole('group', {
      name: 'Interactive view of the Moon; drag or use arrow keys to rotate',
    });

    fireEvent.keyDown(sceneGroup, { key: 'a' });
    fireEvent.keyDown(sceneGroup, { key: 'Enter' });

    expect(handle.rotateBy).not.toHaveBeenCalled();
  });

  it('should dispose the overlay scene when it closes', async () => {
    const { rerender } = render(<DialogHarness isOpen />);

    await waitFor(() => {
      expect(createMoonScene).toHaveBeenCalled();
    });

    rerender(<DialogHarness isOpen={false} />);

    expect(handle.dispose).toHaveBeenCalled();
  });
});
