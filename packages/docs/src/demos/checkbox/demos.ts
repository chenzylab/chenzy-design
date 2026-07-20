import type { Component } from 'svelte';

const mods = import.meta.glob<{ default: Component }>('./*.svelte', { eager: true });
const sources = import.meta.glob('./*.svelte', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

export interface DemoEntry {
  title: string;
  description?: string;
  component: Component;
  code: string;
}

function entry(file: string, title: string, description?: string): DemoEntry {
  return {
    title,
    description,
    component: mods[`./${file}`].default,
    code: (sources[`./${file}`] as string).trim(),
  };
}

// 章节顺序逐字对齐 Semi 官网（semi.design/zh-CN/input/checkbox）：
//   基本用法(3块) → 禁用 → JSX 声明组 → 数组 options 组 → 水平排列 → 受控 →
//   全选(indeterminate) → 卡片样式 → 纯卡片样式 → 配合 grid 布局。
export const demos: DemoEntry[] = [
  entry('01-basic.svelte', '基本用法', 'Checkbox 单个使用，可通过 defaultChecked / checked 控制是否勾选。'),
  entry('02-basic-checked.svelte', '默认选中', '通过 defaultChecked 设置初始选中。'),
  entry('03-basic-extra.svelte', '带辅助文本', '通过 extra 传入辅助文本，可能换行。'),
  entry('04-disabled.svelte', '禁用', '通过设置 disabled 属性，禁用 Checkbox。'),
  entry('05-jsx-group.svelte', 'JSX 方式声明 Checkbox 组', '在 CheckboxGroup 内部放置 Checkbox 元素，用 defaultValue / value 控制一组选中。'),
  entry('06-options.svelte', '数组方式声明 Checkbox 组', '将数组通过 options 属性直接传入 CheckboxGroup 生成 Checkbox 组。'),
  entry('07-direction.svelte', '水平排列', '通过设置 direction 为 horizontal 或 vertical 调整 CheckboxGroup 内布局。'),
  entry('08-controlled.svelte', '受控', '联动 checkbox：外部持有 checked / disabled，按钮编程式切换。'),
  entry('09-check-all.svelte', '全选', '用 indeterminate 属性实现全选/半选效果。'),
  entry('10-card.svelte', '卡片样式', '给 CheckboxGroup 设置 type="card" 实现带有背景的卡片样式。'),
  entry('11-pure-card.svelte', '无 checkbox 的纯卡片样式', 'type="pureCard" 实现带有背景且无 checkbox 的纯卡片样式。'),
  entry('12-grid.svelte', '配合 grid 布局', 'CheckboxGroup 内嵌 Checkbox 与 Row/Col 一起使用，实现灵活布局。'),
];
