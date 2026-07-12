// CardGroup a11y：根（Space 元素）role=group + 可选 aria-label；基于 Space 的 gap 排布；type=grid 拼接。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Fixture from './CardGroupA11yFixture.svelte';

describe('CardGroup a11y', () => {
  it('根 role=group + aria-label，子 Card 渲染，无 axe violations', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { ariaLabel: 'Card wall' },
    });
    const group = container.querySelector('.cd-card-group');
    expect(group?.getAttribute('role')).toBe('group');
    expect(group?.getAttribute('aria-label')).toBe('Card wall');
    // 两张子卡片渲染
    expect(container.querySelectorAll('.cd-card').length).toBe(2);
    await expectNoAxeViolations(container);
  });

  it('默认 spacing=16：Space gap 为 16px', async () => {
    const { container } = renderWithLocale(Fixture, { props: {} });
    const group = container.querySelector('.cd-card-group') as HTMLElement;
    expect(group.style.cssText).toContain('gap: 16px');
    // 非网格型：不加 grid 类
    expect(group.classList.contains('cd-card-group--grid')).toBe(false);
  });

  it('spacing=number：统一 gap', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { spacing: 24 },
    });
    const group = container.querySelector('.cd-card-group') as HTMLElement;
    expect(group.style.cssText).toContain('gap: 24px');
  });

  it('spacing=[x,y]：水平/垂直分别取值（column/row gap）', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { spacing: [8, 32] },
    });
    const group = container.querySelector('.cd-card-group') as HTMLElement;
    expect(group.style.cssText).toContain('column-gap: 8px');
    expect(group.style.cssText).toContain('row-gap: 32px');
  });

  it('type=grid：加 grid 类且 Space gap 归 0（靠边框拼接）', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { type: 'grid', spacing: 24 },
    });
    const group = container.querySelector('.cd-card-group') as HTMLElement;
    expect(group.classList.contains('cd-card-group--grid')).toBe(true);
    // 网格型 spacing 被忽略，Space gap=0
    expect(group.style.cssText).toContain('gap: 0px');
  });
});
