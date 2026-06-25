// Dropdown a11y：触发器 role=button（aria-haspopup=menu/expanded/controls），
// 浮层菜单 portal 到 document.body（use:floating），role=menu + role=menuitem。
// 参照 Modal.a11y.test.ts：浮层在 document.body 全局查询并扫描。
// 不测真实键盘 roving/hover（jsdom 限制，受控 open 强制打开再断言静态 ARIA）。
// 经 DropdownA11yFixture 渲染（不经 LocaleHarness：harness 注入的 children 会命中
// Dropdown 的 {#if children} 分支而跳过 items 渲染）。
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { expectNoAxeViolations } from '../test-utils/a11y.js';
import Fixture from './DropdownA11yFixture.svelte';

const ITEMS = [
  { key: 'edit', label: 'Edit' },
  { key: 'dup', label: 'Duplicate' },
  { type: 'divider' as const },
  { key: 'del', label: 'Delete', disabled: true },
];

describe('Dropdown a11y', () => {
  it('默认（收起）：触发器 role=button + aria-haspopup=menu，无 axe violations', async () => {
    const { container } = render(Fixture, { props: { items: ITEMS } });
    const trigger = container.querySelector('.cd-dropdown__trigger');
    expect(trigger?.getAttribute('role')).toBe('button');
    expect(trigger?.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    await expectNoAxeViolations(container);
  });

  it('open=true：菜单 role=menu（aria-labelledby 指向触发器）+ role=menuitem，无 axe violations', async () => {
    render(Fixture, { props: { items: ITEMS, open: true, trigger: 'click' } });

    // 菜单 portal 到 body —— 全局查询。
    const menu = document.querySelector('[role="menu"]') as HTMLElement | null;
    expect(menu).not.toBeNull();

    // aria-labelledby 指向触发器 id，且该元素存在。
    const labelledby = menu?.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();
    expect(labelledby ? document.getElementById(labelledby) : null).not.toBeNull();

    const items = document.querySelectorAll('[role="menuitem"]');
    expect(items.length).toBe(3);

    await expectNoAxeViolations(document.body);
  });
});
