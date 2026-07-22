import { describe, expect, it, vi } from 'vitest';
import {
  arrayMove,
  computeTargetIndex,
  computeItemTransforms,
  createSortable,
  type SortableRect,
} from './sortable.js';

// ---------------------------------------------------------------------------
// Geometry — pure
// ---------------------------------------------------------------------------

describe('arrayMove', () => {
  it('moves an element forward, preserving length + elements', () => {
    expect(arrayMove(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
  });

  it('moves an element backward', () => {
    expect(arrayMove(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c']);
  });

  it('preserves length for every from/to pair (row-count guard)', () => {
    const list = [0, 1, 2, 3, 4, 5];
    for (let from = 0; from < list.length; from++) {
      for (let to = 0; to < list.length; to++) {
        expect(arrayMove(list, from, to)).toHaveLength(list.length);
      }
    }
  });

  it('result is a permutation of the input (no element lost or duplicated)', () => {
    const list = ['a', 'b', 'c', 'd', 'e'];
    for (let from = 0; from < list.length; from++) {
      for (let to = 0; to < list.length; to++) {
        const out = arrayMove(list, from, to);
        expect([...out].sort()).toEqual([...list].sort());
      }
    }
  });

  it('from === to returns an equivalent (copied) array', () => {
    const list = ['a', 'b', 'c'];
    const out = arrayMove(list, 1, 1);
    expect(out).toEqual(list);
    expect(out).not.toBe(list);
  });

  it('out-of-range indices do not throw and preserve elements', () => {
    const list = ['a', 'b', 'c'];
    expect(arrayMove(list, -1, 2)).toEqual(list);
    expect(arrayMove(list, 0, 9)).toEqual(list);
    expect(arrayMove(list, 5, 5)).toEqual(list);
  });

  it('does not mutate the input', () => {
    const list = ['a', 'b', 'c'];
    arrayMove(list, 0, 2);
    expect(list).toEqual(['a', 'b', 'c']);
  });
});

const rects = (heights: number[]): SortableRect[] => {
  let top = 0;
  return heights.map((height) => {
    const r = { top, height };
    top += height;
    return r;
  });
};

describe('computeTargetIndex', () => {
  it('returns the row whose midline the pointer center is above', () => {
    const r = rects([50, 50, 50, 50]); // tops 0,50,100,150; midlines 25,75,125,175
    expect(computeTargetIndex(10, r, 0)).toBe(0);
    expect(computeTargetIndex(60, r, 0)).toBe(1);
    expect(computeTargetIndex(130, r, 0)).toBe(3);
  });

  it('clamps above the first row to 0 and below the last row to count-1', () => {
    const r = rects([50, 50, 50]);
    expect(computeTargetIndex(-100, r, 1)).toBe(0);
    expect(computeTargetIndex(9999, r, 1)).toBe(2);
  });

  it('handles unequal heights', () => {
    const r = rects([30, 80, 40]); // tops 0,30,110; midlines 15,70,130
    expect(computeTargetIndex(10, r, 0)).toBe(0);
    expect(computeTargetIndex(50, r, 0)).toBe(1);
    expect(computeTargetIndex(120, r, 0)).toBe(2);
  });

  it('empty rects returns 0', () => {
    expect(computeTargetIndex(10, [], 0)).toBe(0);
  });
});

describe('computeItemTransforms', () => {
  const r = rects([50, 50, 50, 50]);

  it('dragged row follows the pointer delta', () => {
    const out = computeItemTransforms(0, 0, 17, r);
    expect(out[0]).toBe(17);
  });

  it('target > active: rows (active, target] shift up by active height', () => {
    const out = computeItemTransforms(0, 2, 40, r);
    expect(out).toEqual([40, -50, -50, 0]);
  });

  it('target < active: rows [target, active) shift down by active height', () => {
    const out = computeItemTransforms(3, 1, -40, r);
    expect(out).toEqual([0, 50, 50, -40]);
  });

  it('target == active: only the dragged row moves', () => {
    const out = computeItemTransforms(1, 1, 12, r);
    expect(out).toEqual([0, 12, 0, 0]);
  });

  it('always returns one entry per row', () => {
    expect(computeItemTransforms(0, 3, 5, r)).toHaveLength(r.length);
  });

  it('out-of-range active index returns all zeros', () => {
    expect(computeItemTransforms(9, 0, 5, r)).toEqual([0, 0, 0, 0]);
  });
});

// ---------------------------------------------------------------------------
// createSortable — lifecycle (fake document + fake container/items)
// ---------------------------------------------------------------------------

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

function makeFakeContainer() {
  const l = new Map<string, Set<(e: unknown) => void>>();
  return {
    getBoundingClientRect: () => ({ top: 0 }),
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

// Fake rows at 50px tall each, stacked from top 0.
const makeItems = (count: number, height = 50) =>
  Array.from({ length: count }, (_, i) => ({
    getBoundingClientRect: () => ({ top: i * height, height }),
  }));

const pe = (clientY: number) =>
  ({ clientY, preventDefault: () => {} }) as unknown as PointerEvent;

function setup(count = 4) {
  const doc = makeFakeDoc();
  const container = makeFakeContainer();
  const items = makeItems(count);
  const applyTransforms = vi.fn();
  const clearTransforms = vi.fn();
  const onReorder = vi.fn();
  const onDragStart = vi.fn();
  const onDragEnd = vi.fn();
  const onDragCancel = vi.fn();
  const ctrl = createSortable({
    getContainer: () => container as unknown as HTMLElement,
    getItemElement: (i) => (items[i] as unknown as HTMLElement) ?? null,
    getItemCount: () => items.length,
    resolveIndexFromEvent: () => resolveIdx,
    activationDistance: 5,
    applyTransforms,
    clearTransforms,
    onReorder,
    onDragStart,
    onDragEnd,
    onDragCancel,
    ownerDocument: doc as unknown as Document,
  });
  let resolveIdx = 0;
  ctrl.init();
  return {
    doc,
    container,
    ctrl,
    applyTransforms,
    clearTransforms,
    onReorder,
    onDragStart,
    onDragEnd,
    onDragCancel,
    setResolveIdx: (i: number) => {
      resolveIdx = i;
    },
  };
}

describe('createSortable lifecycle', () => {
  it('does not start a drag before the activation distance', () => {
    const t = setup();
    t.setResolveIdx(0);
    t.container.fire('pointerdown', pe(100));
    t.doc.fire('pointermove', pe(102)); // moved 2 < 5
    expect(t.onDragStart).not.toHaveBeenCalled();
    expect(t.applyTransforms).not.toHaveBeenCalled();
    expect(t.ctrl.isDragging()).toBe(false);
  });

  it('starts the drag once past the activation distance (onDragStart once)', () => {
    const t = setup();
    t.setResolveIdx(0);
    t.container.fire('pointerdown', pe(100));
    t.doc.fire('pointermove', pe(110));
    t.doc.fire('pointermove', pe(120));
    expect(t.onDragStart).toHaveBeenCalledTimes(1);
    expect(t.onDragStart).toHaveBeenCalledWith(0);
    expect(t.applyTransforms).toHaveBeenCalled();
    expect(t.ctrl.isDragging()).toBe(true);
  });

  it('ignores pointerdown when resolveIndexFromEvent returns -1', () => {
    const t = setup();
    t.setResolveIdx(-1);
    t.container.fire('pointerdown', pe(100));
    expect(t.doc.count('pointermove')).toBe(0);
  });

  it('drop with a changed target fires onReorder(from,to) once, after clearTransforms', () => {
    const t = setup();
    t.setResolveIdx(0);
    const order: string[] = [];
    t.clearTransforms.mockImplementation(() => order.push('clear'));
    t.onReorder.mockImplementation(() => order.push('reorder'));
    t.container.fire('pointerdown', pe(0));
    t.doc.fire('pointermove', pe(130)); // dragged row 0 center 25+130=155 → target 3
    t.doc.fire('pointerup', pe(130));
    expect(t.onReorder).toHaveBeenCalledTimes(1);
    expect(t.onReorder).toHaveBeenCalledWith(0, 3);
    expect(order).toEqual(['clear', 'reorder']);
    expect(t.onDragEnd).toHaveBeenCalledWith(0, 3);
  });

  it('drop with unchanged target does NOT fire onReorder but still fires onDragEnd', () => {
    const t = setup();
    t.setResolveIdx(0);
    // Row 0 center is 25. Drag upward past the activation distance: activeCenter
    // stays below row 0's own midline, so target remains 0 (unchanged).
    t.container.fire('pointerdown', pe(25));
    t.doc.fire('pointermove', pe(15)); // delta -10 → activeCenter 15 (< midline 25) → target 0
    t.doc.fire('pointerup', pe(15));
    expect(t.onReorder).not.toHaveBeenCalled();
    expect(t.onDragEnd).toHaveBeenCalledTimes(1);
    expect(t.onDragEnd).toHaveBeenCalledWith(0, 0);
  });

  it('Escape cancels: clearTransforms + onDragCancel, no onReorder', () => {
    const t = setup();
    t.setResolveIdx(0);
    t.container.fire('pointerdown', pe(0));
    t.doc.fire('pointermove', pe(130));
    t.doc.fire('keydown', { key: 'Escape' });
    expect(t.onDragCancel).toHaveBeenCalledTimes(1);
    expect(t.clearTransforms).toHaveBeenCalled();
    expect(t.onReorder).not.toHaveBeenCalled();
    expect(t.ctrl.isDragging()).toBe(false);
  });

  it('releases all document listeners on drop (no leak)', () => {
    const t = setup();
    t.setResolveIdx(0);
    t.container.fire('pointerdown', pe(0));
    t.doc.fire('pointermove', pe(130));
    expect(t.doc.count('pointermove')).toBe(1);
    expect(t.doc.count('pointerup')).toBe(1);
    expect(t.doc.count('keydown')).toBe(1);
    t.doc.fire('pointerup', pe(130));
    expect(t.doc.count('pointermove')).toBe(0);
    expect(t.doc.count('pointerup')).toBe(0);
    expect(t.doc.count('keydown')).toBe(0);
  });

  it('does not accumulate document listeners across repeated drags', () => {
    const t = setup();
    t.setResolveIdx(0);
    for (let k = 0; k < 3; k++) {
      t.container.fire('pointerdown', pe(0));
      t.doc.fire('pointermove', pe(130));
      t.doc.fire('pointerup', pe(130));
    }
    expect(t.doc.count('pointermove')).toBe(0);
    expect(t.doc.count('keydown')).toBe(0);
  });

  it('destroy() detaches the container listener and any live document listeners', () => {
    const t = setup();
    t.setResolveIdx(0);
    t.container.fire('pointerdown', pe(0));
    t.doc.fire('pointermove', pe(130));
    t.ctrl.destroy();
    expect(t.container.count('pointerdown')).toBe(0);
    expect(t.doc.count('pointermove')).toBe(0);
    expect(t.doc.count('pointerup')).toBe(0);
  });
});
