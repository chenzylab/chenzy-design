// Cascader a11y：combobox 触发器 + 每列 listbox/option 浮层（use:floating portal 到 body）。
// 只断言静态 ARIA + axe 0 violations，不测真实键盘/焦点（jsdom 限制）。
// 打开态面板 portal 到 document.body，故扫描 document.body。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Cascader from './Cascader.svelte';

const treeData = [
  {
    label: 'Zhejiang',
    value: 'zj',
    children: [
      { label: 'Hangzhou', value: 'hz', children: [{ label: 'West Lake', value: 'xh' }] },
    ],
  },
  {
    label: 'Jiangsu',
    value: 'js',
    children: [{ label: 'Nanjing', value: 'nj' }],
  },
];

describe('Cascader a11y', () => {
  it('关闭态：触发器 role=combobox / aria-expanded=false，无 axe violations', async () => {
    const { container } = renderWithLocale(Cascader, {
      props: { treeData, ariaLabel: 'Region', placeholder: 'Select region' },
    });
    const combobox = container.querySelector('[role="combobox"]');
    expect(combobox).not.toBeNull();
    expect(combobox?.getAttribute('aria-expanded')).toBe('false');
    expect(combobox?.getAttribute('aria-haspopup')).toBe('listbox');
    expect(combobox?.getAttribute('aria-label')).toBe('Region');
    await expectNoAxeViolations(container);
  });

  // 每列 listbox 经 locale Cascader.columnLabel 获可访问名（「第 N 级选项」）。
  it('打开态：面板列 listbox + option 渲染（portal 到 body），无 axe violations', async () => {
    renderWithLocale(Cascader, {
      props: { treeData, defaultOpen: true, ariaLabel: 'Region' },
    });
    const listbox = document.querySelector('[role="listbox"]');
    expect(listbox).not.toBeNull();
    expect(listbox?.getAttribute('aria-label')).toBeTruthy();
    const optionEls = document.querySelectorAll('[role="option"]');
    expect(optionEls.length).toBeGreaterThan(0);
    await expectNoAxeViolations(document.body);
  });

  it('已选路径：触发器 aria-expanded 切换，选中 option 标记 aria-selected', async () => {
    renderWithLocale(Cascader, {
      props: { treeData, defaultOpen: true, defaultValue: ['zj', 'hz', 'xh'], ariaLabel: 'Region' },
    });
    const combobox = document.querySelector('[role="combobox"]');
    expect(combobox?.getAttribute('aria-expanded')).toBe('true');
    const selected = document.querySelector('[role="option"][aria-selected="true"]');
    expect(selected).not.toBeNull();
    await expectNoAxeViolations(document.body);
  });

  // 内置可搜索（filterTreeNode）+ 打开：对齐 Semi renderInput，combobox 语义下移到触发器内
  // 搜索 <Input> 的原生 <input> 上（role=combobox + aria-expanded + aria-autocomplete=list），
  // 根容器不再是 combobox（避免嵌套双 combobox）。
  it('可搜索打开态：combobox 落在触发器内原生 input，root 非 combobox，无 axe violations', async () => {
    const { container } = renderWithLocale(Cascader, {
      props: { treeData, defaultOpen: true, filterTreeNode: true, ariaLabel: 'Region', placeholder: 'Select region' },
    });
    // combobox 现在是搜索 Input 的原生 input（.cd-input），而非根 .cd-cascader div。
    const combobox = container.querySelector('input.cd-input[role="combobox"]');
    expect(combobox).not.toBeNull();
    expect(combobox?.getAttribute('aria-expanded')).toBe('true');
    expect(combobox?.getAttribute('aria-autocomplete')).toBe('list');
    expect(combobox?.getAttribute('aria-controls')).toBeTruthy();
    // 根容器不再承载 combobox（语义已下移到 input）。
    const rootCombobox = container.querySelector('div.cd-cascader[role="combobox"]');
    expect(rootCombobox).toBeNull();
    await expectNoAxeViolations(container);
  });

  // 多选：触发器整体复用 TagInput（对齐 Semi renderTagInput）。选中路径以 tag 回显路径 label，
  // 触发器内是 .cd-tag-input（role=group），而非自绘 <Tag> 列表。
  it('多选：触发器为 TagInput 结构，选中路径以 tag 回显路径 label，无 axe violations', async () => {
    const { container } = renderWithLocale(Cascader, {
      props: {
        treeData,
        multiple: true,
        defaultValue: [['zj', 'hz', 'xh']],
        ariaLabel: 'Region',
        placeholder: 'Select region',
      },
    });
    // 触发器内是 TagInput（role=group），而非旧的自绘 tag 列表。
    const tagInput = container.querySelector('.cd-tag-input[role="group"]');
    expect(tagInput).not.toBeNull();
    // 选中路径以 tag 渲染，文本为整条路径 label（separator 连接）。
    const tag = container.querySelector('.cd-cascader-selection-tag');
    expect(tag).not.toBeNull();
    expect(tag?.textContent).toContain('West Lake');
    await expectNoAxeViolations(container);
  });

  // 多选 maxTagCount 折叠：超出显示 +N（由 TagInput 内建 .cd-tag-input-wrapper-n 渲染）。
  it('多选 maxTagCount：超出折叠为 +N（TagInput 内建），无 axe violations', async () => {
    const { container } = renderWithLocale(Cascader, {
      props: {
        treeData,
        multiple: true,
        maxTagCount: 1,
        defaultValue: [['zj', 'hz', 'xh'], ['js', 'nj']],
        ariaLabel: 'Region',
      },
    });
    const restN = container.querySelector('.cd-tag-input-wrapper-n');
    expect(restN).not.toBeNull();
    expect(restN?.textContent).toContain('+1');
    await expectNoAxeViolations(container);
  });

  // 回归：autoMergeValue 合并态删除叶子 tag。value 合并为父路径（[zj,hz]，代表其下 xh 全选），
  // 但 tag 按叶子展开显示（West Lake）。点该 tag 的关闭按钮，删除必须生效并回调 onChange。
  // 修复前 removeLeaf 在合并态 checkedBase（含父 key、不含叶子）上 delete(叶子) 会 miss → 删不掉。
  it('多选 autoMergeValue 合并态：删除叶子 tag 生效并回调 onChange', async () => {
    let changed: unknown = undefined;
    const { container } = renderWithLocale(Cascader, {
      props: {
        treeData,
        multiple: true,
        autoMergeValue: true,
        // 合并态：杭州(hz)父路径代表其唯一叶子 xh 全选；tag 展开显示 West Lake。
        defaultValue: [['zj', 'hz']],
        ariaLabel: 'Region',
        onChange: (v: unknown) => {
          changed = v;
        },
      },
    });
    // 合并态下 tag 仍按叶子展开：应有 1 个路径 tag（West Lake）。
    const tag = container.querySelector('.cd-cascader-selection-tag');
    expect(tag).not.toBeNull();
    expect(tag?.textContent).toContain('West Lake');
    // 点该 tag 的关闭按钮（TagInput 内 Tag 的 .cd-tag__close / [aria-label*=close] 等）。
    const closeBtn = container.querySelector(
      '.cd-cascader-selection-tag .cd-tag__close, .cd-cascader-selection-tag button, .cd-tag-input .cd-tag__close',
    ) as HTMLElement | null;
    expect(closeBtn).not.toBeNull();
    closeBtn?.click();
    // 删除必须生效：onChange 被调用，且删掉后不再包含该叶子（结果为空数组）。
    expect(changed).toBeDefined();
    expect(Array.isArray(changed) ? (changed as unknown[]).length : -1).toBe(0);
  });
});
