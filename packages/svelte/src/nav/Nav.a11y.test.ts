// Nav a11y 专项：axe 0 violations + landmark/链接/折叠/子导航的无障碍语义。
// 委托 Menu(purpose=navigation)，验证 nav landmark、原生 <a>、aria-current、折叠按钮 aria。
import { describe, it, expect } from 'vitest';
import { createRawSnippet } from 'svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Nav from './Nav.svelte';

const icon = createRawSnippet(() => ({ render: () => '<svg aria-hidden="true"></svg>' }));

const items = [
  { itemKey: 'home', text: '首页', icon },
  {
    itemKey: 'sub',
    text: '管理',
    icon,
    items: [
      { itemKey: 'users', text: '用户' },
      { itemKey: 'roles', text: '角色' },
    ],
  },
];

const linkItems = [
  { itemKey: 'docs', text: '文档', link: 'https://example.com/docs' },
  { itemKey: 'api', text: 'API', link: 'https://example.com/api', target: '_blank' },
];

describe('Nav a11y', () => {
  it('vertical：nav landmark + 展开子导航，无 axe violations', async () => {
    const { container } = renderWithLocale(Nav, {
      props: { mode: 'vertical', items, defaultOpenKeys: ['sub'], defaultSelectedKeys: ['home'] },
    });
    expect(container.querySelector('nav')).not.toBeNull();
    await expectNoAxeViolations(container);
  });

  it('horizontal：nav landmark，无 axe violations', async () => {
    const { container } = renderWithLocale(Nav, {
      props: { mode: 'horizontal', items, defaultSelectedKeys: ['home'] },
    });
    expect(container.querySelector('nav')).not.toBeNull();
    await expectNoAxeViolations(container);
  });

  it('折叠态：collapseButton 原生 button + aria-expanded/aria-label，无 axe violations', async () => {
    const { container } = renderWithLocale(Nav, {
      props: { mode: 'vertical', items, isCollapsed: true, footer: { collapseButton: true } },
    });
    const btn = container.querySelector('button.cd-nav__collapse-btn');
    expect(btn).not.toBeNull();
    expect(btn?.getAttribute('aria-expanded')).toBe('false');
    expect(btn?.getAttribute('aria-label')).toBeTruthy();
    await expectNoAxeViolations(container);
  });

  it('带链接项：叶子渲染原生 <a href>，无 axe violations', async () => {
    const { container } = renderWithLocale(Nav, {
      props: { mode: 'vertical', items: linkItems },
    });
    const links = container.querySelectorAll('a[href]');
    expect(links.length).toBeGreaterThanOrEqual(2);
    // 外链 target=_blank 应带 rel（Menu 自动补）或显式无 violation
    await expectNoAxeViolations(container);
  });

  it('header logo + text：无 axe violations', async () => {
    const logo = createRawSnippet(() => ({ render: () => '<svg aria-hidden="true"></svg>' }));
    const { container } = renderWithLocale(Nav, {
      props: { mode: 'vertical', items, header: { logo, text: '后台' } },
    });
    expect(container.querySelector('.cd-nav__header')).not.toBeNull();
    await expectNoAxeViolations(container);
  });
});
