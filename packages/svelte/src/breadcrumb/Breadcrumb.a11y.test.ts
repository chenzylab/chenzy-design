// Breadcrumb a11y：DOM 镜像 Semi 扁平结构——nav[aria-label] > 直接放扁平 span/a（无 ol/li 列表）；
//  最后一项 aria-current=page（不可点）。
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
  it('routes 模式：nav[aria-label] > 扁平 span/a（无 ol/li），无 axe violations', async () => {
    const { container } = renderWithLocale(Breadcrumb, { props: { routes } });
    const nav = container.querySelector('nav.cd-breadcrumb');
    expect(nav).not.toBeNull();
    expect(nav?.getAttribute('aria-label')).toBeTruthy();
    // DOM 镜像 Semi 扁平结构：容器与项均为 span，无 ol/li 列表语义。
    const list = container.querySelector('span.cd-breadcrumb-list');
    expect(list).not.toBeNull();
    expect(list?.tagName.toLowerCase()).toBe('span');
    expect(container.querySelector('ol')).toBeNull();
    expect(container.querySelector('li')).toBeNull();
    const items = container.querySelectorAll('span.cd-breadcrumb-item');
    expect(items).toHaveLength(3);
    await expectNoAxeViolations(container);
  });

  it('最后一项为当前页：aria-current=page，且非链接', async () => {
    const { container } = renderWithLocale(Breadcrumb, { props: { routes } });
    const current = container.querySelector('[aria-current="page"]');
    expect(current?.textContent?.trim()).toBe('Data');
    expect(current?.tagName.toLowerCase()).toBe('span');
    // 前序项为可点链接。
    expect(container.querySelectorAll('a.cd-breadcrumb-item-link')).toHaveLength(2);
    await expectNoAxeViolations(container);
  });

  it('字符串 routes 归一化为 name（对齐 Semi）', async () => {
    const { container } = renderWithLocale(Breadcrumb, {
      props: { routes: ['Home', 'Library', 'Data'] },
    });
    const items = container.querySelectorAll('span.cd-breadcrumb-item');
    expect(items).toHaveLength(3);
    expect(items[0]?.textContent?.trim()).toContain('Home');
    // 末项当前页。
    expect(container.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('Data');
  });

  it("moreType='default'（默认）折叠：三点触发器带 aria-expanded", async () => {
    const many: BreadcrumbRoute[] = [
      { name: 'A', href: '#' },
      { name: 'B', href: '#' },
      { name: 'C', href: '#' },
      { name: 'D', href: '#' },
      { name: 'E' },
    ];
    const { container } = renderWithLocale(Breadcrumb, { props: { routes: many, maxItemCount: 3 } });
    const more = container.querySelector('.cd-breadcrumb-more');
    expect(more).not.toBeNull();
    // default 模式为 disclosure：有 aria-expanded，非 haspopup。
    expect(more?.getAttribute('aria-expanded')).toBe('false');
    expect(more?.getAttribute('aria-haspopup')).toBeNull();
    // 三点图标：IconMore（对齐 Semi），渲染为 .cd-icon-more。
    expect(more?.querySelector('.cd-icon-more')).not.toBeNull();
    await expectNoAxeViolations(container);
  });

  it("moreType='popover' 折叠：三点触发器 aria-haspopup=menu", async () => {
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
    const more = container.querySelector('.cd-breadcrumb-more');
    expect(more?.getAttribute('aria-haspopup')).toBe('menu');
  });

  it("showTooltip ellipsisPos='middle'：截断元素保留完整 name 作 aria-label", async () => {
    const longRoutes: BreadcrumbRoute[] = [
      { name: '首页', href: '#' },
      { name: '一个非常非常非常长会被中间省略的标题' },
    ];
    const { container } = renderWithLocale(Breadcrumb, {
      props: { routes: longRoutes, showTooltip: { ellipsisPos: 'middle' } },
    });
    // 两个 middle wrap：首项(链接)、末项(当前页)。验证末项长标题的可访问名保留完整。
    const midInners = container.querySelectorAll('.cd-breadcrumb-ellipsis-wrap-middle [aria-label]');
    expect(midInners).toHaveLength(2);
    const currentInner = container.querySelector(
      '.cd-breadcrumb-ellipsis-wrap-middle .cd-breadcrumb-current[aria-label]',
    );
    // jsdom 无布局，不截断文本；但可访问名（完整 name）与 middle 结构必须就位。
    expect(currentInner?.getAttribute('aria-label')).toBe('一个非常非常非常长会被中间省略的标题');
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
    // 省略号存在且可点展开。
    const more = container.querySelector('.cd-breadcrumb-collapse');
    expect(more).not.toBeNull();
  });

  it('点击「…」就地展开全部项', async () => {
    const { container } = renderWithLocale(
      BreadcrumbCollapseFixture as unknown as Component<Record<string, unknown>>,
      { props: { maxItemCount: 3 } },
    );
    await Promise.resolve();
    await tick();
    const more = container.querySelector<HTMLElement>('.cd-breadcrumb-collapse');
    more?.click();
    await tick();
    const texts = [...container.querySelectorAll('.cd-breadcrumb-item')].map((e) =>
      e.textContent?.trim(),
    );
    expect(texts).toContain('一级');
    expect(texts).toContain('二级');
    expect(container.querySelector('.cd-breadcrumb-collapse')).toBeNull();
  });

  it('项数未超 maxItemCount 时不折叠（无回归）', async () => {
    const { container } = renderWithLocale(
      BreadcrumbCollapseFixture as unknown as Component<Record<string, unknown>>,
      { props: { maxItemCount: 10 } },
    );
    await Promise.resolve();
    await tick();
    expect(container.querySelector('.cd-breadcrumb-collapse')).toBeNull();
    const texts = [...container.querySelectorAll('.cd-breadcrumb-item')].map((e) =>
      e.textContent?.trim(),
    );
    expect(texts).toEqual(['首页', '一级', '二级', '三级', '详情页']);
  });
});
