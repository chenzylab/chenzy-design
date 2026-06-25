// Select 键盘 e2e（browser project / 真实 chromium），浮层方向键导航。
// Select 高亮走 aria-activedescendant 模式：焦点始终留在 role=combobox 触发器上
// （options tabindex=-1，从不真实聚焦），"高亮项"由触发器的 aria-activedescendant
// 指向的 option id 表达。故断言 activedescendant 指向的 option id 变化，而非 toHaveFocus。
// 浮层经 use:floating portal 到 document.body —— 在 document 范围查 listbox。
//   1. 打开后 ↓ 高亮首项（opt-0），再 ↓ 移到 opt-1；↑ 回到 opt-0。
//   2. Home/End 跳列表首/末。
//   3. Enter 选中当前高亮项（onChange 写入夹具 output）。
import { describe, it, expect } from 'vitest';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import SelectKbdFixture from './SelectKbdFixture.svelte';

describe('Select 键盘 e2e（aria-activedescendant 浮层导航）', () => {
  it('打开后 ↑↓ 移高亮 + Home/End 首末 + Enter 选中', async () => {
    renderKbdFixture(SelectKbdFixture);

    const combobox = document.querySelector('[role="combobox"]') as HTMLElement;
    expect(combobox).not.toBeNull();

    // 点击触发器打开浮层（焦点留在 combobox）。
    await userEvent.click(combobox);
    const listbox = document.querySelector('[role="listbox"]') as HTMLElement;
    expect(listbox).not.toBeNull();
    const listId = listbox.id;
    expect(listId).toBeTruthy();

    const options = Array.from(
      listbox.querySelectorAll<HTMLElement>('[role="option"]'),
    );
    expect(options.length).toBe(3);

    // 焦点在 combobox 上，options 不可真实聚焦（tabindex=-1）。
    expect(options.every((o) => o.tabIndex === -1)).toBe(true);

    // 1. ↓ 高亮首项（activeIndex -1 → 0），aria-activedescendant 指向 opt-0。
    await userEvent.keyboard('{ArrowDown}');
    expect(combobox.getAttribute('aria-activedescendant')).toBe(`${listId}-opt-0`);
    expect(options[0]!.classList.contains('cd-select__option--active')).toBe(true);

    // 再 ↓ 移到 opt-1。
    await userEvent.keyboard('{ArrowDown}');
    expect(combobox.getAttribute('aria-activedescendant')).toBe(`${listId}-opt-1`);

    // ↑ 回到 opt-0。
    await userEvent.keyboard('{ArrowUp}');
    expect(combobox.getAttribute('aria-activedescendant')).toBe(`${listId}-opt-0`);

    // 2. End 跳末项（opt-2）；Home 回首项（opt-0）。
    await userEvent.keyboard('{End}');
    expect(combobox.getAttribute('aria-activedescendant')).toBe(`${listId}-opt-2`);
    await userEvent.keyboard('{Home}');
    expect(combobox.getAttribute('aria-activedescendant')).toBe(`${listId}-opt-0`);

    // 3. Enter 选中当前高亮项（opt-0 = Apple），onChange 写入夹具 output。
    await userEvent.keyboard('{Enter}');
    const out = document.querySelector('[data-testid="value"]') as HTMLElement;
    expect(out.textContent).toBe(JSON.stringify('apple'));
  });
});
