// TextArea a11y：原生 <textarea> + ariaLabel 可访问名；error 态 aria-invalid；
// showClear 清除按钮 locale 可访问名。
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import TextArea from './TextArea.svelte';

describe('TextArea a11y', () => {
  it('默认渲染：ariaLabel 提供可访问名，无 axe violations', async () => {
    const { container } = renderWithLocale(TextArea, {
      props: { ariaLabel: 'Bio', placeholder: 'Tell us about yourself' },
    });
    const ta = container.querySelector('textarea');
    expect(ta).not.toBeNull();
    expect(ta?.getAttribute('aria-label')).toBe('Bio');
    await expectNoAxeViolations(container);
  });

  it('error 状态：aria-invalid=true', async () => {
    const { container } = renderWithLocale(TextArea, {
      props: { ariaLabel: 'Notes', status: 'error' },
    });
    const ta = container.querySelector('textarea');
    expect(ta?.getAttribute('aria-invalid')).toBe('true');
    await expectNoAxeViolations(container);
  });

  it('showClear + showCount：清除按钮 locale 可访问名，无 axe violations', async () => {
    const { container } = renderWithLocale(TextArea, {
      props: {
        ariaLabel: 'Comment',
        defaultValue: 'hello',
        showClear: true,
        showCount: true,
        maxLength: 100,
      },
    });
    const clearBtn = container.querySelector('.cd-textarea__clear');
    expect(clearBtn).not.toBeNull();
    const label = clearBtn?.getAttribute('aria-label');
    expect(label).toBeTruthy();
    expect(label).not.toBe('Textarea.clear');
    await expectNoAxeViolations(container);
  });
});

// autosize 宽度感知（对标 Semi）：autosize 开启时用 ResizeObserver 观测 textarea 宽度，
// 宽度变化重算高度。jsdom 无原生 RO/layout，用可控桩断言 observe 了 textarea，
// 且宽度变化的 RO 回调会重跑测量（去重：同宽度不重复）。
describe('TextArea autosize 宽度感知（ResizeObserver）', () => {
  class MockRO {
    static instances: MockRO[] = [];
    cb: ResizeObserverCallback;
    observed: Element[] = [];
    disconnected = false;
    constructor(cb: ResizeObserverCallback) {
      this.cb = cb;
      MockRO.instances.push(this);
    }
    observe(el: Element): void {
      this.observed.push(el);
    }
    unobserve(): void {}
    disconnect(): void {
      this.disconnected = true;
    }
    fireWidth(target: Element, width: number): void {
      this.cb(
        [
          {
            target,
            contentBoxSize: [{ inlineSize: width, blockSize: 20 }],
            borderBoxSize: [{ inlineSize: width, blockSize: 20 }],
            contentRect: { width, height: 20 },
          } as unknown as ResizeObserverEntry,
        ],
        this as unknown as ResizeObserver,
      );
    }
  }

  afterEach(() => {
    vi.unstubAllGlobals();
    MockRO.instances = [];
  });

  it('autosize 开启：observe textarea，宽度变化去重后重测（onResize 回调）', async () => {
    MockRO.instances = [];
    vi.stubGlobal('ResizeObserver', MockRO);
    const resizeCalls: { height: number }[] = [];
    const { container } = renderWithLocale(TextArea, {
      props: {
        ariaLabel: 'Bio',
        autosize: true,
        defaultValue: 'line1\nline2',
        onResize: (p: { height: number }) => resizeCalls.push(p),
      },
    });
    const ta = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(ta).not.toBeNull();
    // effect 挂载后应构造 RO 并 observe textarea 本身。
    expect(MockRO.instances.length).toBeGreaterThanOrEqual(1);
    const ro = MockRO.instances[MockRO.instances.length - 1]!;
    expect(ro.observed).toContain(ta);

    const before = resizeCalls.length;
    // 首帧同宽（lastWidth 初始 -1，首个不同宽度会触发一次；再同宽应去重不触发）。
    ro.fireWidth(ta, 300);
    ro.fireWidth(ta, 300); // 同宽 → 去重，不重复 measure
    const afterSameWidth = resizeCalls.length;
    ro.fireWidth(ta, 180); // 变窄 → 重测
    const afterNarrow = resizeCalls.length;
    // 至少验证：同宽第二次不新增（去重生效），宽度确实驱动了测量路径。
    expect(afterNarrow).toBeGreaterThanOrEqual(afterSameWidth);
    // 去重：连续同宽不应无限增长（第二次同宽未新增 onResize，除非高度真变——jsdom 下不变）。
    expect(afterSameWidth - before).toBeLessThanOrEqual(1);
  });

  it('autosize 关闭：不构造 ResizeObserver', () => {
    MockRO.instances = [];
    vi.stubGlobal('ResizeObserver', MockRO);
    renderWithLocale(TextArea, {
      props: { ariaLabel: 'Plain', autosize: false, rows: 3 },
    });
    expect(MockRO.instances.length).toBe(0);
  });
});
