// Breadcrumb a11y：nav[aria-label] 包裹 <ol> 列表；最后一项 aria-current=page（不可点）。
//  - routes 数据驱动模式（无需声明式 snippet）。
// jsdom 只断言静态 ARIA + axe。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Breadcrumb from './Breadcrumb.svelte';
import type { BreadcrumbRoute } from './types.js';

const routes: BreadcrumbRoute[] = [
  { label: 'Home', href: '/' },
  { label: 'Library', href: '/library' },
  { label: 'Data' },
];

describe('Breadcrumb a11y', () => {
  it('routes 模式：nav[aria-label] + ol 列表，无 axe violations', async () => {
    const { container } = renderWithLocale(Breadcrumb, { props: { routes } });
    const nav = container.querySelector('nav.cd-breadcrumb');
    expect(nav).not.toBeNull();
    expect(nav?.getAttribute('aria-label')).toBeTruthy();
    expect(container.querySelector('ol.cd-breadcrumb__list')).not.toBeNull();
    expect(container.querySelectorAll('li.cd-breadcrumb__item')).toHaveLength(3);
    await expectNoAxeViolations(container);
  });

  it('最后一项为当前页：aria-current=page，且非链接', async () => {
    const { container } = renderWithLocale(Breadcrumb, { props: { routes } });
    const current = container.querySelector('[aria-current="page"]');
    expect(current?.textContent?.trim()).toBe('Data');
    expect(current?.tagName.toLowerCase()).toBe('span');
    // 前序项为可点链接。
    expect(container.querySelectorAll('a.cd-breadcrumb__link')).toHaveLength(2);
    await expectNoAxeViolations(container);
  });
});
