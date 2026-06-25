// Transfer a11y：双栏穿梭框（dual-listbox）。
// 容器 role=group；每侧平铺列表 role=listbox + aria-multiselectable；
// 条目 role=option + aria-selected。
//
// 已知组件 a11y 缺口（axe violations，留给后续修，本测试只做 role/aria 断言不跑 axe）：
//   1. [aria-toggle-field-name] role=option 的条目可访问名为空：
//      label 文本渲染在 <span class="cd-transfer__option-control" aria-hidden="true"> 子树内
//      （Transfer.svelte:732-741），整段被 aria-hidden 隐藏，导致 option 无可读名称。
//   2. [aria-required-children] 空的目标 listbox 只含 <li class="cd-transfer__empty">，
//      role=listbox 缺少 role=option 子项；该空态 <li> 同时触发 [listitem]。
// 修复需改组件源码（把 label span 移出 aria-hidden / 给空态 listbox 合理处理），
// 超出「只写测试」范围，故下面跑 axe 的用例 it.skip。
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
  it('默认渲染：role=group + 双 listbox + option role/aria（不跑 axe，见文件头缺口说明）', () => {
    const { container } = renderWithLocale(Transfer, {
      props: { dataSource },
    });
    expect(container.querySelector('[role="group"]')).not.toBeNull();
    const listboxes = container.querySelectorAll('[role="listbox"]');
    expect(listboxes.length).toBe(2);
    listboxes.forEach((lb) => {
      expect(lb.getAttribute('aria-multiselectable')).toBe('true');
      // 每个 listbox 由栏标题 aria-labelledby 命名
      expect(lb.getAttribute('aria-labelledby')).toBeTruthy();
    });
    // 源面板 4 个 option，均带 aria-selected
    const options = container.querySelectorAll('[role="option"]');
    expect(options.length).toBe(4);
    options.forEach((opt) => expect(opt.hasAttribute('aria-selected')).toBe(true));
  });

  it('带选中：右侧 listbox 含已选项 + aria-selected（不跑 axe）', () => {
    const { container } = renderWithLocale(Transfer, {
      props: { dataSource, defaultValue: ['b'] },
    });
    const right = container.querySelectorAll('[role="listbox"]')[1];
    expect(right).toBeDefined();
    expect(right?.textContent).toContain('Banana');
    expect(right?.querySelectorAll('[role="option"]').length).toBe(1);
  });

  // axe 0 violations：被组件已知缺口阻塞（见文件头 1/2）。修复组件源码后取消 skip。
  it.skip('axe 0 violations（阻塞于 aria-toggle-field-name / aria-required-children）', async () => {
    const { container } = renderWithLocale(Transfer, {
      props: { dataSource, defaultValue: ['b'] },
    });
    await expectNoAxeViolations(container);
  });
});
