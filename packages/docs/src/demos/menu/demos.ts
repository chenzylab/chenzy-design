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
  entry('BasicDemo.svelte', '基础用法', '包含 inline/vertical/horizontal 模式、多选、折叠、分组、导航用途。'),
  entry('01-basic.svelte', '垂直菜单', 'inline 模式内联展开子菜单，点击选中。'),
  entry('02-horizontal.svelte', '水平菜单', 'horizontal 模式横向菜单栏，hover 弹出子菜单。'),
];
