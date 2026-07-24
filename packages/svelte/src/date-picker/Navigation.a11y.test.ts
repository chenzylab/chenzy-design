/**
 * Navigation 结构/交互测试 —— 对齐 Semi navigation.tsx。
 * 断言：div.-navigation > 4 个 IconButton（复用本库 IconButton）+ 中间 -month>Button(monthText)；
 * aria-label（Previous/Next year/month）；点击回调；bimonth 同步时按 panelType 隐藏一侧。
 */
import { describe, it, expect, vi } from 'vitest';
import { renderWithLocale } from '../test-utils/a11y.js';
import Navigation from './Navigation.svelte';

const PREFIX = 'cd-datepicker';

describe('Navigation 结构对齐 Semi', () => {
  it('div.-navigation + 4 IconButton（aria-label）+ 中间 -month（monthText）', () => {
    const { container } = renderWithLocale(Navigation, {
      props: { monthText: '2026-01' },
    });
    const nav = container.querySelector(`.${PREFIX}-navigation`);
    expect(nav).not.toBeNull();
    // 只取按钮上的 aria-label（图标 svg 亦有 aria-label=图标名，但带 aria-hidden 被遮蔽，与 Semi 一致）。
    const labels = Array.from(nav!.querySelectorAll('button[aria-label]')).map((el) =>
      el.getAttribute('aria-label'),
    );
    expect(labels).toEqual(['Previous year', 'Previous month', 'Next month', 'Next year']);
    const monthBox = container.querySelector(`.${PREFIX}-navigation-month`);
    expect(monthBox?.textContent).toContain('2026-01');
  });

  it('点击箭头触发对应回调', async () => {
    const onPrevYear = vi.fn();
    const onNextMonth = vi.fn();
    const { container } = renderWithLocale(Navigation, {
      props: { monthText: '2026-01', onPrevYear, onNextMonth },
    });
    (container.querySelector('button[aria-label="Previous year"]') as HTMLElement)?.click();
    (container.querySelector('button[aria-label="Next month"]') as HTMLElement)?.click();
    expect(onPrevYear).toHaveBeenCalledTimes(1);
    expect(onNextMonth).toHaveBeenCalledTimes(1);
  });

  it('bimonth 同步 + 左面板：右侧按钮 visibility:hidden（保位）', () => {
    const { container } = renderWithLocale(Navigation, {
      props: { monthText: '2026-01', shouldBimonthSwitch: true, panelType: 'left' },
    });
    // 左面板隐藏“下月/下一年”（右侧）按钮（浏览器规范化为 'visibility: hidden'）。
    const nextMonth = container.querySelector('button[aria-label="Next month"]') as HTMLElement;
    expect(nextMonth.style.visibility).toBe('hidden');
    const prevYear = container.querySelector('button[aria-label="Previous year"]') as HTMLElement;
    expect(prevYear.style.visibility).not.toBe('hidden');
  });
});
