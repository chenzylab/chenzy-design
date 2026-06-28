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
  entry('01-basic.svelte', '基础栅格', '24 列栅格系统，通过 span 指定列宽，gutter 控制列间距。'),
  entry('02-gutter.svelte', '行列间距', 'gutter 传 [水平, 垂直] 数组可同时设置行列间距。'),
  entry('03-offset.svelte', '列偏移', '通过 offset 向右偏移指定列数，实现灵活的留白布局。'),
  entry('04-responsive.svelte', '响应式布局', '通过 xs/sm/md/lg/xl/xxl 断点属性实现移动端到桌面端的自适应。'),
];
