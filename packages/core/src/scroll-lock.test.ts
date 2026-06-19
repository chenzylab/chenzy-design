import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { useScrollLock, __resetScrollLock } from './scroll-lock.js';

// node test env has no DOM; stub the minimal document/window surface useScrollLock touches.
function makeDom() {
  const body = { style: { overflow: '', paddingRight: '' } };
  return {
    document: {
      body,
      documentElement: { clientWidth: 1000 },
    },
    window: {
      innerWidth: 1000, // == clientWidth → no scrollbar compensation
      getComputedStyle: () => ({ paddingRight: '0px' }),
    },
  };
}

describe('useScrollLock', () => {
  let dom: ReturnType<typeof makeDom>;

  beforeEach(() => {
    __resetScrollLock();
    dom = makeDom();
    vi.stubGlobal('document', dom.document);
    vi.stubGlobal('window', dom.window);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('locks body overflow and releases it', () => {
    const release = useScrollLock();
    expect(dom.document.body.style.overflow).toBe('hidden');
    release();
    expect(dom.document.body.style.overflow).toBe('');
  });

  it('is reference-counted: nested locks unlock only at zero', () => {
    const r1 = useScrollLock();
    const r2 = useScrollLock();
    expect(dom.document.body.style.overflow).toBe('hidden');
    r1();
    expect(dom.document.body.style.overflow).toBe('hidden'); // still held by r2
    r2();
    expect(dom.document.body.style.overflow).toBe('');
  });

  it('release is idempotent', () => {
    const release = useScrollLock();
    release();
    release(); // no throw, no double-decrement
    expect(dom.document.body.style.overflow).toBe('');
  });

  it('restores the original overflow value', () => {
    dom.document.body.style.overflow = 'scroll';
    const release = useScrollLock();
    expect(dom.document.body.style.overflow).toBe('hidden');
    release();
    expect(dom.document.body.style.overflow).toBe('scroll');
  });
});
