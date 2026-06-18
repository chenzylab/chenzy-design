import { describe, expect, it, vi } from 'vitest';
import { createSider } from './sider.js';

describe('createSider', () => {
  it('uncontrolled: toggles and notifies subscribers', () => {
    const s = createSider({ defaultCollapsed: false });
    const seen: boolean[] = [];
    s.subscribe((c) => seen.push(c));
    expect(s.getCollapsed()).toBe(false);
    s.toggle();
    expect(s.getCollapsed()).toBe(true);
    expect(seen).toEqual([true]);
  });

  it('controlled: does not mutate internal, still fires onChange', () => {
    const onChange = vi.fn();
    const s = createSider({ collapsed: false, onChange });
    s.toggle();
    expect(s.getCollapsed()).toBe(false); // unchanged (controlled)
    expect(onChange).toHaveBeenCalledWith(true, 'click');
  });

  it('exposes a stable id for aria-controls', () => {
    const s = createSider();
    expect(s.id).toMatch(/^cd-sider-/);
  });

  it('watchBreakpoint is a no-op without a breakpoint', () => {
    const s = createSider();
    expect(typeof s.watchBreakpoint()).toBe('function');
  });
});
