// Card a11y：有 title 时 role=region + aria-labelledby；ariaLabel 优先；loading 时 aria-busy。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Card from './Card.svelte';

describe('Card a11y', () => {
  it('带 title：role=region + aria-labelledby 指向标题，无 axe violations', async () => {
    const { container } = renderWithLocale(Card, {
      props: { title: 'User profile' },
    });
    const root = container.querySelector('.cd-card');
    expect(root?.getAttribute('role')).toBe('region');
    const labelledby = root?.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();
    const titleEl = labelledby ? container.querySelector(`#${labelledby}`) : null;
    expect(titleEl?.textContent).toContain('User profile');
    await expectNoAxeViolations(container);
  });

  it('显式 ariaLabel 时优先于 aria-labelledby，无 axe violations', async () => {
    const { container } = renderWithLocale(Card, {
      props: { title: 'User profile', ariaLabel: '用户卡片' },
    });
    const root = container.querySelector('.cd-card');
    expect(root?.getAttribute('role')).toBe('region');
    expect(root?.getAttribute('aria-label')).toBe('用户卡片');
    // ariaLabel 存在时不再关联 labelledby，避免双重命名
    expect(root?.getAttribute('aria-labelledby')).toBeNull();
    await expectNoAxeViolations(container);
  });

  it('无 title：不设 region 角色（避免无名地标），无 axe violations', async () => {
    const { container } = renderWithLocale(Card, {
      props: {},
    });
    const root = container.querySelector('.cd-card');
    expect(root?.getAttribute('role')).toBeNull();
    await expectNoAxeViolations(container);
  });

  it('loading：aria-busy=true，无 axe violations', async () => {
    const { container } = renderWithLocale(Card, {
      props: { title: 'Loading card', loading: true },
    });
    const root = container.querySelector('.cd-card');
    expect(root?.getAttribute('aria-busy')).toBe('true');
    await expectNoAxeViolations(container);
  });

  it('shadows=always：加 shadows 类，无 axe violations', async () => {
    const { container } = renderWithLocale(Card, {
      props: { title: 'Shadow card', shadows: 'always' },
    });
    const root = container.querySelector('.cd-card');
    expect(root?.classList.contains('cd-card--shadows')).toBe(true);
    expect(root?.classList.contains('cd-card--shadows-always')).toBe(true);
    await expectNoAxeViolations(container);
  });
});
