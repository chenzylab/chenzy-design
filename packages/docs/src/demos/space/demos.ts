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
  entry('01-horizontal.svelte', '水平间距', '默认水平方向排列子元素，自动添加统一间距。'),
  entry('02-spacing.svelte', '间距大小', '通过 spacing 设置 tight / medium / loose 三档间距。'),
  entry('03-vertical.svelte', '垂直间距', '设置 direction="vertical" 纵向排列，align 控制对齐方式。'),
];
