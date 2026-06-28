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
  entry('01-basic.svelte', '基础回到顶部', '滚动容器超过阈值后显示按钮，点击平滑滚回顶部'),
  entry('02-threshold-duration.svelte', '自定义阈值与时长', '用 visibilityHeight 调低显示阈值，duration 调慢回顶动画'),
  entry('03-custom-content.svelte', '自定义按钮内容', '用 children 与 class 完全自定义按钮的文字与样式'),
  entry('04-callbacks.svelte', '监听显隐与到顶', '通过 onVisibleChange / onScrollEnd 回调观察按钮显隐与回顶完成'),
];
