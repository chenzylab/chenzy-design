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
  entry('01-basic.svelte', '基础溢出列表', '容器宽度不足时自动将溢出项折叠为 +N 标记'),
  entry('02-collapse-from.svelte', '折叠方向', 'collapseFrom 控制从尾部（end）或头部（start）折叠'),
  entry('03-custom-overflow.svelte', '自定义溢出渲染', '用 overflow snippet 把 +N 渲染为可展开溢出项的下拉菜单'),
  entry('04-container-widths.svelte', '不同容器宽度', '同一组数据在多种容器宽度下的折叠结果，首项恒可见'),
  entry('05-with-tags.svelte', '配合标签与头像', '搭配 Tag 标签组与 Avatar 头像组实现溢出折叠'),
];
