// Menu a11y：数据驱动导航菜单。
// 容器 ul[role=menu]（horizontal 为 menubar），叶子 button[role=menuitem]，
// 单选选中项 aria-current=true，多选叶子 role=menuitemcheckbox + aria-checked。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Menu from './Menu.svelte';

const items = [
  { key: 'home', label: 'Home' },
  { key: 'profile', label: 'Profile' },
  { key: 'settings', label: 'Settings' },
];

describe('Menu a11y', () => {
  it('默认渲染：role=menu + menuitem，无 axe violations', async () => {
    const { container } = renderWithLocale(Menu, {
      props: { items, ariaLabel: 'Main menu' },
    });
    const menu = container.querySelector('[role="menu"]');
    expect(menu).not.toBeNull();
    expect(menu?.getAttribute('aria-label')).toBe('Main menu');
    const menuitems = container.querySelectorAll('[role="menuitem"]');
    expect(menuitems.length).toBe(3);
    await expectNoAxeViolations(container);
  });

  it('单选选中态：选中叶子 aria-current=true', async () => {
    const { container } = renderWithLocale(Menu, {
      props: { items, ariaLabel: 'Nav', defaultSelectedKeys: ['profile'] },
    });
    const current = container.querySelector('[role="menuitem"][aria-current="true"]');
    expect(current?.textContent).toContain('Profile');
    await expectNoAxeViolations(container);
  });

  it('horizontal 模式：容器 role=menubar', async () => {
    const { container } = renderWithLocale(Menu, {
      props: { items, ariaLabel: 'Top', mode: 'horizontal' },
    });
    expect(container.querySelector('[role="menubar"]')).not.toBeNull();
    await expectNoAxeViolations(container);
  });

  it('multiple：叶子 role=menuitemcheckbox + aria-checked', async () => {
    const { container } = renderWithLocale(Menu, {
      props: { items, ariaLabel: 'Multi', multiple: true, defaultSelectedKeys: ['home'] },
    });
    const checkboxes = container.querySelectorAll('[role="menuitemcheckbox"]');
    expect(checkboxes.length).toBe(3);
    const checked = container.querySelector('[role="menuitemcheckbox"][aria-checked="true"]');
    expect(checked?.textContent).toContain('Home');
    await expectNoAxeViolations(container);
  });
});
