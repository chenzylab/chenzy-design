// Descriptions a11y：table 语义（th=key、td=value），data 驱动，无 axe violations。
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Descriptions from './Descriptions.svelte';
import HorizontalChildrenFixture from './DescriptionsHorizontalChildrenFixture.svelte';

describe('Descriptions a11y', () => {
  it('data 驱动 vertical：table/th/td 语义，无 axe violations', async () => {
    const { container } = renderWithLocale(Descriptions, {
      props: {
        data: [
          { key: 'Name', value: 'Jane' },
          { key: 'Email', value: 'jane@example.com' },
        ],
      },
    });
    expect(container.querySelector('table')).not.toBeNull();
    // align 默认 center（非 plain）→ 每项 th + td 一对。
    expect(container.querySelectorAll('th').length).toBe(2);
    expect(container.querySelectorAll('td').length).toBe(2);
    await expectNoAxeViolations(container);
  });

  it('plain 对齐：单 td 单元格，无 axe violations', async () => {
    const { container } = renderWithLocale(Descriptions, {
      props: {
        align: 'plain',
        data: [{ key: 'A', value: '1' }],
      },
    });
    expect(container.querySelectorAll('th').length).toBe(0);
    expect(container.querySelectorAll('td').length).toBe(1);
    await expectNoAxeViolations(container);
  });

  it('horizontal 布局 + row 双行：无 axe violations', async () => {
    const { container } = renderWithLocale(Descriptions, {
      props: {
        layout: 'horizontal',
        column: 2,
        data: [
          { key: 'A', value: '1' },
          { key: 'B', value: '2' },
          { key: 'C', value: '3', hidden: true },
        ],
      },
    });
    await expectNoAxeViolations(container);
  });

  it('horizontal + children（无 data）：Item 元信息按 getHorizontalList 分组为单个 tr（对齐 Semi getColumns 提取 children）', async () => {
    // column=4，3 项 span 各 1、总 span=3 < 4，应全部归入同一分组行（同 Semi __test__ 用例：3 项 column=4 → 1 个 tr）。
    const { container } = render(HorizontalChildrenFixture, { props: { column: 4 } });
    const trs = container.querySelectorAll('tr');
    expect(trs.length).toBe(1);
    const ths = container.querySelectorAll('th');
    expect(ths.length).toBe(3);
    const keys = [...ths].map((th) => th.textContent?.trim());
    expect(keys).toEqual(['实际用户数量', '7天留存', '认证状态']);
    await expectNoAxeViolations(container);
  });

  it('horizontal + children：column=2 时 3 项应分成 2 组（2 个 tr）', async () => {
    const { container } = render(HorizontalChildrenFixture, { props: { column: 2 } });
    const trs = container.querySelectorAll('tr');
    expect(trs.length).toBe(2);
  });

  it('horizontal + children + align=plain：单 td 单元格，无 th', async () => {
    const { container } = render(HorizontalChildrenFixture, { props: { column: 4, align: 'plain' } });
    expect(container.querySelectorAll('th').length).toBe(0);
    expect(container.querySelectorAll('td').length).toBe(3);
  });
});
