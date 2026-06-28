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
  entry('01-basic.svelte', '基础列表', '通过 dataSource 传入数据，renderItem snippet 控制每行渲染，List.Item.Meta 提供标题/描述结构。'),
  entry('02-header-footer.svelte', '头部与尾部', '通过 header / footer 添加列表头尾，支持字符串或 Snippet。'),
  entry('03-grid.svelte', '网格列表', '设置 grid 属性可将列表渲染为网格布局，column 指定列数，gutter 控制间距。'),
];
