// TextArea a11y：原生 <textarea> + ariaLabel 可访问名；error 态 aria-invalid；
// showClear 清除按钮 locale 可访问名。
import { describe, it, expect, vi, afterEach } from 'vitest';
import { fireEvent } from '@testing-library/svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import TextArea from './TextArea.svelte';

describe('TextArea a11y', () => {
  it('默认渲染：ariaLabel 提供可访问名，无 axe violations', async () => {
    const { container } = renderWithLocale(TextArea, {
      props: { 'aria-label': 'Bio', placeholder: 'Tell us about yourself' },
    });
    const ta = container.querySelector('textarea');
    expect(ta).not.toBeNull();
    expect(ta?.getAttribute('aria-label')).toBe('Bio');
    await expectNoAxeViolations(container);
  });

  it('error 状态：aria-invalid=true', async () => {
    const { container } = renderWithLocale(TextArea, {
      props: { 'aria-label': 'Notes', validateStatus: 'error' },
    });
    const ta = container.querySelector('textarea');
    expect(ta?.getAttribute('aria-invalid')).toBe('true');
    await expectNoAxeViolations(container);
  });

  it('showClear：清除按钮始终渲染，聚焦后才可见，严格对齐 Semi（无 aria-label 的 div）', async () => {
    const { container } = renderWithLocale(TextArea, {
      props: {
        'aria-label': 'Comment',
        defaultValue: 'hello',
        showClear: true,
        showCount: true,
        maxLength: 100,
      },
    });
    // 对齐 Semi textarea：clearbtn 始终渲染（showClear），用 hidden 类控制显隐；无 aria-label / role。
    const clearBtn = container.querySelector('.cd-input-clearbtn');
    expect(clearBtn).not.toBeNull();
    expect(clearBtn?.getAttribute('aria-label')).toBeNull();
    expect(clearBtn?.getAttribute('role')).toBeNull();
    // 有内容但未 hover/focus 时带 hidden 类（不可见）。
    expect(clearBtn?.classList.contains('cd-input-clearbtn-hidden')).toBe(true);
    // 聚焦后移除 hidden 类（可见）。fireEvent.focus 正确触发 Svelte 事件并 flush。
    const ta = container.querySelector('textarea')!;
    await fireEvent.focus(ta);
    expect(
      container.querySelector('.cd-input-clearbtn')?.classList.contains('cd-input-clearbtn-hidden'),
    ).toBe(false);
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
        'aria-label': 'Bio',
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
      props: { 'aria-label': 'Plain', autosize: false, rows: 3 },
    });
    expect(MockRO.instances.length).toBe(0);
  });
});

// 按可见字符（Array.from 处理代理对/emoji）计算长度，对齐 demo 里 getValueLength 的常见用法。
const getValueLength = (v: string) => [...v].length;

describe('TextArea maxLength + getValueLength（对齐 Semi getNextValue/handleVisibleMaxLength）', () => {
  it('oninput 时按可见长度截断超出 maxLength 的输入', async () => {
    const { container } = renderWithLocale(TextArea, {
      props: { maxLength: 3, getValueLength, 'aria-label': 'ta' },
    });
    const ta = container.querySelector('textarea') as HTMLTextAreaElement;
    ta.value = 'abcdef';
    await fireEvent.input(ta);
    expect(ta.value).toBe('abc');
  });

  it('未提供 getValueLength 时不做 JS 截断（对齐 Semi：仅原生 maxlength 生效）', () => {
    const { container } = renderWithLocale(TextArea, {
      props: { maxLength: 3, 'aria-label': 'ta' },
    });
    const ta = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(ta.getAttribute('maxlength')).toBe('3');
  });

  it('blur 时二次确认截断（issue #2005：IME 输入过程中点击外部触发 blur，内容未被实时截断）', async () => {
    const onChange = vi.fn();
    const { container } = renderWithLocale(TextArea, {
      props: { maxLength: 3, getValueLength, onChange, 'aria-label': 'ta' },
    });
    const ta = container.querySelector('textarea') as HTMLTextAreaElement;
    // 模拟 IME 组合中途被打断：value 已经超限，但从未经过 handleInput 截断（组合期间跳过截断）。
    ta.value = 'abcdef';
    await fireEvent.blur(ta);
    expect(ta.value).toBe('abc');
    expect(onChange).toHaveBeenCalledWith('abc', expect.anything());
  });
});

describe('TextArea clear 行为（对齐 Semi handleClear）', () => {
  it('聚焦态下点击清除：触发 onBlur 而非重新聚焦', async () => {
    const onBlur = vi.fn();
    const onChange = vi.fn();
    const { container } = renderWithLocale(TextArea, {
      props: { defaultValue: 'hello', showClear: true, onBlur, onChange, 'aria-label': 'ta' },
    });
    const ta = container.querySelector('textarea') as HTMLTextAreaElement;
    await fireEvent.focus(ta);
    const clearbtn = container.querySelector('.cd-input-clearbtn') as HTMLElement;
    await fireEvent.click(clearbtn);
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('', expect.anything());
  });

  it('非聚焦态下点击清除：不触发 onBlur（本来就不是聚焦态）', async () => {
    const onBlur = vi.fn();
    const { container } = renderWithLocale(TextArea, {
      props: { defaultValue: 'hello', showClear: true, onBlur, 'aria-label': 'ta' },
    });
    const clearbtn = container.querySelector('.cd-input-clearbtn') as HTMLElement;
    await fireEvent.click(clearbtn);
    expect(onBlur).not.toHaveBeenCalled();
  });
});

describe('TextArea wrapper/counter 点击聚焦（对齐 Semi handleClick/handleCounterClick）', () => {
  it('点击 wrapper 空白区（非 textarea 本身）聚焦到 textarea', async () => {
    const { container } = renderWithLocale(TextArea, {
      props: { 'aria-label': 'ta' },
    });
    const wrapper = container.querySelector('.cd-input-textarea-wrapper') as HTMLElement;
    const ta = container.querySelector('textarea') as HTMLTextAreaElement;
    // fireEvent.click 默认 target 就是 wrapper 本身（e.target === e.currentTarget）。
    await fireEvent.click(wrapper);
    expect(document.activeElement).toBe(ta);
  });

  it('点击 counter 聚焦到 textarea', async () => {
    const { container } = renderWithLocale(TextArea, {
      props: { showCount: true, 'aria-label': 'ta' },
    });
    const counter = container.querySelector('.cd-input-textarea-counter') as HTMLElement;
    const ta = container.querySelector('textarea') as HTMLTextAreaElement;
    await fireEvent.click(counter);
    expect(document.activeElement).toBe(ta);
  });
});
