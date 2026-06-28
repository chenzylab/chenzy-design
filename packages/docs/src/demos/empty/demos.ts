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
  entry('01-basic.svelte', '基础用法', '无参数时渲染默认空状态插画与文案。'),
  entry('02-preset.svelte', '内置预设', '通过 image 切换 noData / noResult / error 等内置预设插画。'),
  entry('03-action.svelte', '带操作', '通过 children 插槽添加操作按钮，引导用户下一步行动。'),
];
