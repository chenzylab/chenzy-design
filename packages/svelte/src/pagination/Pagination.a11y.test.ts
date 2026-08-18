// Pagination a11y：分页器，严格对齐 Semi Design DOM 结构（<ul>/<li role="button">，
// 硬编码英文 aria-label，无 nav 地标、无原生 disabled、无 roving tabindex）。
//
// 不做 axe 0-violations 断言：Semi 源码本身对这套结构有真实的已知 axe 违规
// （<ul> 直接含 [role=button]/span 等非 <li> 子元素、<li role="button"> 脱离
// listitem 语境、jumper InputNumber 无 aria-label），严格对齐路线下不在本库
// "室内"修复，仅断言与 Semi 一致的结构/文本/属性。
import { describe, it, expect } from 'vitest';
import { renderWithLocale } from '../test-utils/a11y.js';
import Pagination from './Pagination.svelte';

describe('Pagination a11y（结构对齐 Semi）', () => {
  it('默认渲染：<ul> 根节点，无 nav 地标（对齐 Semi <ul className={prefixCls}>）', () => {
    const { container } = renderWithLocale(Pagination, {
      props: { total: 100 },
    });
    expect(container.querySelector('nav')).toBeNull();
    const root = container.querySelector('ul.cd-page');
    expect(root).not.toBeNull();
  });

  it('prev/next 为 li[role=button]，硬编码英文 aria-label（对齐 Semi）', () => {
    const { container } = renderWithLocale(Pagination, {
      props: { total: 100 },
    });
    const prev = container.querySelector('.cd-page-prev');
    const next = container.querySelector('.cd-page-next');
    expect(prev?.getAttribute('role')).toBe('button');
    expect(prev?.getAttribute('aria-label')).toBe('Previous');
    expect(next?.getAttribute('role')).toBe('button');
    expect(next?.getAttribute('aria-label')).toBe('Next');
  });

  it('当前页 aria-current=page', () => {
    const { container } = renderWithLocale(Pagination, {
      props: { total: 100, defaultCurrentPage: 3 },
    });
    const current = container.querySelector('[aria-current="page"]');
    expect(current).not.toBeNull();
    expect(current?.textContent?.trim()).toContain('3');
    expect(current?.getAttribute('aria-label')).toBe('Page 3');
  });

  it('showTotal 渲染总页数文案', () => {
    const { container } = renderWithLocale(Pagination, {
      props: {
        total: 200,
        pageSize: 20,
        showTotal: true,
      },
    });
    expect(container.querySelector('.cd-page-total')).not.toBeNull();
  });

  // 内置 Select 的可访问名硬编码英文（对齐 Semi aria-label="Page size selector"）。
  it('showSizeChanger 内置 Select 有硬编码 aria-label', () => {
    const { container } = renderWithLocale(Pagination, {
      props: { total: 200, pageSize: 20, showSizeChanger: true },
    });
    const combobox = container.querySelector('[role="combobox"]');
    expect(combobox?.getAttribute('aria-label')).toBe('Page size selector');
  });

  it('showQuickJumper 渲染 InputNumber（hideButtons，对齐 Semi）', () => {
    const { container } = renderWithLocale(Pagination, {
      props: { total: 200, pageSize: 20, showQuickJumper: true },
    });
    expect(container.querySelector('.cd-page-quickjump')).not.toBeNull();
    expect(container.querySelector('[role="spinbutton"]')).not.toBeNull();
  });

  // disabled：整体禁用容器类 + 页码/prev/next 均带 disabled 类 + aria-disabled（对齐 Semi，非原生 disabled）。
  it('disabled：容器 --disabled 类 + 页码/prev/next 视觉禁用态', () => {
    const { container } = renderWithLocale(Pagination, {
      props: { total: 100, disabled: true },
    });
    expect(container.querySelector('.cd-page-disabled')).not.toBeNull();
    const pages = container.querySelectorAll('.cd-page-item.cd-page-item-all-disabled');
    expect(pages.length).toBeGreaterThan(0);
    expect(container.querySelector('.cd-page-prev')?.getAttribute('aria-disabled')).toBe('true');
    expect(container.querySelector('.cd-page-next')?.getAttribute('aria-disabled')).toBe('true');
  });
});
