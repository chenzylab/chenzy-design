// Nav a11y 专项：axe 0 violations + menu/menuitem 语义、原生 <a>、折叠按钮的无障碍语义。
// Nav 对齐 Semi：根为纯 <div>（无 nav landmark），列表 ul[role=menu][aria-orientation]，项 role=menuitem。
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
  { itemKey: 'api', text: 'API', link: 'https://example.com/api', linkOptions: { target: '_blank' } },
];

describe('Nav a11y', () => {
  it('vertical：ul[role=menu][aria-orientation=vertical] + menuitem，无 axe violations', async () => {
    const { container } = renderWithLocale(Nav, {
      props: { mode: 'vertical', items, defaultOpenKeys: ['sub'], defaultSelectedKeys: ['home'] },
    });
    const menu = container.querySelector('.cd-nav__list[role="menu"]');
    expect(menu).not.toBeNull();
    expect(menu?.getAttribute('aria-orientation')).toBe('vertical');
    expect(container.querySelector('[role="menuitem"]')).not.toBeNull();
    await expectNoAxeViolations(container);
  });

  it('horizontal：ul[role=menu][aria-orientation=horizontal]，无 axe violations', async () => {
    const { container } = renderWithLocale(Nav, {
      props: { mode: 'horizontal', items, defaultSelectedKeys: ['home'] },
    });
    const menu = container.querySelector('.cd-nav__list[role="menu"]');
    expect(menu).not.toBeNull();
    expect(menu?.getAttribute('aria-orientation')).toBe('horizontal');
    await expectNoAxeViolations(container);
  });

  it('折叠态：collapseButton 渲染 Button（含 aria-label），无 axe violations', async () => {
    const { container } = renderWithLocale(Nav, {
      props: { mode: 'vertical', items, isCollapsed: true, footer: { collapseButton: true } },
    });
    const wrap = container.querySelector('.cd-nav__collapse-btn');
    expect(wrap).not.toBeNull();
    const btn = wrap?.querySelector('button');
    expect(btn).not.toBeNull();
    // 折叠态 icon-only 按钮带 aria-label（展开文案）。
    expect(btn?.getAttribute('aria-label')).toBeTruthy();
    await expectNoAxeViolations(container);
  });

  it('带链接项：叶子渲染原生 <a href>，无 axe violations', async () => {
    const { container } = renderWithLocale(Nav, {
      props: { mode: 'vertical', items: linkItems },
    });
    const links = container.querySelectorAll('a[href]');
    expect(links.length).toBeGreaterThanOrEqual(2);
    // 外链 target=_blank / rel 经 NavItemDef.linkOptions 透传（对齐 Semi linkOptions）
    expect(container.querySelector('a[target="_blank"]')).not.toBeNull();
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
