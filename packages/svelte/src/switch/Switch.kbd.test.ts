// Switch 键盘 e2e（browser project / 真实 chromium）。
// 对齐 Semi DOM 结构：role="switch" 挂在隐藏的 <input type="checkbox">，焦点落在该 input。
// checkbox 是原生行为：仅 Space 触发切换，Enter 对 checkbox 无效（对齐 Semi 文档
// 「聚焦时可以通过 Space 键切换开启或关闭状态」，未提及 Enter）。jsdom 下 checkbox
// 的 Space→click 合成不可靠，故在真浏览器里验真实键盘。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import SwitchKbdFixture from './SwitchKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('Switch 键盘 e2e（role=switch Space 切换）', () => {
  it('Tab 聚焦 + Space 翻转 aria-checked（Enter 对 checkbox 无效）', async () => {
    const { baseElement } = renderKbdFixture(SwitchKbdFixture);

    const sw = baseElement.querySelector('[role="switch"]') as HTMLElement;
    expect(sw).not.toBeNull();
    expect(sw.getAttribute('aria-checked')).toBe('false');

    // Tab 从 before 进入，焦点落在隐藏 input 本身。
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

    // Space 再次切回 off（checkbox 原生行为，Enter 不生效）。
    await userEvent.keyboard(' ');
    await expect.element(loc(sw)).toHaveAttribute('aria-checked', 'false');
    expect(out.textContent).toBe(JSON.stringify(false));
  });
});
