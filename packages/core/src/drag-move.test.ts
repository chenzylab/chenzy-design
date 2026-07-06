import { describe, expect, it, vi } from 'vitest';
import {
  createDragMove,
  calcMoveRange,
  computeNextPosition,
  clampValueInRange,
} from './drag-move.js';

// ---- fake document so we can drive pointer events without a real DOM ----
function makeFakeDoc() {
  const listeners = new Map<string, Set<(e: unknown) => void>>();
  return {
    addEventListener(type: string, fn: (e: unknown) => void) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(fn);
    },
    removeEventListener(type: string, fn: (e: unknown) => void) {
      listeners.get(type)?.delete(fn);
    },
    fire(type: string, e: unknown) {
      for (const fn of [...(listeners.get(type) ?? [])]) fn(e);
    },
    count(type: string) {
      return listeners.get(type)?.size ?? 0;
    },
  };
}

// ---- fake handler/element that records its own listeners ----
function makeFakeEl(
  overrides: Partial<{
    offsetLeft: number;
    offsetTop: number;
    offsetWidth: number;
    offsetHeight: number;
    offsetParent: unknown;
  }> = {},
) {
  const l = new Map<string, Set<(e: unknown) => void>>();
  const style: Record<string, string> = {};
  return {
    style,
    offsetLeft: overrides.offsetLeft ?? 0,
    offsetTop: overrides.offsetTop ?? 0,
    offsetWidth: overrides.offsetWidth ?? 50,
    offsetHeight: overrides.offsetHeight ?? 50,
    offsetParent: overrides.offsetParent ?? null,
    addEventListener(t: string, fn: (e: unknown) => void) {
      if (!l.has(t)) l.set(t, new Set());
      l.get(t)!.add(fn);
    },
    removeEventListener(t: string, fn: (e: unknown) => void) {
      l.get(t)?.delete(fn);
    },
    fire(t: string, e: unknown) {
      for (const fn of [...(l.get(t) ?? [])]) fn(e);
    },
    count(t: string) {
      return l.get(t)?.size ?? 0;
    },
  };
}

const me = (x: number, y: number, target?: unknown) =>
  ({
    clientX: x,
    clientY: y,
    target,
    preventDefault: () => {},
  }) as unknown as MouseEvent;

const te = (x: number, y: number, target?: unknown) =>
  ({
    targetTouches: [{ clientX: x, clientY: y }],
    target,
    preventDefault: () => {},
  }) as unknown as TouchEvent;

describe('clampValueInRange', () => {
  it('clamps into [min, max]', () => {
    expect(clampValueInRange(5, 0, 10)).toBe(5);
    expect(clampValueInRange(-3, 0, 10)).toBe(0);
    expect(clampValueInRange(99, 0, 10)).toBe(10);
  });
});

describe('computeNextPosition', () => {
  it('unconstrained: top/left = client − start offset', () => {
    expect(computeNextPosition(120, 80, 20, 10, null)).toEqual({
      left: 100,
      top: 70,
    });
  });
  it('clamps to move range on both axes', () => {
    const range = { xMin: 0, xMax: 100, yMin: 0, yMax: 60 };
    // would be left=-50 (→0), top=200 (→60)
    expect(computeNextPosition(-30, 210, 20, 10, range)).toEqual({
      left: 0,
      top: 60,
    });
    // in-range passes through
    expect(computeNextPosition(70, 50, 20, 10, range)).toEqual({
      left: 50,
      top: 40,
    });
  });
});

describe('calcMoveRange', () => {
  it('returns null when no constrainer', () => {
    const el = makeFakeEl();
    expect(calcMoveRange(el as unknown as HTMLElement, null)).toBeNull();
  });
  it('derives range from constrainer box minus element box (direct child)', () => {
    const constrainer = makeFakeEl({ offsetWidth: 400, offsetHeight: 300 });
    const el = makeFakeEl({
      offsetWidth: 100,
      offsetHeight: 80,
      // offsetParent === constrainer → loop does not run, start = 0
      offsetParent: constrainer,
    });
    const range = calcMoveRange(
      el as unknown as HTMLElement,
      constrainer as unknown as HTMLElement,
    );
    expect(range).toEqual({ xMin: 0, xMax: 300, yMin: 0, yMax: 220 });
  });
  it('accumulates intermediate offsetParent offsets', () => {
    const constrainer = makeFakeEl({ offsetWidth: 400, offsetHeight: 300 });
    const mid = makeFakeEl({
      offsetLeft: 30,
      offsetTop: 20,
      offsetParent: constrainer,
    });
    const el = makeFakeEl({
      offsetWidth: 100,
      offsetHeight: 80,
      offsetParent: mid,
    });
    const range = calcMoveRange(
      el as unknown as HTMLElement,
      constrainer as unknown as HTMLElement,
    );
    // start accumulates -mid.offsetLeft/-mid.offsetTop
    expect(range).toEqual({ xMin: -30, xMax: 270, yMin: -20, yMax: 200 });
  });
});

describe('createDragMove — lifecycle + position write', () => {
  it('init binds start listeners on handler and forces absolute position', () => {
    const el = makeFakeEl();
    const handler = makeFakeEl();
    const doc = makeFakeDoc();
    const ctrl = createDragMove({
      getElement: () => el as unknown as HTMLElement,
      handler: () => handler as unknown as HTMLElement,
      ownerDocument: doc as unknown as Document,
    });
    ctrl.init();
    expect(el.style.position).toBe('absolute');
    expect(handler.count('mousedown')).toBe(1);
    expect(handler.count('touchstart')).toBe(1);
    // element itself gets no start listener when a handler is provided
    expect(el.count('mousedown')).toBe(0);
  });

  it('handler defaults to the drag element', () => {
    const el = makeFakeEl();
    const doc = makeFakeDoc();
    const ctrl = createDragMove({
      getElement: () => el as unknown as HTMLElement,
      ownerDocument: doc as unknown as Document,
    });
    ctrl.init();
    expect(el.count('mousedown')).toBe(1);
  });

  it('mousedown → move writes clamped style.top/left → up detaches', () => {
    const el = makeFakeEl({ offsetLeft: 10, offsetTop: 10 });
    const doc = makeFakeDoc();
    const ctrl = createDragMove({
      getElement: () => el as unknown as HTMLElement,
      ownerDocument: doc as unknown as Document,
    });
    ctrl.init();
    // pointer at (30,30); element at (10,10) → offset (20,20)
    el.fire('mousedown', me(30, 30));
    expect(ctrl.isDragging()).toBe(true);
    expect(doc.count('mousemove')).toBe(1);
    // move to (100, 80) → left=80, top=60
    doc.fire('mousemove', me(100, 80));
    expect(el.style.left).toBe('80px');
    expect(el.style.top).toBe('60px');
    doc.fire('mouseup', me(100, 80));
    expect(ctrl.isDragging()).toBe(false);
    expect(doc.count('mousemove')).toBe(0);
    expect(doc.count('mouseup')).toBe(0);
  });

  it('constrainer clamps the written position', () => {
    const constrainer = makeFakeEl({ offsetWidth: 200, offsetHeight: 200 });
    const el = makeFakeEl({
      offsetLeft: 0,
      offsetTop: 0,
      offsetWidth: 50,
      offsetHeight: 50,
      offsetParent: constrainer,
    });
    const doc = makeFakeDoc();
    const ctrl = createDragMove({
      getElement: () => el as unknown as HTMLElement,
      constrainer: () => constrainer as unknown as HTMLElement,
      ownerDocument: doc as unknown as Document,
    });
    ctrl.init();
    el.fire('mousedown', me(0, 0)); // offset (0,0)
    // drag far beyond → clamps to xMax=150, yMax=150
    doc.fire('mousemove', me(999, 999));
    expect(el.style.left).toBe('150px');
    expect(el.style.top).toBe('150px');
  });

  it('allowMove=false cancels the drag (no doc listeners, no move)', () => {
    const el = makeFakeEl();
    const doc = makeFakeDoc();
    const ctrl = createDragMove({
      getElement: () => el as unknown as HTMLElement,
      allowMove: () => false,
      ownerDocument: doc as unknown as Document,
    });
    ctrl.init();
    el.fire('mousedown', me(10, 10));
    expect(ctrl.isDragging()).toBe(false);
    expect(doc.count('mousemove')).toBe(0);
  });

  it('customMove is called instead of writing style', () => {
    const el = makeFakeEl({ offsetLeft: 0, offsetTop: 0 });
    const doc = makeFakeDoc();
    const custom = vi.fn();
    const ctrl = createDragMove({
      getElement: () => el as unknown as HTMLElement,
      customMove: custom,
      ownerDocument: doc as unknown as Document,
    });
    ctrl.init();
    el.fire('mousedown', me(0, 0));
    doc.fire('mousemove', me(40, 25));
    expect(custom).toHaveBeenCalledWith(el, 25, 40); // (element, top, left)
    expect(el.style.left).toBeUndefined();
  });

  it('allowInputDrag=false ignores drags from input/textarea targets', () => {
    const el = makeFakeEl();
    const doc = makeFakeDoc();
    const ctrl = createDragMove({
      getElement: () => el as unknown as HTMLElement,
      ownerDocument: doc as unknown as Document,
    });
    ctrl.init();
    el.fire('mousedown', me(10, 10, { tagName: 'INPUT' }));
    expect(ctrl.isDragging()).toBe(false);
    expect(doc.count('mousemove')).toBe(0);
  });

  it('allowInputDrag=true permits drags from input targets', () => {
    const el = makeFakeEl();
    const doc = makeFakeDoc();
    const ctrl = createDragMove({
      getElement: () => el as unknown as HTMLElement,
      allowInputDrag: true,
      ownerDocument: doc as unknown as Document,
    });
    ctrl.init();
    el.fire('mousedown', me(10, 10, { tagName: 'INPUT' }));
    expect(ctrl.isDragging()).toBe(true);
  });

  it('onStart/onMove/onEnd fire with clamped payload', () => {
    const el = makeFakeEl({ offsetLeft: 0, offsetTop: 0 });
    const doc = makeFakeDoc();
    const onStart = vi.fn();
    const onMove = vi.fn();
    const onEnd = vi.fn();
    const ctrl = createDragMove({
      getElement: () => el as unknown as HTMLElement,
      onStart,
      onMove,
      onEnd,
      ownerDocument: doc as unknown as Document,
    });
    ctrl.init();
    el.fire('mousedown', me(0, 0));
    expect(onStart).toHaveBeenCalledOnce();
    doc.fire('mousemove', me(15, 25));
    expect(onMove).toHaveBeenCalledWith(25, 15, expect.anything(), el);
    doc.fire('mouseup', me(15, 25));
    expect(onEnd).toHaveBeenCalledOnce();
  });

  it('touch drag: touchstart → touchmove writes position → touchend detaches', () => {
    const el = makeFakeEl({ offsetLeft: 5, offsetTop: 5 });
    const doc = makeFakeDoc();
    const ctrl = createDragMove({
      getElement: () => el as unknown as HTMLElement,
      ownerDocument: doc as unknown as Document,
    });
    ctrl.init();
    el.fire('touchstart', te(25, 25)); // offset (20,20)
    expect(doc.count('touchmove')).toBe(1);
    doc.fire('touchmove', te(60, 50));
    expect(el.style.left).toBe('40px');
    expect(el.style.top).toBe('30px');
    doc.fire('touchend', te(60, 50));
    expect(doc.count('touchmove')).toBe(0);
    expect(doc.count('touchend')).toBe(0);
  });

  it('destroy detaches start + live document listeners (unmount safety net)', () => {
    const el = makeFakeEl();
    const doc = makeFakeDoc();
    const ctrl = createDragMove({
      getElement: () => el as unknown as HTMLElement,
      ownerDocument: doc as unknown as Document,
    });
    ctrl.init();
    el.fire('mousedown', me(10, 10));
    expect(doc.count('mousemove')).toBe(1);
    ctrl.destroy();
    expect(el.count('mousedown')).toBe(0);
    expect(doc.count('mousemove')).toBe(0);
    expect(ctrl.isDragging()).toBe(false);
  });

  it('init throws when the drag element is missing', () => {
    const ctrl = createDragMove({ getElement: () => null });
    expect(() => ctrl.init()).toThrow(/drag element/);
  });
});
