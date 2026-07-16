// Pagination 键盘 e2e（browser project / 真实 chromium）。
// 页码按钮组 roving（真实焦点）：方向键移动焦点但不切页（切页交给 Enter/Space → click）。
// 测真实焦点移动——jsdom 测不了（命令式 focus() 不可靠）：
//   1. roving 单停靠点：页码组只有当前页 tabindex=0（默认 current=1），其余 -1。
//   2. ←→/↑↓ 真实移动焦点到相邻页码，但 current/aria-current 不变（仅移动焦点）。
//   3. 无 wrap：末页再 → clamp 在末页；首页再 ← clamp 在首页。
//
// 真实焦点断言用 page locator 的 .toHaveFocus()。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import PaginationKbdFixture from './PaginationKbdFixture.svelte';
import PaginationSizeFixture from './PaginationSizeFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

// 打开 size-changer 浮层并点选第 idx 个（0 基）pageSize 选项。
async function pickPageSize(idx: number) {
  const combobox = document.querySelector('[role="combobox"]') as HTMLElement;
  expect(combobox).not.toBeNull();
  await userEvent.click(combobox);
  const listbox = document.querySelector('[role="listbox"]') as HTMLElement;
  expect(listbox).not.toBeNull();
  const options = Array.from(listbox.querySelectorAll<HTMLElement>('[role="option"]'));
  const opt = options[idx];
  expect(opt).not.toBeUndefined();
  await userEvent.click(opt!);
}

describe('Pagination 键盘 e2e（页码 roving，真实焦点，移动≠切页）', () => {
  it('roving 单停靠点 + 方向键移动焦点不切页（clamp）', async () => {
    const { baseElement } = renderKbdFixture(PaginationKbdFixture);

    const pages = Array.from(
      baseElement.querySelectorAll<HTMLElement>('.cd-page-item[data-page]'),
    );
    expect(pages.length).toBe(3);
    const [p1, p2, p3] = pages as [HTMLElement, HTMLElement, HTMLElement];

    // 1. roving 单停靠点：当前页（1）tabindex=0，其余 -1。
    expect(pages.filter((el) => el.tabIndex === 0).length).toBe(1);
    expect(p1.tabIndex).toBe(0);
    expect(p1.getAttribute('aria-current')).toBe('page');

    p1.focus();
    await expect.element(loc(p1)).toHaveFocus();

    // 2. → 移动焦点到下一页码，但不切页（aria-current 仍在第 1 页）。
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(loc(p2)).toHaveFocus();
    expect(p2.tabIndex).toBe(0);
    expect(p1.tabIndex).toBe(-1);
    // 移动焦点 ≠ 切页：current 仍为 1。
    expect(p1.getAttribute('aria-current')).toBe('page');
    expect(p2.getAttribute('aria-current')).toBe(null);

    await userEvent.keyboard('{ArrowRight}');
    await expect.element(loc(p3)).toHaveFocus();

    // 无 wrap：末页再 → 停在末页（clamp）。
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(loc(p3)).toHaveFocus();

    // ← 回退；首页再 ← 停在首页（clamp）。
    await userEvent.keyboard('{ArrowLeft}');
    await expect.element(loc(p2)).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect.element(loc(p1)).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect.element(loc(p1)).toHaveFocus();

    // Home/End 跳首/末页码。
    await userEvent.keyboard('{End}');
    await expect.element(loc(p3)).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect.element(loc(p1)).toHaveFocus();
  });
});

// changePageSize 页码重算（对齐 Semi）：total=200, defaultPageSize=10, current=5。
// 当前页首条数据 index = (5-1)*10 + 1 = 41。切到 pageSize=20 后：
//   - 默认：newPage = ceil(41/20) = 3（保持数据位置）；
//   - prevent=true：保持 current=5（clampPage(5, 200, 20)=5，200/20=10 页内合法）。
describe('Pagination changePageSize 页码重算（对齐 Semi）', () => {
  it('默认按当前页首条数据位置重算 currentPage', async () => {
    const { baseElement } = renderKbdFixture(PaginationSizeFixture);

    // pageSizeOpts 默认 [10,20,40,100]，index 1 = 20。
    await pickPageSize(1);

    const lastPage = baseElement.querySelector('[data-testid="last-page"]');
    const lastSize = baseElement.querySelector('[data-testid="last-size"]');
    expect(lastSize?.textContent).toBe('20');
    expect(lastPage?.textContent).toBe('3');
  });

  it('preventPageChangeOnPageSizeChange=true 时保持 currentPage', async () => {
    const { baseElement } = renderKbdFixture(PaginationSizeFixture, { prevent: true });

    await pickPageSize(1);

    const lastPage = baseElement.querySelector('[data-testid="last-page"]');
    const lastSize = baseElement.querySelector('[data-testid="last-size"]');
    expect(lastSize?.textContent).toBe('20');
    // current=5 在 200/20=10 页内合法，保持不变。
    expect(lastPage?.textContent).toBe('5');
  });
});
