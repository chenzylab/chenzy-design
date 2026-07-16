// BackTop a11y：回到顶部悬浮按钮（严格对齐 Semi）。
//  - 外层 div.cd-back-top 为可点击容器，内部 IconButton 承担按钮语义/可访问名（locale BackTop.ariaLabel），仅 visible 时在 DOM。
//  - jsdom 无真实滚动几何：直接派发一次 scroll 事件把 scrollTop 顶过阈值，等 rAF 后按钮入 DOM。
import { describe, it, expect } from 'vitest';
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
