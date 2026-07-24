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
  entry('01-basic.svelte', '基本用法'),
  entry('02-render.svelte', '自定义候选项渲染'),
  entry('03-remote.svelte', '远程搜索'),
  entry('04-size.svelte', '尺寸'),
  entry('05-position.svelte', '下拉菜单的位置'),
  entry('06-disabled.svelte', '禁用'),
  entry('07-status.svelte', '校验状态'),
  entry('08-empty.svelte', '自定义空内容'),
];
