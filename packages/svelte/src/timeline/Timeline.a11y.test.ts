// Timeline a11y：严格对齐 Semi —— ul/li 结构；连线与圆点 aria-hidden；可传 aria-label。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Timeline from './Timeline.svelte';

describe('Timeline a11y', () => {
  it('dataSource：ul/li 列表结构，连线与圆点 aria-hidden，无 axe violations', async () => {
    const { container } = renderWithLocale(Timeline, {
      props: {
        'aria-label': '发布流程时间线',
        dataSource: [
          { key: 'a', content: 'Created' },
          { key: 'b', content: 'In review', type: 'ongoing' as const },
          { key: 'c', content: 'Merged', type: 'success' as const },
        ],
      },
    });
    const ul = container.querySelector('ul.cd-timeline');
    expect(ul).not.toBeNull();
    expect(ul?.getAttribute('aria-label')).toBe('发布流程时间线');
    expect(container.querySelectorAll('li.cd-timeline-item').length).toBe(3);
    // 连线与圆点均 aria-hidden。
    expect(container.querySelectorAll('.cd-timeline-item-tail[aria-hidden="true"]').length).toBe(3);
    expect(container.querySelectorAll('.cd-timeline-item-head[aria-hidden="true"]').length).toBe(3);
    await expectNoAxeViolations(container);
  });

  it('dataSource：按 mode/type 生成位置类与语义圆点类', () => {
    const { container } = renderWithLocale(Timeline, {
      props: {
        mode: 'alternate' as const,
        dataSource: [
          { key: 'a', content: '第一', type: 'ongoing' as const },
          { key: 'b', content: '第二', type: 'success' as const },
        ],
      },
    });
    const items = container.querySelectorAll('li.cd-timeline-item');
    // alternate：偶数索引 left、奇数索引 right。
    expect(items[0]?.classList.contains('cd-timeline-item-left')).toBe(true);
    expect(items[1]?.classList.contains('cd-timeline-item-right')).toBe(true);
    // 语义圆点类。
    expect(container.querySelector('.cd-timeline-item-head-ongoing')).not.toBeNull();
    expect(container.querySelector('.cd-timeline-item-head-success')).not.toBeNull();
  });
});
