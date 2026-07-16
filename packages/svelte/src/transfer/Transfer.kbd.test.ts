// Transfer 键盘 e2e（browser project / 真实 chromium）。对齐 Semi：左侧 Checkbox +
// 中间移动 Button。测真实焦点 + Space 勾选 + 点击移动按钮迁移（jsdom 测不了真实焦点）。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import TransferKbdFixture from './TransferKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('Transfer 键盘 e2e（Checkbox 勾选 + 按钮迁移）', () => {
  it('聚焦左侧 Checkbox + Space 勾选 + 点击移动按钮迁移到右侧', async () => {
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
    await expect.element(loc(banana)).toBeChecked();

    // 2. 点击中间「移动到右侧」按钮。
    const moveBtn = baseElement.querySelector<HTMLButtonElement>('.cd-transfer-ops button')!;
    expect(moveBtn.disabled).toBe(false);
    await userEvent.click(moveBtn);

    // 3. 右侧已选列表出现 Banana。
    const rightList = baseElement.querySelector('.cd-transfer-right-list')!;
    await expect.element(loc(rightList)).toHaveTextContent('Banana');

    // 源列表只剩 Apple/Cherry/Date。
    const remaining = Array.from(
      baseElement.querySelectorAll<HTMLElement>('.cd-transfer-left-list .cd-transfer-item'),
    ).map((el) => el.textContent?.trim());
    expect(remaining).toEqual(['Apple', 'Cherry', 'Date']);
  });
});
