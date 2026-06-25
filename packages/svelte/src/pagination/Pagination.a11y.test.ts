// Pagination a11y：分页器。
// nav[aria-label] 包裹，页码为原生 button，当前页 aria-current=page。
//
// 已知组件 a11y 缺口（均需改组件源码，超出「只写测试」范围，对应 axe 用例 it.skip）：
//   1. showSizeChanger 渲染的 Select 触发器（div[role=combobox]）缺可访问名
//      → axe [aria-input-field-name]（serious）。需给内置 Select 传 ariaLabel。
//   2. showQuickJumper 渲染的快速跳页 <input> 缺 label/aria-label
//      → axe [label]（critical）。需给该 Input 传可访问名。
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

  // axe 0 violations：被 showSizeChanger 的 Select combobox 缺可访问名阻塞（见文件头 1）。
  it.skip('showSizeChanger axe（阻塞于 aria-input-field-name：内置 Select 无 aria-label）', async () => {
    const { container } = renderWithLocale(Pagination, {
      props: { total: 200, defaultPageSize: 20, showSizeChanger: true },
    });
    await expectNoAxeViolations(container);
  });

  // axe 0 violations：被 showQuickJumper 的跳页 <input> 缺 label 阻塞（见文件头 2）。
  it.skip('showQuickJumper axe（阻塞于 label：跳页 input 无可访问名）', async () => {
    const { container } = renderWithLocale(Pagination, {
      props: { total: 200, defaultPageSize: 20, showQuickJumper: true },
    });
    await expectNoAxeViolations(container);
  });
});
