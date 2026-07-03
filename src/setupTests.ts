import '@testing-library/jest-dom';

if (typeof globalThis.PointerEvent === 'undefined') {
  class PointerEventPolyfill extends MouseEvent {
    pointerId: number;
    pointerType: string;

    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 0;
      this.pointerType = init.pointerType ?? 'mouse';
    }
  }

  (
    globalThis as unknown as { PointerEvent: typeof PointerEventPolyfill }
  ).PointerEvent = PointerEventPolyfill;
}

if (typeof window !== 'undefined' && typeof window.matchMedia === 'undefined') {
  // jsdom does not implement matchMedia. Provide a minimal always-false
  // default; tests that need specific queries override it per file.
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string): MediaQueryList =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList,
  });
}
