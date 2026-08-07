// Cascader 键盘 e2e（browser project / 真实 chromium），浮层列内方向键 roving。
// Cascader 高亮走 aria-activedescendant 模型：焦点留在 role=combobox 触发器上
// （列项 tabindex=-1，从不真实聚焦），列内高亮由触发器 aria-activedescendant
// 指向的 menuitem id 表达（role=menuitem 非 option，对齐 Semi item.tsx）。
// 故断言 activedescendant 指向的列项文本变化，而非 toHaveFocus。
// 浮层经 use:floating portal 到 document.body —— 在 document 范围查列 menu。
import { describe, it, expect } from 'vitest';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import CascaderKbdFixture from './CascaderKbdFixture.svelte';

// 读触发器 aria-activedescendant 指向的列项，断言其 label（剥离展开箭头 ›）。
function activeOptionText(combobox: HTMLElement): string | null {
  const id = combobox.getAttribute('aria-activedescendant');
  if (!id) return null;
  const el = document.getElementById(id);
  const label = el?.querySelector('.cd-cascader-option-label');
  return label?.textContent?.trim() ?? null;
}

describe('Cascader 键盘 e2e（aria-activedescendant 列内 roving）', () => {
  it('打开后 ↑↓ 列内移高亮 + Home/End 列内首末', async () => {
    renderKbdFixture(CascaderKbdFixture);

    const combobox = document.querySelector('[role="combobox"]') as HTMLElement;
    expect(combobox).not.toBeNull();

    // 点击触发器打开浮层（焦点留在 combobox）。
    await userEvent.click(combobox);
    const menu = document.querySelector('.cd-cascader-option-list[role="menu"]') as HTMLElement;
    expect(menu).not.toBeNull();
    const options = Array.from(
      menu.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    );
    expect(options.length).toBe(3);
    expect(options.every((o) => o.tabIndex === -1)).toBe(true);

    // 1. 首次 ↓ 进首列首项（Zhejiang）。
    await userEvent.keyboard('{ArrowDown}');
    expect(activeOptionText(combobox)).toBe('Zhejiang');

    // 再 ↓ 列内移到第二项（Jiangsu）。
    await userEvent.keyboard('{ArrowDown}');
    expect(activeOptionText(combobox)).toBe('Jiangsu');

    // ↑ 回到第一项（Zhejiang）。
    await userEvent.keyboard('{ArrowUp}');
    expect(activeOptionText(combobox)).toBe('Zhejiang');

    // 2. End 跳列内末项（Fujian）；Home 回列内首项（Zhejiang）。
    await userEvent.keyboard('{End}');
    expect(activeOptionText(combobox)).toBe('Fujian');
    await userEvent.keyboard('{Home}');
    expect(activeOptionText(combobox)).toBe('Zhejiang');
  });

  it('ArrowRight 展开下一列并进入首项，ArrowLeft 回上一列保留原高亮', async () => {
    renderKbdFixture(CascaderKbdFixture);
    const combobox = document.querySelector('[role="combobox"]') as HTMLElement;
    await userEvent.click(combobox);

    // 进首列首项 Zhejiang（有子级 Hangzhou，可展开）。
    await userEvent.keyboard('{ArrowDown}');
    expect(activeOptionText(combobox)).toBe('Zhejiang');

    // → 展开第二列并进入其首项 Hangzhou。
    await userEvent.keyboard('{ArrowRight}');
    expect(activeOptionText(combobox)).toBe('Hangzhou');

    // ← 回到第一列，高亮回到 Zhejiang（enterCol 命中 activePath 已选中项）。
    await userEvent.keyboard('{ArrowLeft}');
    expect(activeOptionText(combobox)).toBe('Zhejiang');
  });

  it('Enter 选中叶子节点并关闭面板', async () => {
    renderKbdFixture(CascaderKbdFixture);
    const combobox = document.querySelector('[role="combobox"]') as HTMLElement;
    await userEvent.click(combobox);

    // Zhejiang → Hangzhou（叶子）。
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowRight}');
    expect(activeOptionText(combobox)).toBe('Hangzhou');

    await userEvent.keyboard('{Enter}');
    // 选中叶子后面板关闭：combobox aria-expanded 变回 false。
    expect(combobox.getAttribute('aria-expanded')).toBe('false');
  });

  it('Escape 关闭面板', async () => {
    renderKbdFixture(CascaderKbdFixture);
    const combobox = document.querySelector('[role="combobox"]') as HTMLElement;
    await userEvent.click(combobox);
    expect(combobox.getAttribute('aria-expanded')).toBe('true');

    await userEvent.keyboard('{Escape}');
    expect(combobox.getAttribute('aria-expanded')).toBe('false');
  });

  it('Space 在多选模式下切换叶子节点勾选', async () => {
    renderKbdFixture(CascaderKbdFixture, { multiple: true });
    const combobox = document.querySelector('[role="combobox"]') as HTMLElement;
    await userEvent.click(combobox);

    // Zhejiang → Hangzhou（叶子）。
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowRight}');
    expect(activeOptionText(combobox)).toBe('Hangzhou');

    await userEvent.keyboard(' ');
    // 勾选后面板保持打开（多选 Space 不关闭），选中态 checkbox 应为 checked。
    expect(combobox.getAttribute('aria-expanded')).toBe('true');
    const id = combobox.getAttribute('aria-activedescendant');
    const li = id ? document.getElementById(id) : null;
    const checkbox = li?.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
    expect(checkbox?.checked).toBe(true);
  });

  it('RTL：ArrowLeft 展开下一列，ArrowRight 回上一列（键义对调）', async () => {
    renderKbdFixture(CascaderKbdFixture, { rtl: true });
    const combobox = document.querySelector('[role="combobox"]') as HTMLElement;
    await userEvent.click(combobox);

    await userEvent.keyboard('{ArrowDown}');
    expect(activeOptionText(combobox)).toBe('Zhejiang');

    // RTL 下 ← 才是「进下一列」（对齐视觉方向恒定惯例，非 Semi 源生行为——Semi
    // Cascader 无方向键逻辑可对齐，见 foundation.ts handleKeyDown 仅处理 Escape）。
    await userEvent.keyboard('{ArrowLeft}');
    expect(activeOptionText(combobox)).toBe('Hangzhou');

    await userEvent.keyboard('{ArrowRight}');
    expect(activeOptionText(combobox)).toBe('Zhejiang');
  });
});
