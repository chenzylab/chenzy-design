import { describe, expect, it } from 'vitest';
import {
  computePosition,
  parsePlacement,
  makePlacement,
  type Placement,
  type Rect,
} from './floating.js';

// trigger: 100x40 box centered-ish; popup 80x30; large viewport so no clamping
const trigger: Rect = { x: 200, y: 200, width: 100, height: 40 };
const popup: Rect = { x: 0, y: 0, width: 80, height: 30 };
const viewport = { width: 1000, height: 800 };
const base = { triggerRect: trigger, popupRect: popup, viewport, offset: 8 };

describe('parsePlacement / makePlacement round-trip', () => {
  const all: Placement[] = [
    'top', 'topStart', 'topEnd',
    'bottom', 'bottomStart', 'bottomEnd',
    'left', 'leftStart', 'leftEnd',
    'right', 'rightStart', 'rightEnd',
  ];
  it('round-trips every 12-way placement', () => {
    for (const p of all) {
      const { side, align } = parsePlacement(p);
      expect(makePlacement(side, align)).toBe(p);
    }
  });
});

describe('computePosition main-axis placement', () => {
  it('top puts popup above the trigger with offset', () => {
    const r = computePosition({ ...base, placement: 'top' });
    expect(r.side).toBe('top');
    // y = trigger.y - popup.height - offset = 200 - 30 - 8 = 162
    expect(r.y).toBe(162);
  });
  it('bottom puts popup below the trigger with offset', () => {
    const r = computePosition({ ...base, placement: 'bottom' });
    // y = trigger.y + trigger.height + offset = 200 + 40 + 8 = 248
    expect(r.y).toBe(248);
  });
  it('left puts popup to the left with offset', () => {
    const r = computePosition({ ...base, placement: 'left' });
    // x = trigger.x - popup.width - offset = 200 - 80 - 8 = 112
    expect(r.x).toBe(112);
  });
  it('right puts popup to the right with offset', () => {
    const r = computePosition({ ...base, placement: 'right' });
    // x = trigger.x + trigger.width + offset = 200 + 100 + 8 = 308
    expect(r.x).toBe(308);
  });
});

describe('computePosition cross-axis align', () => {
  it('top center horizontally centers popup over trigger center', () => {
    const r = computePosition({ ...base, placement: 'top' });
    // triggerCenterX = 250; x = 250 - 80/2 = 210
    expect(r.x).toBe(210);
  });
  it('topStart aligns popup left edge with trigger left edge', () => {
    const r = computePosition({ ...base, placement: 'topStart' });
    expect(r.x).toBe(trigger.x); // 200
  });
  it('topEnd aligns popup right edge with trigger right edge', () => {
    const r = computePosition({ ...base, placement: 'topEnd' });
    // triggerRight - popupWidth = 300 - 80 = 220
    expect(r.x).toBe(220);
  });
  it('leftStart aligns popup top edge with trigger top edge', () => {
    const r = computePosition({ ...base, placement: 'leftStart' });
    expect(r.y).toBe(trigger.y); // 200
  });
});

describe('computePosition autoAdjust flip', () => {
  it('flips top -> bottom when there is no room above but room below', () => {
    const nearTop: Rect = { x: 200, y: 10, width: 100, height: 40 };
    const r = computePosition({
      ...base,
      triggerRect: nearTop,
      placement: 'top',
      autoAdjust: true,
    });
    expect(r.side).toBe('bottom');
  });
  it('keeps requested side when it fits even with autoAdjust', () => {
    const r = computePosition({ ...base, placement: 'top', autoAdjust: true });
    expect(r.side).toBe('top');
  });
  it('does NOT flip when autoAdjust is off, even if overflowing', () => {
    const nearTop: Rect = { x: 200, y: 10, width: 100, height: 40 };
    const r = computePosition({
      ...base,
      triggerRect: nearTop,
      placement: 'top',
      autoAdjust: false,
    });
    expect(r.side).toBe('top');
  });
  it('does not flip when the opposite side has even less room', () => {
    // trigger tall, near bottom: top has 10px, bottom has ~5px → keep top? no:
    // top space 600, bottom space tiny → requesting bottom should flip to top
    const nearBottom: Rect = { x: 200, y: 760, width: 100, height: 30 };
    const r = computePosition({
      ...base,
      triggerRect: nearBottom,
      placement: 'bottom',
      autoAdjust: true,
    });
    expect(r.side).toBe('top');
  });
  it('flips left -> right symmetrically', () => {
    const nearLeft: Rect = { x: 10, y: 300, width: 60, height: 40 };
    const r = computePosition({
      ...base,
      triggerRect: nearLeft,
      placement: 'left',
      autoAdjust: true,
    });
    expect(r.side).toBe('right');
  });
});

describe('computePosition viewport-edge clamping (cross axis)', () => {
  it('clamps cross-axis x so popup stays inside the viewport with padding', () => {
    // trigger at far right; top-center would push popup off-screen right
    const farRight: Rect = { x: 980, y: 200, width: 40, height: 40 };
    const r = computePosition({
      ...base,
      triggerRect: farRight,
      placement: 'top',
      padding: 4,
    });
    // max x = viewport.width - popup.width - padding = 1000 - 80 - 4 = 916
    expect(r.x).toBe(916);
  });
  it('clamps cross-axis x to padding on the left edge', () => {
    const farLeft: Rect = { x: 0, y: 200, width: 20, height: 40 };
    const r = computePosition({ ...base, triggerRect: farLeft, placement: 'top', padding: 4 });
    expect(r.x).toBe(4);
  });
});

describe('computePosition arrowOffset', () => {
  it('points the arrow at the trigger center for centered placement', () => {
    const r = computePosition({ ...base, placement: 'bottom' });
    // popup leading x = 210, trigger center x = 250 → arrowOffset = 40
    expect(r.arrowOffset).toBe(40);
  });
  it('keeps the arrow pointing at the trigger even after cross-axis clamp', () => {
    const farRight: Rect = { x: 980, y: 200, width: 40, height: 40 };
    const r = computePosition({ ...base, triggerRect: farRight, placement: 'top', padding: 4 });
    // trigger center x = 1000; popup leading x clamped to 916 → 84, clamped to popup-4 = 76
    expect(r.arrowOffset).toBe(76);
  });

  it('pins the arrow near the aligned edge for start alignment by default', () => {
    const r = computePosition({ ...base, placement: 'bottomStart' });
    // default arrowEdgeDistance 12, measured from the leading (left) edge
    expect(r.arrowOffset).toBe(12);
  });

  it('pins the arrow near the aligned edge for end alignment by default', () => {
    const r = computePosition({ ...base, placement: 'bottomEnd' });
    // popup width 80 − edgeDistance 12 = 68
    expect(r.arrowOffset).toBe(68);
  });

  it('honors a custom arrowEdgeDistance', () => {
    const r = computePosition({ ...base, placement: 'bottomStart', arrowEdgeDistance: 20 });
    expect(r.arrowOffset).toBe(20);
  });

  it('points start-aligned arrow at the trigger center when arrowPointAtCenter', () => {
    const r = computePosition({ ...base, placement: 'bottomStart', arrowPointAtCenter: true });
    // popup leading x = trigger.x = 200; trigger center x = 250 → 50
    expect(r.arrowOffset).toBe(50);
  });

  it('points end-aligned arrow at the trigger center when arrowPointAtCenter', () => {
    const r = computePosition({ ...base, placement: 'bottomEnd', arrowPointAtCenter: true });
    // popup leading x = 200+100−80 = 220; trigger center x = 250 → 30
    expect(r.arrowOffset).toBe(30);
  });
});
