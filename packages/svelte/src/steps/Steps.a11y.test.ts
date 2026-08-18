// Steps a11y：组合式 <Steps><Steps.Step/></Steps> —— 容器/每步均为裸 div（严格对齐 Semi，
// 无 ol/li 列表语义、无 nav 地标包裹）。每步固定 aria-current="step"（不区分是否为当前步，对齐 Semi）。
// 可点击态对齐 Semi：fill/basic 型 + onChange 时步骤 tabIndex=0 + onKeyDown 处理 Enter；
// 非原生 button 语义；nav 型不可交互。
import { describe, it, expect, vi } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import StepsA11yFixture from './StepsA11yFixture.svelte';

describe('Steps a11y', () => {
  it('默认渲染：div 结构 + 每步 aria-current=step，无 axe violations', async () => {
    const { container } = renderWithLocale(StepsA11yFixture, {
      props: { current: 1 },
    });
    expect(container.querySelectorAll('.cd-steps-item')).toHaveLength(3);
    expect(container.querySelectorAll('[aria-current="step"]')).toHaveLength(3);
    await expectNoAxeViolations(container);
  });

  it('basic 型 + onChange：步骤可点（tabIndex=0），无 axe violations', async () => {
    const { container } = renderWithLocale(StepsA11yFixture, {
      props: { type: 'basic', current: 0, onChange: vi.fn() },
    });
    const items = container.querySelectorAll<HTMLElement>('.cd-steps-item');
    expect(items).toHaveLength(3);
    items.forEach((el) => expect(el.tabIndex).toBe(0));
    await expectNoAxeViolations(container);
  });

  it('nav 型：无 onClick/onChange 语义包裹差异，无 axe violations', async () => {
    const { container } = renderWithLocale(StepsA11yFixture, {
      props: { type: 'nav', current: 0, onChange: vi.fn() },
    });
    expect(container.querySelectorAll('.cd-steps-item')).toHaveLength(3);
    await expectNoAxeViolations(container);
  });
});
