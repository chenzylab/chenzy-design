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
  entry('01-basic.svelte', '基本用法', '最简单的用法，支持 default / small 两种尺寸，也支持传入 number 自定义尺寸。'),
  entry('02-half.svelte', '半星', 'allowHalf 支持选择半星，并支持展示除 0.5 以外的小数。'),
  entry('03-readonly.svelte', '只读', 'disabled 将无法进行交互。'),
  entry('04-clear.svelte', '点击清除', 'allowClear 允许再次点击时清除数值，默认为 true。'),
  entry('05-tooltips.svelte', '文案展现', '给评分组件加上文案展示。'),
  entry('06-custom.svelte', '自定义', '自定义评分字符、个数及尺寸；自定义尺寸需配合自定义字符才生效。'),
];
