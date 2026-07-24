// BackTop a11y：回到顶部悬浮按钮（严格对齐 Semi）。
//  - 外层 div.cd-back-top 为可点击容器，内部 IconButton 承担按钮语义/可访问名（locale BackTop.ariaLabel），仅 visible 时在 DOM。
//  - jsdom 无真实滚动几何：直接派发一次 scroll 事件把 scrollTop 顶过阈值，等 rAF 后按钮入 DOM。
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import BackTop from './BackTop.svelte';

/** 等一帧 rAF（组件 scroll 回调经 rAF 节流写入 visible）。 */
function nextFrame(): Promise<void> {
  return new Promise((r) => requestAnimationFrame(() => r()));
}

/** 令 window.scrollY 超过阈值并派发 scroll。 */
async function scrollWindowPast(y: number): Promise<void> {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
  window.dispatchEvent(new Event('scroll'));
  await nextFrame();
}

describe('BackTop a11y', () => {
  it('滚过阈值后渲染 div.cd-back-top，内部 IconButton 有 locale 可访问名，无 axe violations', async () => {
    const { container } = renderWithLocale(BackTop, { props: { visibilityHeight: 100 } });
    await scrollWindowPast(200);

    // 对齐 Semi：外层 div.cd-back-top 为可点击容器，真实按钮语义/可访问名由内部 IconButton 承担。
    const wrap = container.querySelector('.cd-back-top');
    expect(wrap).not.toBeNull();
    const btn = wrap?.querySelector('button');
    expect(btn).not.toBeNull();
    const label = btn?.getAttribute('aria-label');
    expect(label).toBeTruthy();
    expect(label).not.toBe('BackTop.ariaLabel');
    await expectNoAxeViolations(container);
  });

  it('未超过阈值时不渲染（对齐 Semi 返回 null）', async () => {
    const { container } = renderWithLocale(BackTop, { props: { visibilityHeight: 100 } });
    await scrollWindowPast(0);
    expect(container.querySelector('.cd-back-top')).toBeNull();
  });
});

// 点击回顶行为（jsdom 的 rAF 是 polyfill，正常推进——不受真实浏览器标签 document.hidden 冻结影响）。
async function flushFrames(n = 120): Promise<void> {
  for (let i = 0; i < n; i++) await nextFrame();
}

describe('BackTop 点击回顶', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('duration<=0：点击后同步把 window 滚回顶部（scrollTo(0,0)）', async () => {
    Object.defineProperty(window, 'scrollY', { value: 300, configurable: true });
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    const { container } = renderWithLocale(BackTop, {
      props: { visibilityHeight: 100, duration: 0 },
    });
    await scrollWindowPast(300);

    const wrap = container.querySelector('.cd-back-top') as HTMLElement;
    expect(wrap).not.toBeNull();
    wrap.click();

    expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
  });

  it('duration>0：点击后经缓动逐帧把 window 滚回顶部，末态为 0 且单调不增', async () => {
    Object.defineProperty(window, 'scrollY', { value: 300, configurable: true });
    const positions: number[] = [];
    vi.spyOn(window, 'scrollTo').mockImplementation((_x?: unknown, y?: unknown) => {
      if (typeof y === 'number') positions.push(y);
    });

    const { container } = renderWithLocale(BackTop, {
      props: { visibilityHeight: 100, duration: 200 },
    });
    await scrollWindowPast(300);

    (container.querySelector('.cd-back-top') as HTMLElement).click();
    await flushFrames();

    expect(positions.length).toBeGreaterThan(1);
    expect(positions[0]).toBeLessThanOrEqual(300);
    expect(positions[positions.length - 1]).toBe(0);
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i]).toBeLessThanOrEqual(positions[i - 1]!);
    }
  });

  it('自定义 target 容器：点击后把该容器 scrollTop 缓动回 0', async () => {
    const box = document.createElement('div');
    let scrollTopVal = 300;
    const writes: number[] = [];
    Object.defineProperty(box, 'scrollTop', {
      configurable: true,
      get: () => scrollTopVal,
      set: (v: number) => {
        scrollTopVal = v;
        writes.push(v);
      },
    });
    document.body.appendChild(box);

    const { container } = renderWithLocale(BackTop, {
      props: { visibilityHeight: 100, duration: 200, target: () => box },
    });
    box.dispatchEvent(new Event('scroll'));
    await nextFrame();

    const wrap = container.querySelector('.cd-back-top') as HTMLElement;
    expect(wrap).not.toBeNull();
    wrap.click();
    await flushFrames();

    expect(writes.length).toBeGreaterThan(0);
    expect(writes[writes.length - 1]).toBe(0);
    expect(box.scrollTop).toBe(0);

    document.body.removeChild(box);
  });

  it('onClick 回调在点击时触发', async () => {
    Object.defineProperty(window, 'scrollY', { value: 300, configurable: true });
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const onClick = vi.fn();

    const { container } = renderWithLocale(BackTop, {
      props: { visibilityHeight: 100, duration: 0, onClick },
    });
    await scrollWindowPast(300);

    (container.querySelector('.cd-back-top') as HTMLElement).click();
    expect(onClick).toHaveBeenCalledOnce();
  });
});
