import { describe, expect, it, vi } from 'vitest';
import {
  createResizeDrag,
  computeGroupResize,
  clamp as clampResize,
  snapToGrid,
  hasDirection,
  getPixelSize,
  judgeConstraint,
  adjustNewSize,
} from './resizable.js';

// ---- fake document so we can drive pointer events without a real DOM ----
function makeFakeDoc() {
  const listeners = new Map<string, Set<(e: unknown) => void>>();
  const doc = {
    addEventListener(type: string, fn: (e: unknown) => void) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(fn);
    },
    removeEventListener(type: string, fn: (e: unknown) => void) {
      listeners.get(type)?.delete(fn);
    },
    fire(type: string, e: unknown) {
      for (const fn of listeners.get(type) ?? []) fn(e);
    },
    count(type: string) {
      return listeners.get(type)?.size ?? 0;
    },
  };
  return doc;
}

const pe = (x: number, y: number) =>
  ({ clientX: x, clientY: y }) as unknown as PointerEvent;

describe('numeric helpers', () => {
  it('clamp', () => {
    expect(clampResize(5, 0, 10)).toBe(5);
    expect(clampResize(-1, 0, 10)).toBe(0);
    expect(clampResize(99, 0, 10)).toBe(10);
  });
  it('snapToGrid', () => {
    expect(snapToGrid(23, 10)).toBe(20);
    expect(snapToGrid(26, 10)).toBe(30);
    expect(snapToGrid(26, 0)).toBe(26); // no snap
  });
  it('hasDirection', () => {
    expect(hasDirection('topRight', 'top')).toBe(true);
    expect(hasDirection('topRight', 'right')).toBe(true);
    expect(hasDirection('topRight', 'left')).toBe(false);
  });
  it('getPixelSize parses px/%/number', () => {
    expect(getPixelSize('120px', 500)).toBe(120);
    expect(getPixelSize('50%', 500)).toBe(250);
    expect(getPixelSize(80, 500)).toBe(80);
  });
});

describe('createResizeDrag — single axis x (Table column case)', () => {
  it('clamps to min and writes size on move; min covers Table MIN_COL_WIDTH', () => {
    const doc = makeFakeDoc();
    const sizes: number[] = [];
    const drag = createResizeDrag({
      axis: 'x',
      direction: 'right',
      getStart: () => ({ width: 100 }),
      min: 40,
      onMove: (s) => sizes.push(s.width),
      ownerDocument: doc as unknown as Document,
    });
    drag.start(pe(0, 0), 'right');
    expect(doc.count('pointermove')).toBe(1);
    doc.fire('pointermove', pe(50, 0)); // +50 => 150
    doc.fire('pointermove', pe(-100, 0)); // -100 => clamp 40
    expect(sizes).toEqual([150, 40]);
    doc.fire('pointerup', pe(-100, 0));
    expect(doc.count('pointermove')).toBe(0); // detached
    expect(drag.isDragging()).toBe(false);
  });

  it('left direction grows toward negative delta', () => {
    const doc = makeFakeDoc();
    const sizes: number[] = [];
    const drag = createResizeDrag({
      axis: 'x',
      direction: 'left',
      getStart: () => ({ width: 100 }),
      onMove: (s) => sizes.push(s.width),
      ownerDocument: doc as unknown as Document,
    });
    drag.start(pe(0, 0), 'left');
    doc.fire('pointermove', pe(-30, 0)); // left: 100 - (-30) = 130
    expect(sizes).toEqual([130]);
  });

  it('respects max bound', () => {
    const doc = makeFakeDoc();
    const sizes: number[] = [];
    const drag = createResizeDrag({
      axis: 'x',
      getStart: () => ({ width: 100 }),
      max: 120,
      onMove: (s) => sizes.push(s.width),
      ownerDocument: doc as unknown as Document,
    });
    drag.start(pe(0, 0), 'right');
    doc.fire('pointermove', pe(500, 0));
    expect(sizes).toEqual([120]);
  });

  it('grid snaps the moving size', () => {
    const doc = makeFakeDoc();
    const sizes: number[] = [];
    const drag = createResizeDrag({
      axis: 'x',
      getStart: () => ({ width: 100 }),
      grid: [25, 25],
      onMove: (s) => sizes.push(s.width),
      ownerDocument: doc as unknown as Document,
    });
    drag.start(pe(0, 0), 'right');
    doc.fire('pointermove', pe(11, 0)); // 111 -> snap 25 -> 100
    doc.fire('pointermove', pe(20, 0)); // 120 -> snap 25 -> 125
    expect(sizes).toEqual([100, 125]);
  });

  it('scale divides the delta', () => {
    const doc = makeFakeDoc();
    const sizes: number[] = [];
    const drag = createResizeDrag({
      axis: 'x',
      getStart: () => ({ width: 100 }),
      scale: 2,
      onMove: (s) => sizes.push(s.width),
      ownerDocument: doc as unknown as Document,
    });
    drag.start(pe(0, 0), 'right');
    doc.fire('pointermove', pe(100, 0)); // 100/2 = 50 -> 150
    expect(sizes).toEqual([150]);
  });
});

describe('createResizeDrag — lifecycle', () => {
  it('fires onStart / onEnd and detaches on up', () => {
    const doc = makeFakeDoc();
    const onStart = vi.fn();
    const onEnd = vi.fn();
    const drag = createResizeDrag({
      axis: 'y',
      getStart: () => ({ height: 200 }),
      onStart,
      onEnd,
      ownerDocument: doc as unknown as Document,
    });
    drag.start(pe(0, 0), 'bottom');
    expect(onStart).toHaveBeenCalledWith('bottom', expect.anything());
    doc.fire('pointerup', pe(0, 30));
    expect(onEnd).toHaveBeenCalledWith(
      { width: 0, height: 230 },
      'bottom',
      expect.anything(),
    );
    expect(doc.count('pointerup')).toBe(0);
  });

  it('destroy() detaches leftover listeners (unmount safety net)', () => {
    const doc = makeFakeDoc();
    const drag = createResizeDrag({
      axis: 'x',
      getStart: () => ({ width: 100 }),
      ownerDocument: doc as unknown as Document,
    });
    drag.start(pe(0, 0), 'right');
    expect(doc.count('pointermove')).toBe(1);
    drag.destroy();
    expect(doc.count('pointermove')).toBe(0);
    expect(doc.count('pointerup')).toBe(0);
  });

  it('lockAspectRatio drives height from width on corner drag', () => {
    const doc = makeFakeDoc();
    const sizes: { width: number; height: number }[] = [];
    const drag = createResizeDrag({
      axis: 'xy',
      getStart: () => ({ width: 100, height: 50 }), // ratio 2
      lockAspectRatio: true,
      onMove: (s) => sizes.push({ width: s.width, height: s.height }),
      ownerDocument: doc as unknown as Document,
    });
    drag.start(pe(0, 0), 'bottomRight');
    doc.fire('pointermove', pe(100, 0)); // width 200 -> height 100 (ratio 2)
    expect(sizes[0]).toEqual({ width: 200, height: 100 });
  });
});

describe('computeGroupResize — coupling + conservation', () => {
  const base = {
    direction: 'horizontal' as const,
    parentSize: 400,
    lastItemSize: 200,
    nextItemSize: 200,
    lastItemPercent: 50,
    nextItemPercent: 50,
    last: {},
    next: {},
  };

  it('one grows, one shrinks; sum conserved', () => {
    const r = computeGroupResize({ ...base, delta: 40 });
    expect(r.lastNewSize).toBe(240);
    expect(r.nextNewSize).toBe(160);
    expect(r.lastNewPercent + r.nextNewPercent).toBeCloseTo(100);
  });

  it('clamps last to min and gives the remainder to next', () => {
    const r = computeGroupResize({
      ...base,
      delta: -180, // last would be 20, below min 100px
      last: { min: '100px' },
    });
    expect(r.lastNewSize).toBe(100);
    expect(r.nextNewSize).toBe(300); // 200+200-100
    expect(r.lastNewPercent + r.nextNewPercent).toBeCloseTo(100);
  });

  it('clamps next to min when it would underflow', () => {
    const r = computeGroupResize({
      ...base,
      delta: 180, // next would be 20, below min 100px
      next: { min: '100px' },
    });
    expect(r.nextNewSize).toBe(100);
    expect(r.lastNewSize).toBe(300);
  });

  it('honors percent min/max against parentSize', () => {
    const r = computeGroupResize({
      ...base,
      delta: 400, // last would blow past max
      last: { max: '75%' }, // 300px
    });
    expect(r.lastNewSize).toBe(300);
    expect(r.nextNewSize).toBe(100);
  });
});

describe('constraint helpers', () => {
  it('judgeConstraint flags out-of-range', () => {
    expect(judgeConstraint(30, '40px', '200px', 400)).toBe(true);
    expect(judgeConstraint(300, '40px', '200px', 400)).toBe(true);
    expect(judgeConstraint(100, '40px', '200px', 400)).toBe(false);
  });
  it('adjustNewSize clamps with offset', () => {
    expect(adjustNewSize(10, '40px', '200px', 400, 5)).toBe(45);
    expect(adjustNewSize(999, '40px', '200px', 400)).toBe(200);
    expect(adjustNewSize(100, '40px', '200px', 400)).toBe(100);
  });
});
