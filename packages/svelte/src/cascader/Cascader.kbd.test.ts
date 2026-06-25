// Cascader 键盘 e2e（browser project / 真实 chromium），浮层列内方向键 roving。
// Cascader 高亮走 aria-activedescendant 模型：焦点留在 role=combobox 触发器上
// （options tabindex=-1，从不真实聚焦），列内高亮由触发器 aria-activedescendant
// 指向的 option id 表达。故断言 activedescendant 指向的 option 文本变化，而非 toHaveFocus。
// 浮层经 use:floating portal 到 document.body —— 在 document 范围查列 listbox。
//   1. 打开后首次 ↓ 进首列首项；再 ↓ 移列内下一项；↑ 回上一项。
//   2. Home/End 跳列内首/末项。
import { describe, it, expect } from 'vitest';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import CascaderKbdFixture from './CascaderKbdFixture.svelte';

// 读触发器 aria-activedescendant 指向的 option，断言其 label（剥离展开箭头 ›）。
function activeOptionText(combobox: HTMLElement): string | null {
  const id = combobox.getAttribute('aria-activedescendant');
  if (!id) return null;
  const el = document.getElementById(id);
  const label = el?.querySelector('.cd-cascader__option-label');
  return label?.textContent?.trim() ?? null;
}

describe('Cascader 键盘 e2e（aria-activedescendant 列内 roving）', () => {
  it('打开后 ↑↓ 列内移高亮 + Home/End 列内首末', async () => {
    renderKbdFixture(CascaderKbdFixture);

    const combobox = document.querySelector('[role="combobox"]') as HTMLElement;
    expect(combobox).not.toBeNull();

    // 点击触发器打开浮层（焦点留在 combobox）。
    await userEvent.click(combobox);
    const listbox = document.querySelector('.cd-cascader__column[role="listbox"]') as HTMLElement;
    expect(listbox).not.toBeNull();
    const options = Array.from(
      listbox.querySelectorAll<HTMLElement>('[role="option"]'),
    );
    expect(options.length).toBe(3);
    expect(options.every((o) => o.tabIndex === -1)).toBe(true);

    // 1. 首次 ↓ 进首列首项（Zhejiang）。
    await userEvent.keyboard('{ArrowDown}');
    expect(activeOptionText(combobox)).toBe('Zhejiang');

    // 再 ↓ 列内移到第二项（Jiangsu）。
    await userEvent.keyboard('{ArrowDown}');
    expect(activeOptionText(combobox)).toBe('Jiangsu');

    // ↑ 回到第一项（Zhejiang）。
    await userEvent.keyboard('{ArrowUp}');
    expect(activeOptionText(combobox)).toBe('Zhejiang');

    // 2. End 跳列内末项（Fujian）；Home 回列内首项（Zhejiang）。
    await userEvent.keyboard('{End}');
    expect(activeOptionText(combobox)).toBe('Fujian');
    await userEvent.keyboard('{Home}');
    expect(activeOptionText(combobox)).toBe('Zhejiang');
  });
});
