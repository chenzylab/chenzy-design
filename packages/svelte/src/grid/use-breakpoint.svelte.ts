/**
 * useBreakpoint — reactive current breakpoint from the viewport width.
 * Listens to resize (rAF-throttled) imperatively in $effect with cleanup
 * (red line #3); pure breakpoint math lives in @chenzy-design/core.
 * SSR-safe: defaults to 'xs' until mounted, then syncs to the real width.
 */
import { resolveActiveBreakpoint, type Breakpoint } from '@chenzy-design/core';

export interface BreakpointHandle {
  /** the current active breakpoint (reactive) */
  readonly current: Breakpoint;
}

const SUPPORTS_DOM = typeof window !== 'undefined';

export function useBreakpoint(): BreakpointHandle {
  // initial value: real width if available (client), else 'xs' (SSR-safe).
  let bp = $state<Breakpoint>(
    SUPPORTS_DOM ? resolveActiveBreakpoint(window.innerWidth) : 'xs',
  );

  $effect(() => {
    if (!SUPPORTS_DOM) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const next = resolveActiveBreakpoint(window.innerWidth);
      if (next !== bp) bp = next;
    };
    const onResize = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };
    // sync once on mount (covers the SSR→client width correction) then listen.
    measure();
    window.addEventListener('resize', onResize);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
    };
  });

  return {
    get current() {
      return bp;
    },
  };
}
