// BackTop a11y：回到顶部悬浮按钮。
//  - button[type=button] 带可访问名（ariaLabel 或 locale BackTop.ariaLabel）。
//  - announceOnArrive 时渲染视觉隐藏的 role=status / aria-live=polite live region。
// jsdom 只断言静态 ARIA + axe（scroll 显隐 / 回顶动画留给真实浏览器）。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import BackTop from './BackTop.svelte';

describe('BackTop a11y', () => {
  it('默认渲染：button 有 locale 可访问名，无 axe violations', async () => {
    const { container } = renderWithLocale(BackTop, {});
    const btn = container.querySelector('button.cd-backtop');
    expect(btn).not.toBeNull();
    expect(btn?.getAttribute('type')).toBe('button');
    // 缺省走 locale，应为非空可访问名（不是 key 原样）。
    const label = btn?.getAttribute('aria-label');
    expect(label).toBeTruthy();
    expect(label).not.toBe('BackTop.ariaLabel');
    await expectNoAxeViolations(container);
  });

  it('自定义 ariaLabel 覆盖可访问名', async () => {
    const { container } = renderWithLocale(BackTop, {
      props: { ariaLabel: 'Scroll to top' },
    });
    const btn = container.querySelector('button.cd-backtop');
    expect(btn?.getAttribute('aria-label')).toBe('Scroll to top');
    await expectNoAxeViolations(container);
  });

  it('announceOnArrive：渲染 role=status / aria-live=polite live region', async () => {
    const { container } = renderWithLocale(BackTop, {
      props: { announceOnArrive: true },
    });
    const live = container.querySelector('.cd-sr-only');
    expect(live?.getAttribute('role')).toBe('status');
    expect(live?.getAttribute('aria-live')).toBe('polite');
    await expectNoAxeViolations(container);
  });
});
