// Nav 行为 + a11y：委托 Menu(purpose=navigation) 渲染，新增 header/footer/折叠。
// 命名 *.a11y.test.ts 进入 dom(jsdom) project。
import { describe, it, expect, vi } from 'vitest';
import { tick } from 'svelte';
import { renderWithLocale } from '../test-utils/a11y.js';
import Nav from './Nav.svelte';
import NavDeclarativeFixture from './NavDeclarativeFixture.svelte';
import { navItemsToMenuItems } from './types.js';

const items = [
  { itemKey: 'home', text: '首页' },
  { itemKey: 'tasks', text: '任务', items: [{ itemKey: 'a', text: '任务A' }] },
];

describe('navItemsToMenuItems 映射（Semi 字段 → Menu 字段）', () => {
  it('itemKey→key、text→label、items→children、link→href', () => {
    const mapped = navItemsToMenuItems([
      { itemKey: 'x', text: '外链', link: 'https://a.com', target: '_blank' },
      { itemKey: 'p', text: '父', items: [{ itemKey: 'c', text: '子' }] },
    ]);
    expect(mapped[0]).toMatchObject({ key: 'x', label: '外链', href: 'https://a.com', target: '_blank' });
    const parent = mapped[1];
    if (!parent) throw new Error('expected mapped[1]');
    expect(parent.key).toBe('p');
    // children 仅普通项有；用类型守卫窄化
    if ('children' in parent && parent.children) {
      expect(parent.children[0]).toMatchObject({ key: 'c', label: '子' });
    } else {
      throw new Error('expected children on mapped parent');
    }
  });
});

describe('Nav 渲染（对齐 Semi）', () => {
  it('vertical：渲染 nav landmark + 导航项', () => {
    const { container } = renderWithLocale(Nav, { props: { mode: 'vertical', items } });
    expect(container.querySelector('.cd-nav')).not.toBeNull();
    // Menu purpose=navigation 渲染 <nav> landmark
    expect(container.querySelector('nav')).not.toBeNull();
    expect(container.textContent).toContain('首页');
  });

  it('header：渲染 logo 文案', () => {
    const { container } = renderWithLocale(Nav, {
      props: { items, header: { text: '后台' } },
    });
    expect(container.querySelector('.cd-nav__header')).not.toBeNull();
    expect(container.textContent).toContain('后台');
  });

  it('footer collapseButton：vertical 下渲染收起按钮，点击触发 onCollapseChange', async () => {
    const onCollapseChange = vi.fn();
    const { container } = renderWithLocale(Nav, {
      props: { mode: 'vertical', items, footer: { collapseButton: true }, onCollapseChange },
    });
    const btn = container.querySelector<HTMLButtonElement>('.cd-nav__collapse-btn');
    expect(btn).not.toBeNull();
    expect(btn?.getAttribute('aria-expanded')).toBe('true');
    btn?.click();
    expect(onCollapseChange).toHaveBeenCalledWith(true);
  });

  it('horizontal：collapseButton 不渲染（仅 vertical 生效）', () => {
    const { container } = renderWithLocale(Nav, {
      props: { mode: 'horizontal', items, footer: { collapseButton: true } },
    });
    expect(container.querySelector('.cd-nav__collapse-btn')).toBeNull();
  });

  it('受控 isCollapsed：根节点带 collapsed 修饰类', () => {
    const { container } = renderWithLocale(Nav, {
      props: { mode: 'vertical', items, isCollapsed: true },
    });
    expect(container.querySelector('.cd-nav--collapsed')).not.toBeNull();
  });
});

describe('Nav 声明式写法（Nav.Item / Nav.Sub）', () => {
  it('收集子组件构建导航树，挂载后异步渲染（无自循环）', async () => {
    const { container } = renderWithLocale(NavDeclarativeFixture, {});
    // 声明式项经 microtask bump 异步渲染，等一拍。
    await Promise.resolve();
    await tick();
    const body = container.querySelector('.cd-nav__body')!;
    const text = body.textContent ?? '';
    expect(text).toContain('首页');
    expect(text).toContain('管理');
    // 展开的子项也在（defaultOpenKeys=['mgmt']）
    expect(text).toContain('用户');
    expect(text).toContain('角色');
  });
});
