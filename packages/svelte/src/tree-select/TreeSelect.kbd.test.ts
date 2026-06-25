// TreeSelect 键盘 e2e（browser project / 真实 chromium），浮层方向键 roving。
// TreeSelect 高亮走 aria-activedescendant 模型：焦点留在 role=combobox 触发器上
// （treeitem tabindex=-1，从不真实聚焦），高亮由触发器 aria-activedescendant 指向的
// treeitem id 表达。故断言 activedescendant 指向的 treeitem 文本变化，而非 toHaveFocus。
// 浮层经 use:floating portal 到 document.body —— 在 document 范围查 role=tree。
//   1. 打开后首次 ↓ 高亮首项；再 ↓ 移到下一项；↑ 回上一项。
//   2. Home/End 跳可见列表首/末项。
import { describe, it, expect } from 'vitest';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import TreeSelectKbdFixture from './TreeSelectKbdFixture.svelte';

// 读触发器 aria-activedescendant 指向的 treeitem，断言其可见文本。
function activeNodeText(combobox: HTMLElement): string | null {
  const id = combobox.getAttribute('aria-activedescendant');
  if (!id) return null;
  const el = document.getElementById(id);
  return el?.textContent?.trim() ?? null;
}

describe('TreeSelect 键盘 e2e（aria-activedescendant 浮层 roving）', () => {
  it('打开后 ↑↓ 移高亮 + Home/End 首末', async () => {
    renderKbdFixture(TreeSelectKbdFixture);

    const combobox = document.querySelector('[role="combobox"]') as HTMLElement;
    expect(combobox).not.toBeNull();

    // 点击触发器打开浮层（焦点留在 combobox）。
    await userEvent.click(combobox);
    const tree = document.querySelector('[role="tree"]') as HTMLElement;
    expect(tree).not.toBeNull();
    const nodes = Array.from(tree.querySelectorAll<HTMLElement>('[role="treeitem"]'));
    expect(nodes.length).toBe(3);
    expect(nodes.every((n) => n.tabIndex === -1)).toBe(true);

    // 1. 首次 ↓ 高亮首项（Apple）。
    await userEvent.keyboard('{ArrowDown}');
    expect(activeNodeText(combobox)).toBe('Apple');

    // 再 ↓ 移到下一项（Banana）。
    await userEvent.keyboard('{ArrowDown}');
    expect(activeNodeText(combobox)).toBe('Banana');

    // ↑ 回到上一项（Apple）。
    await userEvent.keyboard('{ArrowUp}');
    expect(activeNodeText(combobox)).toBe('Apple');

    // 2. End 跳末项（Cherry）；Home 回首项（Apple）。
    await userEvent.keyboard('{End}');
    expect(activeNodeText(combobox)).toBe('Cherry');
    await userEvent.keyboard('{Home}');
    expect(activeNodeText(combobox)).toBe('Apple');
  });
});
