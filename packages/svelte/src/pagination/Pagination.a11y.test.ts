// Pagination a11y：分页器。
// nav[aria-label] 包裹，页码为原生 button，当前页 aria-current=page。
//
// 修复记录：
//   1. showSizeChanger 内置 Select 现经 ariaLabel=Pagination.itemsPerPage 获可访问名。
//   2. showQuickJumper 跳页 Input 现经 ariaLabel=Pagination.jumpTo 获可访问名。
//   两处 axe aria-input-field-name / label 均消除。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Pagination from './Pagination.svelte';

describe('Pagination a11y', () => {
  it('默认渲染：nav landmark + 可访问名，无 axe violations', async () => {
    const { container } = renderWithLocale(Pagination, {
      props: { total: 100 },
    });
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    // aria-label 来自 locale 上下文，应非空（对齐 Semi 固定 aria-label）
    expect(nav?.getAttribute('aria-label')).toBeTruthy();
    await expectNoAxeViolations(container);
  });

  it('当前页 aria-current=page，无 axe violations', async () => {
    const { container } = renderWithLocale(Pagination, {
      props: { total: 100, defaultCurrentPage: 3 },
    });
    const current = container.querySelector('[aria-current="page"]');
    expect(current).not.toBeNull();
    expect(current?.textContent?.trim()).toContain('3');
    await expectNoAxeViolations(container);
  });

  it('showTotal，无 axe violations', async () => {
    const { container } = renderWithLocale(Pagination, {
      props: {
        total: 200,
        pageSize: 20,
        showTotal: true,
      },
    });
    expect(container.querySelector('.cd-page-total')).not.toBeNull();
    await expectNoAxeViolations(container);
  });

  // 内置 Select 经 ariaLabel=Pagination.itemsPerPage 获可访问名。
  it('showSizeChanger axe 0 violations（内置 Select 有 aria-label）', async () => {
    const { container } = renderWithLocale(Pagination, {
      props: { total: 200, pageSize: 20, showSizeChanger: true },
    });
    await expectNoAxeViolations(container);
  });

  // 跳页 input 经 ariaLabel=Pagination.jumpTo 获可访问名。
  it('showQuickJumper axe 0 violations（跳页 input 有 aria-label）', async () => {
    const { container } = renderWithLocale(Pagination, {
      props: { total: 200, pageSize: 20, showQuickJumper: true },
    });
    await expectNoAxeViolations(container);
  });

  // disabled：整体禁用容器类 + 所有页码/prev/next button 原生 disabled（视觉禁用态挂 :disabled 伪类）。
  it('disabled：容器 --disabled 类 + 页码/prev/next button 原生 disabled，axe 0 violations', async () => {
    const { container } = renderWithLocale(Pagination, {
      props: { total: 100, disabled: true },
    });
    // 整体禁用容器类
    expect(container.querySelector('.cd-page-disabled')).not.toBeNull();
    // 所有页码 button 原生 disabled（页码 button 带 data-page，区别于 prev/next/省略号）
    const pages = container.querySelectorAll<HTMLButtonElement>('.cd-page-item[data-page]');
    expect(pages.length).toBeGreaterThan(0);
    expect(Array.from(pages).every((b) => b.disabled)).toBe(true);
    // prev/next 也禁用
    expect(container.querySelector<HTMLButtonElement>('.cd-page-prev')?.disabled).toBe(true);
    expect(container.querySelector<HTMLButtonElement>('.cd-page-next')?.disabled).toBe(true);
    await expectNoAxeViolations(container);
  });
});
