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
  entry('01-basic.svelte', '基本用法', 'audioUrl 支持字符串/对象/字符串数组/对象数组四种形态。'),
  entry('02-hide-toolbar.svelte', '隐藏工具栏', 'showToolbar={false} 隐藏音量/快退/快进/倍速/刷新。'),
  entry('03-theme.svelte', '主题', 'theme="light" 浅色主题（默认 dark），配合播放列表演示。'),
];
