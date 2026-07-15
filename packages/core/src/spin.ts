/**
 * createSpinController — framework-agnostic loading-state debouncer for Spin.
 * Mirrors Semi's delay semantics (semi-foundation/spin/foundation.ts): when a
 * `delay` is set, showing is postponed by `delay` ms; turning spinning off hides
 * immediately (and cancels any pending delayed show). No minShowTime — Semi has
 * none. Uses timers only; SSR-safe because the consumer starts it in a client
 * effect. No DOM, no framework deps.
 */

export interface SpinOptions {
  delay?: number;
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
  const { delay = 0 } = options;

  let requested = options.spinning ?? false;
  // Semi seeds loading=true, then getDerivedStateFromProps resolves it against
  // spinning/delay. With no delay, effective tracks `requested` immediately.
  let effective = delay > 0 ? false : requested;
  let delayTimer: TimerId | null = null;
  const listeners = new Set<(effective: boolean) => void>();

  function clearDelay(): void {
    if (delayTimer !== null) {
      clearTimeout(delayTimer);
      delayTimer = null;
    }
  }

  function setEffective(value: boolean): void {
    if (effective === value) return;
    effective = value;
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
    clearDelay(); // cancel a pending show — never displayed
    setEffective(false);
  }

  // apply the initial request (delay still honored)
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
      if (value) show();
      else hide();
    },
    destroy() {
      clearDelay();
      listeners.clear();
    },
  };
}
