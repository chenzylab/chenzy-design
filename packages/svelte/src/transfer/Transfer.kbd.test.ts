// Transfer 键盘 e2e（browser project / 真实 chromium）。对齐 Semi：左侧 Checkbox 勾选
// 即立即迁移到右侧（无中间移动按钮，单态模型）。测真实焦点 + Space 勾选（jsdom 测不了真实焦点）。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import TransferKbdFixture from './TransferKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('Transfer 键盘 e2e（Checkbox 勾选即迁移）', () => {
  it('聚焦左侧 Checkbox + Space 勾选：立即迁移到右侧已选列，左侧保留该项并显示 checked（对齐 Semi：左侧始终展示全部条目）', async () => {
    const { baseElement } = renderKbdFixture(TransferKbdFixture);

    const checkboxes = Array.from(
      baseElement.querySelectorAll<HTMLInputElement>('.cd-transfer-left-list input[type="checkbox"]'),
    );
    expect(checkboxes.length).toBe(4); // Apple/Banana/Cherry/Date
    const banana = checkboxes[1]!;

    // 1. 聚焦 Banana 的 checkbox 并用 Space 勾选。
    banana.focus();
    await expect.element(loc(banana)).toHaveFocus();
    expect(banana.checked).toBe(false);
    await userEvent.keyboard(' ');

    // 2. Space 勾选后立即迁移：右侧已选列表出现 Banana（无中间按钮）。
    const rightList = baseElement.querySelector('.cd-transfer-right-list')!;
    await expect.element(loc(rightList)).toHaveTextContent('Banana');

    // 左侧仍展示全部 4 项（对齐 Semi：renderLeftList 不排除 selectedItems），
    // Banana 的 checkbox 变为 checked。
    const remaining = Array.from(
      baseElement.querySelectorAll<HTMLElement>('.cd-transfer-left-list .cd-transfer-item'),
    ).map((el) => el.textContent?.trim());
    expect(remaining).toEqual(['Apple', 'Banana', 'Cherry', 'Date']);
    expect(banana.checked).toBe(true);
  });
});
