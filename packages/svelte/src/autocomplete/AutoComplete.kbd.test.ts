// AutoComplete 键盘 e2e（browser project / 真实 chromium）。
// 输入框 role=combobox，焦点始终留在 input 上；高亮走 aria-activedescendant
// 指向当前 option id（options tabindex=-1，从不真实聚焦）——故断言
// activedescendant 变化，而非 toHaveFocus。
//   1. 输入后浮层打开（aria-expanded=true），defaultActiveFirstOption 高亮首项。
//   2. ↓ 移高亮到下一项，↑ 回上一项（activedescendant 变化）。
//   3. Enter 选中当前高亮项（onSelect 写入夹具 output），浮层关闭。
//   4. Esc 关闭浮层。
import { describe, it, expect, vi } from 'vitest';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import AutoCompleteKbdFixture from './AutoCompleteKbdFixture.svelte';

describe('AutoComplete 键盘 e2e（combobox aria-activedescendant 浮层导航）', () => {
  it('输入打开 + ↑↓ 移高亮 + Enter 选中 + Esc 关闭', async () => {
    renderKbdFixture(AutoCompleteKbdFixture);

    const combobox = document.querySelector('[role="combobox"]') as HTMLInputElement;
    expect(combobox).not.toBeNull();
    expect(combobox.getAttribute('aria-expanded')).toBe('false');

    // 1. 聚焦后输入 "Ap"，过滤到 Apple / Apricot，浮层打开并高亮首项。
    combobox.focus();
    await userEvent.keyboard('Ap');

    // 浮层经 Svelte 响应式渲染，poll 等其出现（aria-expanded → true）。
    await vi.waitFor(() => {
      expect(document.querySelector('[role="listbox"]')).not.toBeNull();
    });
    const listbox = document.querySelector('[role="listbox"]') as HTMLElement;
    const listId = listbox.id;
    expect(listId).toBeTruthy();
    expect(combobox.getAttribute('aria-expanded')).toBe('true');

    const options = Array.from(listbox.querySelectorAll<HTMLElement>('[role="option"]'));
    expect(options.length).toBe(2);
    // option 不可真实聚焦（tabindex=-1）。
    expect(options.every((o) => o.tabIndex === -1)).toBe(true);

    // defaultActiveFirstOption：高亮落在首项（opt-0）。
    expect(combobox.getAttribute('aria-activedescendant')).toBe(`${listId}-opt-0`);

    // 2. ↓ 移到 opt-1，↑ 回 opt-0。
    await userEvent.keyboard('{ArrowDown}');
    expect(combobox.getAttribute('aria-activedescendant')).toBe(`${listId}-opt-1`);
    await userEvent.keyboard('{ArrowUp}');
    expect(combobox.getAttribute('aria-activedescendant')).toBe(`${listId}-opt-0`);

    // 3. Enter 选中当前高亮（opt-0 = Apple），onSelect 写入夹具；浮层关闭。
    await userEvent.keyboard('{Enter}');
    const out = document.querySelector('[data-testid="selected"]') as HTMLElement;
    expect(out.textContent).toBe(JSON.stringify('Apple'));
    await vi.waitFor(() => {
      expect(document.querySelector('[role="listbox"]')).toBeNull();
    });
    expect(combobox.getAttribute('aria-expanded')).toBe('false');

    // 4. 清空后重新输入打开浮层，再 Esc 关闭。
    // 选中后 value="Apple"（5 字符），全选删除再输入 "Ba" 过滤到 Banana。
    await userEvent.keyboard('{Backspace}{Backspace}{Backspace}{Backspace}{Backspace}');
    await userEvent.keyboard('Ba');
    await vi.waitFor(() => {
      expect(document.querySelector('[role="listbox"]')).not.toBeNull();
    });
    await userEvent.keyboard('{Escape}');
    await vi.waitFor(() => {
      expect(document.querySelector('[role="listbox"]')).toBeNull();
    });
  });
});
