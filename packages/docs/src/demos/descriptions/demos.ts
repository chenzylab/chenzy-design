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
  entry('01-basic.svelte', '基础用法', '传入 data 数组即可渲染描述列表，默认三列水平布局。'),
  entry('02-bordered.svelte', '带边框', '设置 bordered 添加边框，title 显示标题，适合详情页信息展示。'),
  entry('03-layout.svelte', '方向布局', '通过 direction 切换水平/垂直两种展示方向。'),
  entry('04-declarative.svelte', '声明式用法', '不传 data，直接用 Descriptions.Item 子组件，span 支持跨列。'),
];
