// CardGroup a11y：根 role=group + 可选 aria-label；children 网格渲染 + spacing。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Fixture from './CardGroupA11yFixture.svelte';

describe('CardGroup a11y', () => {
  it('根 role=group + aria-label，子 Card 网格渲染，无 axe violations', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { ariaLabel: 'Card wall' },
    });
    const group = container.querySelector('.cd-card-group');
    expect(group?.getAttribute('role')).toBe('group');
    expect(group?.getAttribute('aria-label')).toBe('Card wall');
    // grid 排布类
    expect(group?.classList.contains('cd-card-group--grid')).toBe(true);
    // 两张子卡片渲染
    expect(container.querySelectorAll('.cd-card').length).toBe(2);
    await expectNoAxeViolations(container);
  });

  it('spacing=number：column/row gap 变量统一', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { spacing: 24 },
    });
    const group = container.querySelector('.cd-card-group') as HTMLElement;
    expect(group.style.getPropertyValue('--cd-cardgroup-column-gap').trim()).toBe('24px');
    expect(group.style.getPropertyValue('--cd-cardgroup-row-gap').trim()).toBe('24px');
  });

  it('spacing=[x,y]：水平/垂直分别取值', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { spacing: [8, 32] },
    });
    const group = container.querySelector('.cd-card-group') as HTMLElement;
    expect(group.style.getPropertyValue('--cd-cardgroup-column-gap').trim()).toBe('8px');
    expect(group.style.getPropertyValue('--cd-cardgroup-row-gap').trim()).toBe('32px');
  });
});
