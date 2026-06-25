// Tree 键盘 e2e（browser project / 真实 chromium），aria-activedescendant 模型。
// Tree 遵循 WAI-ARIA APG Tree View：单一 tab stop（role=tree 容器 tabindex=0）+
// aria-activedescendant 漫游。焦点恒留在容器上，treeitem tabindex=-1 从不真实聚焦，
// 高亮由容器 aria-activedescendant 指向的 treeitem id 表达。故断言 activedescendant
// 指向的 treeitem 文本变化，而非 toHaveFocus（参照 TreeSelect 样板）。
//   1. 容器真实聚焦后首次 ↓ 高亮首项；↑↓ 相邻移动；Home/End 跳可见列表首/末。
//   2. typeahead：输入字符按 label 前缀跳到匹配节点（核心价值）。
//   3. `*` 展开当前层级全部可展开同级节点（这里仅 Date 可展开 → 其子节点变可见）。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import TreeKbdFixture from './TreeKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

// typeahead 缓冲超时为 600ms：连续按键在缓冲内累积为前缀（c+b → 'cb' 无匹配）。
// 测「单字符独立跳转」须在每次跳转间等待缓冲清空，故 sleep > 超时。
const TYPEAHEAD_TIMEOUT = 600;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 读 role=tree 容器 aria-activedescendant 指向的 treeitem，断言其可见 label 文本。
function activeNodeText(tree: HTMLElement): string | null {
  const id = tree.getAttribute('aria-activedescendant');
  if (!id) return null;
  const el = document.getElementById(id);
  // label 在 .cd-tree__label 内（含 switcher/icon 等兄弟），只取 label 文本。
  return el?.querySelector('.cd-tree__label')?.textContent?.trim() ?? null;
}

describe('Tree 键盘 e2e（aria-activedescendant roving + typeahead）', () => {
  it('容器聚焦 + ↑↓/Home/End 移高亮（activedescendant）', async () => {
    const { baseElement } = renderKbdFixture(TreeKbdFixture);

    const tree = baseElement.querySelector('[role="tree"]') as HTMLElement;
    expect(tree).not.toBeNull();
    expect(tree.tabIndex).toBe(0);
    const items = Array.from(tree.querySelectorAll<HTMLElement>('[role="treeitem"]'));
    // 顶层 4 项可见（Date 未展开）。
    expect(items.length).toBe(4);
    expect(items.every((n) => n.tabIndex === -1)).toBe(true);

    // 容器真实聚焦（单一 tab stop）。
    tree.focus();
    await expect.element(loc(tree)).toHaveFocus();

    // 1. 首次 ↓ 高亮首项 Apple。
    await userEvent.keyboard('{ArrowDown}');
    expect(activeNodeText(tree)).toBe('Apple');
    await userEvent.keyboard('{ArrowDown}');
    expect(activeNodeText(tree)).toBe('Banana');
    await userEvent.keyboard('{ArrowUp}');
    expect(activeNodeText(tree)).toBe('Apple');

    // End 跳末项 Date；Home 回首项 Apple。焦点始终在容器上（activedescendant 模型）。
    await userEvent.keyboard('{End}');
    expect(activeNodeText(tree)).toBe('Date');
    await userEvent.keyboard('{Home}');
    expect(activeNodeText(tree)).toBe('Apple');
    await expect.element(loc(tree)).toHaveFocus();
  });

  it('typeahead 输入字符跳到首字母匹配节点 + `*` 展开同级', async () => {
    const { baseElement } = renderKbdFixture(TreeKbdFixture);

    const tree = baseElement.querySelector('[role="tree"]') as HTMLElement;
    tree.focus();
    await expect.element(loc(tree)).toHaveFocus();

    // 2. typeahead：无活动项时输入 'c' → 跳到 Cherry。
    await userEvent.keyboard('c');
    expect(activeNodeText(tree)).toBe('Cherry');
    // 等缓冲清空后输入 'b' → 跳到 Banana（否则 'c'+'b' 累积为前缀 'cb' 无匹配）。
    await sleep(TYPEAHEAD_TIMEOUT + 100);
    await userEvent.keyboard('b');
    expect(activeNodeText(tree)).toBe('Banana');
    // 等缓冲清空后输入 'd' → 跳到 Date。
    await sleep(TYPEAHEAD_TIMEOUT + 100);
    await userEvent.keyboard('d');
    expect(activeNodeText(tree)).toBe('Date');

    // 3. `*` 展开当前层级全部可展开同级：Date 展开 → 子节点 Deglet/Medjool 可见。
    await userEvent.keyboard('*');
    const labels = Array.from(
      tree.querySelectorAll<HTMLElement>('.cd-tree__label'),
    ).map((n) => n.textContent?.trim());
    expect(labels).toContain('Deglet');
    expect(labels).toContain('Medjool');
  });
});
