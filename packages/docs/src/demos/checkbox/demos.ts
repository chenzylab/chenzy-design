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

export const demos: DemoEntry[] = [
  entry('01-basic.svelte', '基础用法', '单个复选框，支持受控与非受控，及禁用状态。'),
  entry('02-group.svelte', '复选框组', 'CheckboxGroup 以数据驱动方式渲染多选项，onChange 回调返回选中值数组。'),
  entry('03-card.svelte', '卡片形态', '设置 type="card" 以整卡点击区渲染，extra 显示辅助说明，适合套餐选择场景。'),
  entry('04-extra.svelte', '辅助文本', 'extra 传入副文本，经 aria-describedby 关联，点击区域含辅助文本，过长自动换行。'),
  entry('05-disabled.svelte', '禁用', 'disabled 禁用复选框，选中/未选中均可禁用，禁用时不可聚焦与切换。'),
  entry('06-indeterminate.svelte', '全选与半选', 'indeterminate 表达部分选中态，配合 checkAll 实现全选/清空联动。'),
  entry('07-controlled.svelte', '受控', '外部持有 checked/disabled，按钮编程式联动切换选中与禁用。'),
  entry('08-direction.svelte', '排列方向', 'direction 控制 CheckboxGroup 内布局，vertical（默认）或 horizontal。'),
  entry('09-pure-card.svelte', '纯卡片形态', 'type="pureCard" 带背景但无 checkbox 框的纯卡片样式。'),
  entry('10-grid.svelte', '配合 grid 布局', 'CheckboxGroup 内嵌 Checkbox 与 Row/Col 栅格组合，实现灵活布局。'),
];
