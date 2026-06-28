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
  entry('01-line.svelte', '线形进度条', '默认线形（type="line"），支持 success / error 状态，small 尺寸。'),
  entry('02-circle.svelte', '环形与仪表盘', 'type="circle" 渲染圆形进度，type="dashboard" 渲染仪表盘形态，percent=100 配合 successWhenFull 自动显示完成状态。'),
];
