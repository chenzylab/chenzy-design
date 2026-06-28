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
];
