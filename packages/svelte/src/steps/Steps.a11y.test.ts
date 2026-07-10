// Steps a11y：<ol> 步骤列表；当前步 aria-current=step；nav 型外包 nav[aria-label]。
//  - 视觉隐藏的状态文本（.cd-sr-only）令颜色非唯一信息载体（WCAG 1.4.1）。
//  - 可点击态对齐 Semi：fill/basic 型 + onChange 时步骤为原生 button；nav 型不可交互。
// jsdom 只断言静态 ARIA + axe（roving 键盘留给真实浏览器）。
import { describe, it, expect, vi } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Steps from './Steps.svelte';
import type { StepItem } from './types.js';

const steps: StepItem[] = [
  { title: 'Start' },
  { title: 'Verify' },
  { title: 'Done' },
];

describe('Steps a11y', () => {
  it('默认渲染：ol 列表 + 当前步 aria-current=step，无 axe violations', async () => {
    const { container } = renderWithLocale(Steps, {
      props: { steps, current: 1 },
    });
    expect(container.querySelector('ol.cd-steps')).not.toBeNull();
    expect(container.querySelectorAll('li.cd-steps__item')).toHaveLength(3);
    const current = container.querySelector('[aria-current="step"]');
    expect(current).not.toBeNull();
    // 每步含视觉隐藏状态文本（颜色非唯一信息载体）。
    expect(container.querySelectorAll('.cd-sr-only').length).toBeGreaterThan(0);
    await expectNoAxeViolations(container);
  });

  it('basic 型 + onChange：步骤为可点 button，无 axe violations', async () => {
    const { container } = renderWithLocale(Steps, {
      props: { steps, type: 'basic', current: 0, onChange: vi.fn() },
    });
    expect(container.querySelectorAll('button.cd-steps__head')).toHaveLength(3);
    await expectNoAxeViolations(container);
  });

  it('nav 型：外包 nav[aria-label]，不可交互（无 button），无 axe violations', async () => {
    const { container } = renderWithLocale(Steps, {
      props: { steps, type: 'nav', current: 0, onChange: vi.fn() },
    });
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    expect(nav?.getAttribute('aria-label')).toBeTruthy();
    // nav 型不可交互：即便传 onChange 也不渲染 button（对齐 Semi）。
    expect(container.querySelectorAll('button.cd-steps__head')).toHaveLength(0);
    await expectNoAxeViolations(container);
  });
});
