// Collapse 键盘 e2e（browser project / 真实 chromium）。
// DOM 对齐 Semi：Header 为 role=button tabindex=0，无 roving——每个 Header 都是 Tab 停靠点，
// Tab 依序经过 before → 各 Header → after；Enter/Space 展开当前焦点 Header。
// 真实焦点断言用 page locator 的 .toHaveFocus()（jsdom 测不了命令式焦点）。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import CollapseKbdFixture from './CollapseKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('Collapse 键盘 e2e（header role=button，对齐 Semi）', () => {
  it('Tab 依序经过各 Header（全部 tabindex=0，无 roving）', async () => {
    const { baseElement } = renderKbdFixture(CollapseKbdFixture);

    const headers = Array.from(
      baseElement.querySelectorAll<HTMLElement>('.cd-collapse-header'),
    );
    expect(headers.length).toBe(3);
    const [h1, h2, h3] = headers as [HTMLElement, HTMLElement, HTMLElement];

    // 对齐 Semi：每个 Header tabindex=0（非 roving 单停靠点）。
    expect(headers.every((el) => el.tabIndex === 0)).toBe(true);

    const before = baseElement.querySelector('[data-testid="before"]') as HTMLElement;
    const after = baseElement.querySelector('[data-testid="after"]') as HTMLElement;
    before.focus();
    await expect.element(loc(before)).toHaveFocus();

    // Tab 依序经过三个 Header，再落到 after。
    await userEvent.tab();
    await expect.element(loc(h1)).toHaveFocus();
    await userEvent.tab();
    await expect.element(loc(h2)).toHaveFocus();
    await userEvent.tab();
    await expect.element(loc(h3)).toHaveFocus();
    await userEvent.tab();
    await expect.element(loc(after)).toHaveFocus();
  });

  it('Enter / Space 展开当前焦点 Header（aria-expanded）', async () => {
    const { baseElement } = renderKbdFixture(CollapseKbdFixture);

    const headers = Array.from(
      baseElement.querySelectorAll<HTMLElement>('.cd-collapse-header'),
    );
    const [h1, h2] = headers as [HTMLElement, HTMLElement];

    h1.focus();
    await expect.element(loc(h1)).toHaveFocus();
    expect(h1.getAttribute('aria-expanded')).toBe('false');

    // Enter 展开当前 Header（keydown → handleClick → onClick）。
    await userEvent.keyboard('{Enter}');
    await expect.element(loc(h1)).toHaveAttribute('aria-expanded', 'true');

    // 移到下一 Header，Space 展开（非 accordion，可同时展开）。
    h2.focus();
    await expect.element(loc(h2)).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect.element(loc(h2)).toHaveAttribute('aria-expanded', 'true');
  });
});
