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
  entry('01-basic.svelte', '基本用法', '通过 bind:value 双向绑定开关状态。'),
  entry('02-size.svelte', '尺寸', '提供 large / default / small 三种尺寸。'),
  entry('03-text.svelte', '带文字', '通过 checkedChildren / uncheckedChildren 显示开关文案。'),
  entry('04-state.svelte', '状态', '支持禁用与加载中状态。'),
  entry('05-loading.svelte', '加载中', 'loading 锁定交互并展示 spinner。'),
  entry('06-text-outside.svelte', '外部文本(推荐)', '相比内嵌文字,更推荐将说明文本放在 Switch 外部。'),
  entry('07-controlled.svelte', '受控', 'value 完全受控,配合 onChange 使用。'),
];
