// 列筛选浮层进/退场动画状态机（对齐 Semi CSSAnimation transitionState + onAnimationEnd，
// 与 TreeSelect/Select/Cascader/Dropdown/AutoComplete 同构模式）：jsdom 不真实播放
// CSS animation，用 dispatchEvent 手动模拟 animationend 验证 JS 状态机本身的正确性。
//
// Table 特有：同一时刻仅一个 openFilterKey，切换到另一列时旧列走退场（closingFilterKey）、
// 新列走进场，两者 key 不同，DOM 上短暂共存不冲突。
import { describe, it, expect } from 'vitest';
import { renderWithLocale } from '../test-utils/a11y.js';
import Table from './Table.svelte';

interface Row {
  key: string;
  name: string;
  city: string;
}

const dataSource: Row[] = [
  { key: '1', name: 'Alice', city: 'Beijing' },
  { key: '2', name: 'Bob', city: 'Shanghai' },
];

const columns = [
  {
    key: 'name',
    dataIndex: 'name',
    title: 'Name',
    filters: [
      { text: 'Alice', value: 'Alice' },
      { text: 'Bob', value: 'Bob' },
    ],
  },
  {
    key: 'city',
    dataIndex: 'city',
    title: 'City',
    filters: [
      { text: 'Beijing', value: 'Beijing' },
      { text: 'Shanghai', value: 'Shanghai' },
    ],
  },
];

function getFilterButton(colKey: string): HTMLElement | null {
  const headers = document.querySelectorAll('.cd-table-row-head');
  for (const h of headers) {
    if (h.textContent?.includes(colKey)) {
      return h.querySelector('.cd-table-column-filter');
    }
  }
  return null;
}
function getPanel(): HTMLElement | null {
  return document.querySelector('.cd-table-column-filter-dropdown');
}
function fireAnimationEnd(el: Element): void {
  el.dispatchEvent(new Event('animationend', { bubbles: true }));
}

describe('Table 列筛选浮层进出场动画状态机', () => {
  it('打开：面板立即可见，带 show 动画 class', async () => {
    renderWithLocale(Table, { props: { columns, dataSource, 'aria-label': 'Users' } });
    const btn = getFilterButton('Name');
    expect(btn).not.toBeNull();
    btn?.click();
    await new Promise((r) => setTimeout(r, 0));

    const panel = getPanel();
    expect(panel).not.toBeNull();
    expect(panel?.className).toContain('cd-table-column-filter-dropdown-motion-show');
    expect(panel?.className).not.toContain('cd-table-column-filter-dropdown-motion-hide');
  });

  it('关闭：不立即卸载，animationend 后才真正从 DOM 移除', async () => {
    renderWithLocale(Table, { props: { columns, dataSource, 'aria-label': 'Users' } });
    const btn = getFilterButton('Name');
    btn?.click();
    await new Promise((r) => setTimeout(r, 0));
    // 再次点击关闭
    btn?.click();
    await new Promise((r) => setTimeout(r, 0));

    const panel = getPanel();
    expect(panel).not.toBeNull();
    expect(panel?.className).toContain('cd-table-column-filter-dropdown-motion-hide');

    fireAnimationEnd(panel as Element);
    await new Promise((r) => setTimeout(r, 0));

    expect(getPanel()).toBeNull();
  });

  it('切换到另一列（真实 pointerdown 触发 useDismiss，非合成 click）：旧列走退场，新列走进场，两者短暂共存', async () => {
    // useDismiss 监听 'pointerdown'（非 'click'），HTMLElement.click() 只合成 click 事件，
    // 不会触发 pointerdown——切列时前一列靠 outsideClick 关闭这条路径必须用真实 pointerdown
    // 模拟，否则测试走不到 useDismiss 分支（对齐 memory: js-dispatch-masks-real-click-overlay-bug）。
    renderWithLocale(Table, { props: { columns, dataSource, 'aria-label': 'Users' } });
    const nameBtn = getFilterButton('Name') as HTMLElement;
    nameBtn.click();
    await new Promise((r) => setTimeout(r, 0));

    const cityBtn = getFilterButton('City') as HTMLElement;
    // 先触发 pointerdown（useDismiss 判定 outsideClick，关闭 name 列），再触发 click（打开 city 列）。
    cityBtn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    cityBtn.click();
    await new Promise((r) => setTimeout(r, 0));

    const panels = document.querySelectorAll('.cd-table-column-filter-dropdown');
    // 两个面板同时存在：旧列(退场) + 新列(进场)
    expect(panels.length).toBe(2);
    const hideCount = [...panels].filter((p) =>
      p.className.includes('cd-table-column-filter-dropdown-motion-hide'),
    ).length;
    const showCount = [...panels].filter((p) =>
      p.className.includes('cd-table-column-filter-dropdown-motion-show'),
    ).length;
    expect(hideCount).toBe(1);
    expect(showCount).toBe(1);
  });
});
