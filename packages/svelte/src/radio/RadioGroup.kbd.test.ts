// RadioGroup 键盘 e2e（browser project / 真实 chromium）。
// WAI-ARIA radiogroup：roving tabindex + 方向键导航即选中（真实焦点）。
// 测真实焦点移动 + 焦点即选中——jsdom 测不了（命令式 focus() 不可靠）：
//   1. roving 单停靠点：选中项 tabindex=0，其余 -1（默认 defaultValue=apple）。
//   2. ↓→ 真实移动焦点到下一项，同时选中（checked + 停靠点同步）。
//   3. wrap：末项再 → 回到首项（源码 moveTo 用模运算 wrap）。
//   4. Home/End 跳首/末并选中。
//
// 真实焦点断言用 page locator 的 .toHaveFocus()。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import RadioGroupKbdFixture from './RadioGroupKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('RadioGroup 键盘 e2e（radiogroup roving，焦点即选中）', () => {
  it('roving 单停靠点 + 方向键移动焦点即选中（wrap）+ Home/End', async () => {
    const { baseElement } = renderKbdFixture(RadioGroupKbdFixture);

    const radios = Array.from(
      baseElement.querySelectorAll<HTMLInputElement>('input[type="radio"]'),
    );
    expect(radios.length).toBe(3);
    const [apple, banana, cherry] = radios as [
      HTMLInputElement,
      HTMLInputElement,
      HTMLInputElement,
    ];

    // 1. roving 单停靠点：选中项（apple）tabindex=0，其余 -1。
    expect(radios.filter((el) => el.tabIndex === 0).length).toBe(1);
    expect(apple.tabIndex).toBe(0);
    expect(apple.checked).toBe(true);

    const before = baseElement.querySelector('[data-testid="before"]') as HTMLElement;
    before.focus();
    await expect.element(loc(before)).toHaveFocus();
    await userEvent.tab();
    await expect.element(loc(apple)).toHaveFocus();

    // 2. → 移动焦点到下一项，焦点即选中（checked + 停靠点同步）。
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(loc(banana)).toHaveFocus();
    expect(banana.checked).toBe(true);
    expect(banana.tabIndex).toBe(0);
    expect(apple.tabIndex).toBe(-1);
    expect(apple.checked).toBe(false);

    // ↓ 同义于 →（垂直/水平统一）。
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(loc(cherry)).toHaveFocus();
    expect(cherry.checked).toBe(true);

    // 3. wrap：末项再 → 回到首项并选中。
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(loc(apple)).toHaveFocus();
    expect(apple.checked).toBe(true);

    // ← wrap 到末项。
    await userEvent.keyboard('{ArrowLeft}');
    await expect.element(loc(cherry)).toHaveFocus();
    expect(cherry.checked).toBe(true);

    // 4. Home/End 跳首/末并选中。
    await userEvent.keyboard('{Home}');
    await expect.element(loc(apple)).toHaveFocus();
    expect(apple.checked).toBe(true);
    await userEvent.keyboard('{End}');
    await expect.element(loc(cherry)).toHaveFocus();
    expect(cherry.checked).toBe(true);
  });
});
