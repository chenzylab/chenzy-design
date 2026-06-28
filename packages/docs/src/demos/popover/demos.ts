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
  entry('01-basic.svelte', '基础用法', '点击触发气泡卡片，支持标题与内容区，适合承载比 Tooltip 更丰富的信息。'),
  entry('02-position.svelte', '弹出方向', '支持上下左右四个主方向，通过 position 控制。'),
  entry('03-rich-content.svelte', '富内容', '通过 contentSlot 插槽放置任意内容，可在浮层内嵌按钮等交互元素。'),
];
