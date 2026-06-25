// Switch 键盘 e2e（browser project / 真实 chromium）。
// Switch 是原生 <button role="switch">，焦点落在按钮本身：Tab 聚焦、
// Space/Enter 经原生 click 触发 toggle，aria-checked 翻转。jsdom 下
// 原生按钮的 Space/Enter→click 合成不可靠，故在真浏览器里验真实键盘。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import SwitchKbdFixture from './SwitchKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('Switch 键盘 e2e（role=switch Space/Enter 切换）', () => {
  it('Tab 聚焦 + Space/Enter 翻转 aria-checked', async () => {
    const { baseElement } = renderKbdFixture(SwitchKbdFixture);

    const sw = baseElement.querySelector('[role="switch"]') as HTMLElement;
    expect(sw).not.toBeNull();
    expect(sw.getAttribute('aria-checked')).toBe('false');

    // Tab 从 before 进入，焦点落在 switch 按钮本身。
    const before = baseElement.querySelector('[data-testid="before"]') as HTMLElement;
    before.focus();
    await expect.element(loc(before)).toHaveFocus();
    await userEvent.tab();
    await expect.element(loc(sw)).toHaveFocus();

    // Space 切到 on（aria-checked=true，onChange 写入 true）。
    await userEvent.keyboard(' ');
    await expect.element(loc(sw)).toHaveAttribute('aria-checked', 'true');
    const out = baseElement.querySelector('[data-testid="value"]') as HTMLElement;
    expect(out.textContent).toBe(JSON.stringify(true));

    // Enter 切回 off。
    await userEvent.keyboard('{Enter}');
    await expect.element(loc(sw)).toHaveAttribute('aria-checked', 'false');
    expect(out.textContent).toBe(JSON.stringify(false));
  });
});
