// Nav 行为 + a11y：Nav 独立渲染（不依赖 Menu），header/footer/折叠/选中/展开/多选。
// 命名 *.a11y.test.ts 进入 dom(jsdom) project。
import { describe, it, expect, vi } from 'vitest';
import { tick } from 'svelte';
import { renderWithLocale } from '../test-utils/a11y.js';
import Nav from './Nav.svelte';
import NavDeclarativeFixture from './NavDeclarativeFixture.svelte';
import { collectNavItemsByKeys, collectAncestorKeys } from './types.js';

const items = [
  { itemKey: 'home', text: '首页' },
  { itemKey: 'tasks', text: '任务', items: [{ itemKey: 'a', text: '任务A' }] },
];

describe('Nav 项树辅助（selectedItems / 祖先高亮）', () => {
  it('collectNavItemsByKeys：按 key 收集 Nav 形节点（含嵌套）', () => {
    const got = collectNavItemsByKeys(items, ['home', 'a']);
    expect(got.map((i) => i.itemKey).sort()).toEqual(['a', 'home']);
    expect(got.find((i) => i.itemKey === 'a')).toMatchObject({ text: '任务A' });
  });

  it('collectAncestorKeys：选中子项时返回父级 SubNav key', () => {
    expect(collectAncestorKeys(items, ['a'])).toEqual(['tasks']);
    expect(collectAncestorKeys(items, ['home'])).toEqual([]);
  });
});

describe('Nav 渲染（对齐 Semi）', () => {
  it('vertical：根为 div.cd-nav + ul[role=menu] + 导航项', () => {
    const { container } = renderWithLocale(Nav, { props: { mode: 'vertical', items } });
    const root = container.querySelector('.cd-nav');
    expect(root).not.toBeNull();
    // 对齐 Semi：根为纯 <div>（无 nav landmark）。
    expect(root?.tagName).toBe('DIV');
    expect(container.querySelector('nav')).toBeNull();
    expect(container.querySelector('.cd-nav__list[role="menu"]')).not.toBeNull();
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
    // 收起按钮为 div.cd-nav__collapse-btn 内的 Button。
    const wrap = container.querySelector('.cd-nav__collapse-btn');
    expect(wrap).not.toBeNull();
    const btn = wrap?.querySelector<HTMLButtonElement>('button');
    expect(btn).not.toBeNull();
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

  it('items string 简写：string 子项取值作 text 与 itemKey（对齐 Semi）', () => {
    const shorthandItems = [
      { itemKey: 'job', text: '任务平台', items: ['任务管理', '用户任务查询'] },
    ];
    const { container } = renderWithLocale(Nav, {
      props: { mode: 'vertical', items: shorthandItems, defaultOpenKeys: ['job'] },
    });
    const text = container.querySelector('.cd-nav__list-wrapper')?.textContent ?? '';
    expect(text).toContain('任务管理');
    expect(text).toContain('用户任务查询');
  });
});

describe('Nav 声明式写法（Nav.Item / Nav.Sub）', () => {
  it('收集子组件构建导航树，挂载后异步渲染（无自循环）', async () => {
    const { container } = renderWithLocale(NavDeclarativeFixture, {});
    // 声明式项经 microtask bump 异步渲染，等一拍。
    await Promise.resolve();
    await tick();
    const body = container.querySelector('.cd-nav__list-wrapper')!;
    const text = body.textContent ?? '';
    expect(text).toContain('首页');
    expect(text).toContain('管理');
    // 展开的子项也在（defaultOpenKeys=['mgmt']）
    expect(text).toContain('用户');
    expect(text).toContain('角色');
  });
});

describe('Nav 交互回调与新增透传（对齐 Semi）', () => {
  it('onClick/onSelect：点击叶子项触发，富载荷含 itemKey/selectedKeys/domEvent（对齐 Semi）', async () => {
    const onClick = vi.fn();
    const onSelect = vi.fn();
    const { container } = renderWithLocale(Nav, {
      props: { mode: 'vertical', items, onClick, onSelect },
    });
    const leaf = container.querySelector<HTMLElement>('.cd-nav__list .cd-nav__item-normal');
    leaf?.click();
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ itemKey: 'home', selectedKeys: ['home'], isOpen: false }),
    );
    // selectedItems 为 Nav 形（含 text 字段）
    expect(onSelect.mock.calls[0]?.[0].selectedItems[0]).toMatchObject({ itemKey: 'home', text: '首页' });
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ itemKey: 'home', isOpen: false }));
  });

  it('multiple + onDeselect：再次点击已选项触发 onDeselect', async () => {
    const onSelect = vi.fn();
    const onDeselect = vi.fn();
    const { container } = renderWithLocale(Nav, {
      props: { mode: 'vertical', items, multiple: true, onSelect, onDeselect },
    });
    const leaf = container.querySelector<HTMLElement>('.cd-nav__list .cd-nav__item-normal');
    leaf?.click();
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ itemKey: 'home' }));
    leaf?.click();
    expect(onDeselect).toHaveBeenCalledWith(expect.objectContaining({ itemKey: 'home' }));
  });

  it('项级 onClick：NavItemDef.onClick 点击时触发', () => {
    const itemOnClick = vi.fn();
    const localItems = [{ itemKey: 'home', text: '首页', onClick: itemOnClick }];
    const { container } = renderWithLocale(Nav, {
      props: { mode: 'vertical', items: localItems },
    });
    const leaf = container.querySelector<HTMLElement>('.cd-nav__list .cd-nav__item-normal');
    leaf?.click();
    expect(itemOnClick).toHaveBeenCalledOnce();
  });

  it('subNavMotion=true：展开的内联子菜单带 motion 类；false 时无', () => {
    const open = renderWithLocale(Nav, {
      props: { mode: 'vertical', items, defaultOpenKeys: ['tasks'], subNavMotion: true },
    });
    expect(open.container.querySelector('.cd-nav__sub--motion')).not.toBeNull();

    const noMotion = renderWithLocale(Nav, {
      props: { mode: 'vertical', items, defaultOpenKeys: ['tasks'], subNavMotion: false },
    });
    expect(noMotion.container.querySelector('.cd-nav__sub--motion')).toBeNull();
    expect(noMotion.container.querySelector('.cd-nav__sub')).not.toBeNull();
  });
});
