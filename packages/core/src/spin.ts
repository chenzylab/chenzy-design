/**
 * createSpinController — framework-agnostic loading-state debouncer for Spin.
 * Handles `delay` (wait before showing, to avoid flicker on fast requests) and
 * `minShowTime` (keep showing at least this long once shown). Uses timers only;
 * SSR-safe because the consumer starts it in a client effect. No DOM, no
 * framework deps. See specs/components/feedback/Spin.spec.md §3.
 */

export interface SpinOptions {
  delay?: number;
  minShowTime?: number;
  /** initial spinning request */
  spinning?: boolean;
}

export interface SpinController {
  /** the debounced, effective visibility — what the render layer should show */
  getEffective(): boolean;
  /** subscribe to effective-visibility changes; returns unsubscribe */
  subscribe(listener: (effective: boolean) => void): () => void;
  /** push a new spinning request (controlled by the host) */
  setSpinning(value: boolean): void;
  /** clear timers (call on unmount) */
  destroy(): void;
}

type TimerId = ReturnType<typeof setTimeout>;

export function createSpinController(options: SpinOptions = {}): SpinController {
  const { delay = 0, minShowTime = 0 } = options;

  let requested = options.spinning ?? false;
  let effective = false;
  let shownAt = 0;
  let delayTimer: TimerId | null = null;
  let minTimer: TimerId | null = null;
  const listeners = new Set<(effective: boolean) => void>();

  function clearDelay(): void {
    if (delayTimer !== null) {
      clearTimeout(delayTimer);
      delayTimer = null;
    }
  }
  function clearMin(): void {
    if (minTimer !== null) {
      clearTimeout(minTimer);
      minTimer = null;
    }
  }

  function setEffective(value: boolean): void {
    if (effective === value) return;
    effective = value;
    if (value) shownAt = Date.now();
    for (const l of listeners) l(effective);
  }

  function show(): void {
    clearDelay();
    if (delay > 0 && !effective) {
      delayTimer = setTimeout(() => {
        delayTimer = null;
        setEffective(true);
      }, delay);
    } else {
      setEffective(true);
    }
  }

  function hide(): void {
    clearDelay(); // cancel a pending show — never displayed, never announced
    if (!effective) return;
    if (minShowTime > 0) {
      const elapsed = Date.now() - shownAt;
      const remaining = minShowTime - elapsed;
      if (remaining > 0) {
        clearMin();
        minTimer = setTimeout(() => {
          minTimer = null;
          if (!requested) setEffective(false);
        }, remaining);
        return;
      }
    }
    setEffective(false);
  }

  // apply the initial request synchronously-ish (delay still honored)
  if (requested) show();

  return {
    getEffective: () => effective,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setSpinning(value) {
      if (value === requested) return;
      requested = value;
      if (value) {
        clearMin();
        show();
      } else {
        hide();
      }
    },
    destroy() {
      clearDelay();
      clearMin();
      listeners.clear();
    },
  };
}
