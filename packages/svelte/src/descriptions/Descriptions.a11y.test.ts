// Descriptions a11y：table 语义（th=key、td=value），data 驱动，无 axe violations。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Descriptions from './Descriptions.svelte';

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
});
