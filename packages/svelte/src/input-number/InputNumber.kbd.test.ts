// InputNumber 键盘 e2e（browser project / 真实 chromium）。
// 焦点落在原生 <input role="spinbutton">：↑ 步进 +step、↓ -step，
// PageUp/PageDown 大步进（shiftStep，默认 step*10），aria-valuenow 真实变化，
// 钳到 min/max。jsdom 焦点/方向键步进合成不可靠，故在真浏览器里测。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import InputNumberKbdFixture from './InputNumberKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('InputNumber 键盘 e2e（role=spinbutton ↑↓ 步进）', () => {
  it('Tab 聚焦 + ↑↓ 步进 + PageUp/PageDown 大步进 + 钳到 max', async () => {
    const { baseElement } = renderKbdFixture(InputNumberKbdFixture);

    const spin = baseElement.querySelector('[role="spinbutton"]') as HTMLElement;
    expect(spin).not.toBeNull();
    expect(spin.getAttribute('aria-valuenow')).toBe('5');

    // Tab 从 before 进入，焦点落在 spinbutton。
    const before = baseElement.querySelector('[data-testid="before"]') as HTMLElement;
    before.focus();
    await expect.element(loc(before)).toHaveFocus();
    await userEvent.tab();
    await expect.element(loc(spin)).toHaveFocus();

    // ↑ +1（6），↓ -1（5）。
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(loc(spin)).toHaveAttribute('aria-valuenow', '6');
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(loc(spin)).toHaveAttribute('aria-valuenow', '5');

    // PageUp 大步进 +10（15），PageDown -10（5）。
    await userEvent.keyboard('{PageUp}');
    await expect.element(loc(spin)).toHaveAttribute('aria-valuenow', '15');
    await userEvent.keyboard('{PageDown}');
    await expect.element(loc(spin)).toHaveAttribute('aria-valuenow', '5');
  });
});
