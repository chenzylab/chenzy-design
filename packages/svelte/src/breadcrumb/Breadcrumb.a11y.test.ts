// Breadcrumb a11y：DOM 严格对齐 Semi semi-ui/breadcrumb（index.tsx + item.tsx）——
//  nav.cd-breadcrumb-wrapper > item-wrap span（无 ol/li 列表）；aria-current=page 挂在
//  item-wrap（对齐 Semi render() pageLabel），项本体不可点。
//  - routes 数据驱动模式（无需声明式 snippet）。
// jsdom 只断言静态 ARIA + axe。
import { describe, it, expect } from 'vitest';
import { tick, type Component } from 'svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Breadcrumb from './Breadcrumb.svelte';
import BreadcrumbCollapseFixture from './BreadcrumbCollapseFixture.svelte';
import type { BreadcrumbRoute } from './types.js';

const routes: BreadcrumbRoute[] = [
  { name: 'Home', href: '/' },
  { name: 'Library', href: '/library' },
  { name: 'Data' },
];

describe('Breadcrumb a11y', () => {
  it('routes 模式：nav.cd-breadcrumb-wrapper > item-wrap span（无 ol/li），无 axe violations', async () => {
    const { container } = renderWithLocale(Breadcrumb, { props: { routes } });
    const nav = container.querySelector('nav.cd-breadcrumb-wrapper');
    expect(nav).not.toBeNull();
    expect(nav?.getAttribute('aria-label')).toBeTruthy();
    // DOM 镜像 Semi 扁平结构：无 ol/li 列表语义，每项一个 item-wrap span。
    expect(container.querySelector('ol')).toBeNull();
    expect(container.querySelector('li')).toBeNull();
    const wraps = container.querySelectorAll('.cd-breadcrumb-item-wrap');
    expect(wraps).toHaveLength(3);
    const items = container.querySelectorAll('.cd-breadcrumb-item');
    expect(items).toHaveLength(3);
    await expectNoAxeViolations(container);
  });

  it('最后一项为当前页：aria-current=page 挂在 item-wrap，本体为不可点 span', async () => {
    const { container } = renderWithLocale(Breadcrumb, { props: { routes } });
    const currentWrap = container.querySelector('[aria-current="page"]');
    expect(currentWrap).not.toBeNull();
    expect(currentWrap?.classList.contains('cd-breadcrumb-item-wrap')).toBe(true);
    const currentItem = currentWrap?.querySelector('.cd-breadcrumb-item');
    expect(currentItem?.tagName.toLowerCase()).toBe('span');
    expect(currentItem?.textContent?.trim()).toBe('Data');
    // 前序项为可点链接（item-link class + a 标签）。
    expect(container.querySelectorAll('a.cd-breadcrumb-item-link')).toHaveLength(2);
    await expectNoAxeViolations(container);
  });

  it('字符串 routes 归一化为 name（对齐 Semi）', async () => {
    const { container } = renderWithLocale(Breadcrumb, {
      props: { routes: ['Home', 'Library', 'Data'] },
    });
    const items = container.querySelectorAll('.cd-breadcrumb-item');
    expect(items).toHaveLength(3);
    expect(items[0]?.textContent?.trim()).toContain('Home');
    expect(container.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('Data');
  });

  it("moreType='default'（默认）折叠：触发器 role=button + aria-label", async () => {
    const many: BreadcrumbRoute[] = [
      { name: 'A', href: '#' },
      { name: 'B', href: '#' },
      { name: 'C', href: '#' },
      { name: 'D', href: '#' },
      { name: 'E' },
    ];
    const { container } = renderWithLocale(Breadcrumb, { props: { routes: many, maxItemCount: 3 } });
    const more = container.querySelector('.cd-breadcrumb-item-more');
    expect(more).not.toBeNull();
    // 对齐 Semi handleCollapse：role=button + tabIndex=0 + aria-label，无 aria-expanded/haspopup。
    expect(more?.getAttribute('role')).toBe('button');
    expect(more?.getAttribute('tabindex')).toBe('0');
    expect(more?.getAttribute('aria-label')).toBeTruthy();
    // 三点图标：IconMore（对齐 Semi），渲染为 .cd-icon-more。
    expect(more?.querySelector('.cd-icon-more')).not.toBeNull();
    await expectNoAxeViolations(container);
  });

  it("moreType='popover' 折叠：三点触发器同一套 item-more 结构，内容由 Popover 包裹 IconMore（对齐 Semi renderPopoverMore）", async () => {
    const many: BreadcrumbRoute[] = [
      { name: 'A', href: '#' },
      { name: 'B', href: '#' },
      { name: 'C', href: '#' },
      { name: 'D', href: '#' },
      { name: 'E' },
    ];
    const { container } = renderWithLocale(Breadcrumb, {
      props: { routes: many, maxItemCount: 3, moreType: 'popover' },
    });
    const more = container.querySelector('.cd-breadcrumb-item-more');
    expect(more).not.toBeNull();
    expect(more?.querySelector('.cd-tooltip-trigger')).not.toBeNull();
    expect(more?.querySelector('.cd-icon-more')).not.toBeNull();
  });

  it('showTooltip 开启：项文本经 Typography.Text 渲染（对齐 Semi renderBreadItem）', async () => {
    const longRoutes: BreadcrumbRoute[] = [
      { name: '首页', href: '#' },
      { name: '一个非常非常非常长会被中间省略的标题' },
    ];
    const { container } = renderWithLocale(Breadcrumb, {
      props: { routes: longRoutes, showTooltip: { ellipsisPos: 'middle' } },
    });
    // item-title 内为 Typography.Text 渲染产物（cd-typography class）。
    const titles = container.querySelectorAll('.cd-breadcrumb-item-title .cd-typography');
    expect(titles.length).toBeGreaterThanOrEqual(2);
    expect(container.querySelector('[aria-current="page"]')?.textContent).toContain('一个非常非常非常长会被中间省略的标题');
    await expectNoAxeViolations(container);
  });
});

describe('Breadcrumb 声明式折叠（对齐 Semi children + maxItemCount）', () => {
  it('声明式 <Breadcrumb.Item> 超出 maxItemCount 时中间折叠为「…」', async () => {
    const { container } = renderWithLocale(
      BreadcrumbCollapseFixture as unknown as Component<Record<string, unknown>>,
      { props: { maxItemCount: 3 } },
    );
    await Promise.resolve();
    await tick();
    // 5 项、max=3 → 保留首项 + 「…」+ 末 2 项（对齐 Semi slice(1, len-max+1)）。
    const texts = [...container.querySelectorAll('.cd-breadcrumb-item')].map((e) =>
      e.textContent?.trim(),
    );
    expect(texts).toContain('首页');
    expect(texts).toContain('三级');
    expect(texts).toContain('详情页');
    // 中间项被折叠，自身不渲染。
    expect(texts).not.toContain('一级');
    expect(texts).not.toContain('二级');
    // 折叠触发器存在。
    const more = container.querySelector('.cd-breadcrumb-item-more');
    expect(more).not.toBeNull();
  });

  it('点击「…」就地展开全部项', async () => {
    const { container } = renderWithLocale(
      BreadcrumbCollapseFixture as unknown as Component<Record<string, unknown>>,
      { props: { maxItemCount: 3 } },
    );
    await Promise.resolve();
    await tick();
    const more = container.querySelector<HTMLElement>('.cd-breadcrumb-item-more');
    more?.click();
    await tick();
    const texts = [...container.querySelectorAll('.cd-breadcrumb-item')].map((e) =>
      e.textContent?.trim(),
    );
    expect(texts).toContain('一级');
    expect(texts).toContain('二级');
    expect(container.querySelector('.cd-breadcrumb-item-more')).toBeNull();
  });

  it('项数未超 maxItemCount 时不折叠（无回归）', async () => {
    const { container } = renderWithLocale(
      BreadcrumbCollapseFixture as unknown as Component<Record<string, unknown>>,
      { props: { maxItemCount: 10 } },
    );
    await Promise.resolve();
    await tick();
    expect(container.querySelector('.cd-breadcrumb-item-more')).toBeNull();
    const texts = [...container.querySelectorAll('.cd-breadcrumb-item')].map((e) =>
      e.textContent?.trim(),
    );
    expect(texts).toEqual(['首页', '一级', '二级', '三级', '详情页']);
  });
});
