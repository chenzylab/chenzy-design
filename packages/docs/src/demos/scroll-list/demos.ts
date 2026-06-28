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
  entry('01-basic.svelte', '基础滚动列表', '滚动或键盘选择列表项，支持禁用项'),
  entry('02-columns.svelte', '多列联动', '多列滚动选择器，值为各列组合数组'),
  entry('03-cyclic.svelte', '循环滚动', 'cyclic 到头尾可继续翻动'),
  entry('04-controlled-render.svelte', '受控值 + 自定义渲染', 'value 受控，renderItem 自定义项内容'),
  entry('05-date-picker.svelte', '日期选择器', '年/月/日多列，月日循环滚动'),
];
