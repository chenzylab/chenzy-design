/**
 * createSider — framework-agnostic collapse state machine for Layout.Sider.
 * Handles controlled/uncontrolled collapse + optional breakpoint matchMedia.
 * No DOM rendering, no framework deps. See specs/components/basic/Layout.spec.md.
 */
import { useId } from './id.js';
import { BREAKPOINTS, type Breakpoint } from './breakpoints.js';

export type SiderTrigger = 'click' | 'breakpoint';
export type { Breakpoint };

export interface SiderOptions {
  /** controlled collapsed value; when provided, internal state is not mutated */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  /** auto-collapse below this breakpoint */
  breakpoint?: Breakpoint;
  onChange?: (collapsed: boolean, trigger: SiderTrigger) => void;
  onBreakpoint?: (matched: boolean, breakpoint: Breakpoint) => void;
}

export interface SiderApi {
  /** stable id for aria-controls */
  readonly id: string;
  /** current collapsed state */
  getCollapsed(): boolean;
  /** subscribe to collapsed changes; returns unsubscribe */
  subscribe(listener: (collapsed: boolean) => void): () => void;
  toggle(): void;
  setCollapsed(value: boolean, trigger?: SiderTrigger): void;
  /** start matchMedia breakpoint watching (call on mount). no-op without breakpoint. */
  watchBreakpoint(): () => void;
}

export function createSider(options: SiderOptions = {}): SiderApi {
  const {
    collapsed: controlled,
    defaultCollapsed = false,
    breakpoint,
    onChange,
    onBreakpoint,
  } = options;

  const isControlled = controlled !== undefined;
  let internal = isControlled ? controlled : defaultCollapsed;
  const listeners = new Set<(collapsed: boolean) => void>();

  function current(): boolean {
    return isControlled ? (controlled as boolean) : internal;
  }
  function emit(): void {
    for (const l of listeners) l(current());
  }

  function setCollapsed(value: boolean, trigger: SiderTrigger = 'click'): void {
    if (!isControlled) {
      if (internal === value) return;
      internal = value;
      emit();
    }
    onChange?.(value, trigger);
  }

  return {
    id: useId('cd-sider'),
    getCollapsed: current,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    toggle() {
      setCollapsed(!current(), 'click');
    },
    setCollapsed,
    watchBreakpoint() {
      if (!breakpoint || typeof window === 'undefined' || !window.matchMedia) {
        return () => {};
      }
      const mql = window.matchMedia(`(max-width: ${BREAKPOINTS[breakpoint] - 0.02}px)`);
      const handle = (e: MediaQueryListEvent | MediaQueryList): void => {
        onBreakpoint?.(e.matches, breakpoint);
        setCollapsed(e.matches, 'breakpoint');
      };
      handle(mql);
      mql.addEventListener('change', handle);
      return () => mql.removeEventListener('change', handle);
    },
  };
}
