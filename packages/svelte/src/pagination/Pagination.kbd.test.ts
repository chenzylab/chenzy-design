// Pagination 键盘 e2e（browser project / 真实 chromium）。
// 严格对齐 Semi：页码项 <li role="button">，无 tabindex/roving/键盘导航
// （Semi handleKeyDown 为空实现），仅可鼠标点击。此文件只保留
// changePageSize（size-changer Select 点选）行为验证。
import { describe, it, expect } from 'vitest';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import PaginationSizeFixture from './PaginationSizeFixture.svelte';

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
