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
      props: { total: 100, defaultPageSize: 10 },
    });
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    // ariaLabel 缺省时来自 locale，应非空
    expect(nav?.getAttribute('aria-label')).toBeTruthy();
    await expectNoAxeViolations(container);
  });

  it('当前页 aria-current=page，无 axe violations', async () => {
    const { container } = renderWithLocale(Pagination, {
      props: { total: 100, defaultPageSize: 10, defaultCurrentPage: 3 },
    });
    const current = container.querySelector('[aria-current="page"]');
    expect(current).not.toBeNull();
    expect(current?.textContent?.trim()).toContain('3');
    await expectNoAxeViolations(container);
  });

  it('自定义 ariaLabel + showTotal，无 axe violations', async () => {
    const { container } = renderWithLocale(Pagination, {
      props: {
        total: 200,
        defaultPageSize: 20,
        ariaLabel: 'Results pagination',
        showTotal: true,
      },
    });
    expect(container.querySelector('nav')?.getAttribute('aria-label')).toBe('Results pagination');
    await expectNoAxeViolations(container);
  });

  // 内置 Select 经 ariaLabel=Pagination.itemsPerPage 获可访问名。
  it('showSizeChanger axe 0 violations（内置 Select 有 aria-label）', async () => {
    const { container } = renderWithLocale(Pagination, {
      props: { total: 200, defaultPageSize: 20, showSizeChanger: true },
    });
    await expectNoAxeViolations(container);
  });

  // 跳页 input 经 ariaLabel=Pagination.jumpTo 获可访问名。
  it('showQuickJumper axe 0 violations（跳页 input 有 aria-label）', async () => {
    const { container } = renderWithLocale(Pagination, {
      props: { total: 200, defaultPageSize: 20, showQuickJumper: true },
    });
    await expectNoAxeViolations(container);
  });
});
