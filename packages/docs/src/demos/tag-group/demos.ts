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
  entry('01-basic.svelte', '数据驱动', '通过 tagList 数据驱动渲染一组标签。'),
  entry(
    '02-max-count.svelte',
    '折叠 +N',
    '设置 maxTagCount 后超出部分折叠为「+N」标签，hover 在 Popover 弹层展示剩余项。',
  ),
];
