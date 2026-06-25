// Transfer a11y：双栏穿梭框（dual-listbox）。
// 容器 role=group；每侧平铺列表 role=listbox + aria-multiselectable；
// 条目 role=option + aria-selected。
//
// 组件 a11y 修复（原 axe violations 已消除）：
//   1. [aria-toggle-field-name] role=option 条目原可访问名为空（label 在 aria-hidden 子树内）：
//      已给 role=option 的 <li> 加 aria-label={item.label}，提供可访问名（视觉勾选框仍 aria-hidden）。
//   2. [aria-required-children]/[listitem] 空 listbox 仅含空态 <li>：空态时该 <ul> 退化为普通
//      容器（去掉 role=listbox 及 listbox-only ARIA），空态 <li> 成为合法 listitem。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Transfer from './Transfer.svelte';

const dataSource = [
  { key: 'a', label: 'Apple' },
  { key: 'b', label: 'Banana' },
  { key: 'c', label: 'Cherry' },
  { key: 'd', label: 'Date' },
];

describe('Transfer a11y', () => {
  it('默认渲染：role=group + 非空面板为 listbox + option role/aria（不跑 axe）', () => {
    const { container } = renderWithLocale(Transfer, {
      props: { dataSource },
    });
    expect(container.querySelector('[role="group"]')).not.toBeNull();
    // 默认无选中：源面板有项 → listbox；目标面板为空 → 退化为普通容器（非 listbox，
    // 避免 axe aria-required-children）。故此处仅 1 个 listbox。
    const listboxes = container.querySelectorAll('[role="listbox"]');
    expect(listboxes.length).toBe(1);
    const lb = listboxes[0];
    expect(lb?.getAttribute('aria-multiselectable')).toBe('true');
    // listbox 由栏标题 aria-labelledby 命名
    expect(lb?.getAttribute('aria-labelledby')).toBeTruthy();
    // 源面板 4 个 option，均带 aria-selected + aria-label（可访问名）
    const options = container.querySelectorAll('[role="option"]');
    expect(options.length).toBe(4);
    options.forEach((opt) => {
      expect(opt.hasAttribute('aria-selected')).toBe(true);
      expect(opt.getAttribute('aria-label')).toBeTruthy();
    });
  });

  it('带选中：两侧均非空 → 双 listbox，右侧含已选项 + aria-selected（不跑 axe）', () => {
    const { container } = renderWithLocale(Transfer, {
      props: { dataSource, defaultValue: ['b'] },
    });
    const listboxes = container.querySelectorAll('[role="listbox"]');
    expect(listboxes.length).toBe(2);
    const right = listboxes[1];
    expect(right).toBeDefined();
    expect(right?.textContent).toContain('Banana');
    expect(right?.querySelectorAll('[role="option"]').length).toBe(1);
  });

  // axe 0 violations：组件已修复（option aria-label 提供可访问名；空 listbox 退化为普通容器）。
  it('axe 0 violations（option 可访问名 + 空 listbox 处理后）', async () => {
    const { container } = renderWithLocale(Transfer, {
      props: { dataSource, defaultValue: ['b'] },
    });
    await expectNoAxeViolations(container);
  });
});
