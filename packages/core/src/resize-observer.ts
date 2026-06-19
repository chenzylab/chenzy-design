/**
 * createResizeObserver — framework-agnostic wrapper over native ResizeObserver.
 * Normalizes entries to a stable shape and degrades silently when unsupported
 * (SSR / old browsers). The svelte layer owns the element refs and lifecycle.
 * See specs/components/other/ResizeObserver.spec.md §3 (single-target subset;
 * throttle/debounce/multiple/global-pool deferred).
 */

export type ResizeBox = 'content-box' | 'border-box';

/** normalized size payload — consumers never call getBoundingClientRect */
export interface CDResizeEntry {
  target: Element;
  width: number;
  height: number;
  box: ResizeBox;
}

export interface ResizeObserverOptions {
  box?: ResizeBox;
  onResize: (entry: CDResizeEntry) => void;
}

export interface ResizeObserverApi {
  readonly supported: boolean;
  observe(el: Element): void;
  unobserve(el: Element): void;
  disconnect(): void;
}

/** true when the native ResizeObserver is available (client only). */
export function isResizeObserverSupported(): boolean {
  return typeof globalThis !== 'undefined' && typeof globalThis.ResizeObserver === 'function';
}

/**
 * Normalize a native ResizeObserverEntry into CDResizeEntry. Prefers
 * borderBoxSize / contentBoxSize (avoids forced reflow) and falls back to
 * contentRect for older implementations.
 */
export function normalizeEntry(entry: ResizeObserverEntry, box: ResizeBox): CDResizeEntry {
  let width: number;
  let height: number;

  const boxSize =
    box === 'border-box'
      ? (entry.borderBoxSize as ReadonlyArray<ResizeObserverSize> | undefined)
      : (entry.contentBoxSize as ReadonlyArray<ResizeObserverSize> | undefined);

  if (boxSize && boxSize.length > 0) {
    width = boxSize[0]!.inlineSize;
    height = boxSize[0]!.blockSize;
  } else {
    // fallback: contentRect (content-box only; older Safari)
    width = entry.contentRect.width;
    height = entry.contentRect.height;
  }

  return { target: entry.target, width, height, box };
}

export function createResizeObserver(options: ResizeObserverOptions): ResizeObserverApi {
  const { box = 'content-box', onResize } = options;
  const supported = isResizeObserverSupported();

  if (!supported) {
    return {
      supported: false,
      observe() {},
      unobserve() {},
      disconnect() {},
    };
  }

  const ro = new ResizeObserver((entries) => {
    for (const entry of entries) onResize(normalizeEntry(entry, box));
  });

  return {
    supported: true,
    observe(el) {
      ro.observe(el, { box });
    },
    unobserve(el) {
      ro.unobserve(el);
    },
    disconnect() {
      ro.disconnect();
    },
  };
}
