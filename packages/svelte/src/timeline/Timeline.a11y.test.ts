// Timeline a11y：dataSource 模式渲染 <ul>/<li> 列表语义；interactive 项取 role=button + roving tabindex。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Timeline from './Timeline.svelte';

describe('Timeline a11y', () => {
  it('dataSource：ul/li 列表语义，无 axe violations', async () => {
    const { container } = renderWithLocale(Timeline, {
      props: {
        pending: false,
        dataSource: [
          { key: 'a', content: 'Created' },
          { key: 'b', content: 'In review' },
          { key: 'c', content: 'Merged' },
        ],
      },
    });
    expect(container.querySelector('ul.cd-timeline')).not.toBeNull();
    expect(container.querySelectorAll('li.cd-timeline__item').length).toBe(3);
    await expectNoAxeViolations(container);
  });

  it('interactive：listitem 包内层 role=button + roving tabindex（首项 0）结构正确', () => {
    const { container } = renderWithLocale(Timeline, {
      props: {
        interactive: true,
        pending: false,
        dataSource: [
          { key: 'a', content: 'Step one' },
          { key: 'b', content: 'Step two' },
        ],
      },
    });
    // li 保持原生 list 语义，role=button + roving 落在内层 .cd-timeline__item-interactive。
    const lis = container.querySelectorAll('li.cd-timeline__item');
    expect(lis.length).toBe(2);
    const buttons = container.querySelectorAll('.cd-timeline__item-interactive[role="button"]');
    expect(buttons.length).toBe(2);
    expect(buttons[0]?.getAttribute('tabindex')).toBe('0');
    expect(buttons[1]?.getAttribute('tabindex')).toBe('-1');
  });

  // interactive 用 listitem 包内层 role=button：ul 直含 li（保 list 语义），交互落内层，无 [list] 违规。
  it('interactive：无 axe violations（listitem 包 button）', async () => {
    const { container } = renderWithLocale(Timeline, {
      props: {
        interactive: true,
        pending: false,
        dataSource: [{ key: 'a', content: 'Step one' }],
      },
    });
    await expectNoAxeViolations(container);
  });
});
