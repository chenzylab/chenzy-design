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
  entry('01-collapse.svelte', '折叠模式 - 默认', '通过 renderMode="collapse"（默认）来实现内容的折叠。'),
  entry('02-collapse-from.svelte', '折叠模式 - 方向', 'collapse 模式下支持 collapseFrom 设置折叠方向。'),
  entry('03-min-visible-items.svelte', '折叠模式 - 最小展示的数目', 'collapse 模式下支持 minVisibleItems 设置最小展示的数目。'),
  entry('04-scroll.svelte', '滚动模式', '通过 renderMode="scroll" 来使用滚动模式的折叠列表。'),
];
