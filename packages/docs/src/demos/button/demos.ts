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
  entry('01-type.svelte', '按钮类型', '支持 primary / secondary / tertiary / warning / danger 五种类型。'),
  entry('02-theme.svelte', '按钮主题', 'solid / light / borderless / outline 四种主题样式。'),
  entry('03-size.svelte', '尺寸', '提供 large / default / small 三种尺寸。'),
  entry('04-state.svelte', '状态', '支持禁用、加载中、块级（block）等状态。'),
];
