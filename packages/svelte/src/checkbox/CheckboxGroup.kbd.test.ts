// CheckboxGroup 键盘 e2e（browser project / 真实 chromium）。
// 组（role=list）内为原生 <input type=checkbox>（视觉隐藏但 Tab 可达、Space 可切）：
//   Tab 从前置按钮进入聚焦首个复选框，Space 切换其 checked（原生语义 → checked 属性）。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import CheckboxGroupKbdFixture from './CheckboxGroupKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('CheckboxGroup 键盘 e2e（Tab 进入 + Space 切换）', () => {
  it('Tab 聚焦首个复选框 + Space 切换 checked', async () => {
    const { baseElement } = renderKbdFixture(CheckboxGroupKbdFixture);

    const group = baseElement.querySelector('[role="list"]') as HTMLElement;
    expect(group).not.toBeNull();
    const inputs = Array.from(
      group.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'),
    );
    expect(inputs.length).toBe(2);
    const first = inputs[0] as HTMLInputElement;
    expect(first.checked).toBe(false);

    // 从前置按钮 Tab 进入 → 焦点落到首个复选框（真实焦点）。
    const before = baseElement.querySelector('[data-testid="before"]') as HTMLElement;
    before.focus();
    await expect.element(loc(before)).toHaveFocus();
    await userEvent.tab();
    await expect.element(loc(first)).toHaveFocus();

    // Space 切换 checked：未选 → 选中。
    await userEvent.keyboard(' ');
    expect(first.checked).toBe(true);
    // 再次 Space 取消。
    await userEvent.keyboard(' ');
    expect(first.checked).toBe(false);
  });
});
