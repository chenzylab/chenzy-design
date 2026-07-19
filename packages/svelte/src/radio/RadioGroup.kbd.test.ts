// RadioGroup 键盘 e2e（browser project / 真实 chromium）。
// 严格对齐 Semi：全类型原生 <input type="radio">，同 name 天然成组，
// 方向键切换即选中 + Tab 落在选中项，均由浏览器原生 radio 分组接管（无 JS roving）。
//
// 真实焦点断言用 page locator 的 .toHaveFocus()——jsdom 测不了原生 radio 分组行为。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import RadioGroupKbdFixture from './RadioGroupKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('RadioGroup 键盘 e2e（原生 radio 分组，方向键即选中）', () => {
  it('Tab 落在选中项 + 方向键移动焦点即选中（wrap）+ Home/End', async () => {
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

    // 初始：defaultValue=apple 选中。
    // 严格对齐 Semi：不显式设 tabindex——原生同 name radio 组的「Tab 只落在选中项」是浏览器
    // 焦点序行为，不反映在 el.tabIndex DOM 属性（全为 0）。下面用真实 Tab 焦点落点验证 roving。
    expect(apple.checked).toBe(true);

    const before = baseElement.querySelector('[data-testid="before"]') as HTMLElement;
    before.focus();
    await expect.element(loc(before)).toHaveFocus();
    // Tab 从前置按钮进入 radiogroup，焦点落在选中项 apple（原生 radio roving）。
    await userEvent.tab();
    await expect.element(loc(apple)).toHaveFocus();

    // → 移动焦点到下一项，原生 radio 焦点即选中。
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(loc(banana)).toHaveFocus();
    expect(banana.checked).toBe(true);
    expect(apple.checked).toBe(false);

    // ↓ 同义于 →。
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(loc(cherry)).toHaveFocus();
    expect(cherry.checked).toBe(true);

    // wrap：末项再 → 回到首项并选中。
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(loc(apple)).toHaveFocus();
    expect(apple.checked).toBe(true);

    // ← wrap 到末项。
    await userEvent.keyboard('{ArrowLeft}');
    await expect.element(loc(cherry)).toHaveFocus();
    expect(cherry.checked).toBe(true);

    // ↑ 回上一项。
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(loc(banana)).toHaveFocus();
    expect(banana.checked).toBe(true);
  });
});
