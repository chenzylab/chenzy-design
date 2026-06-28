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
  entry('01-basic.svelte', '基础用法', '带排序、行选择、斑马纹的基础表格。'),
  entry('02-sort-filter.svelte', '排序与筛选', '列头点击三态排序，部门列漏斗多选筛选数据。'),
  entry('03-row-selection.svelte', '行选择', '受控复选行选择，所有者行禁用复选框。'),
  entry('04-pagination.svelte', '分页', '客户端分页 + 列排序，受控当前页。'),
  entry('05-fixed-render.svelte', '固定列与自定义渲染', '左右固定列、横向滚动，状态列用 Tag 自定义渲染。'),
  entry('BasicDemo.svelte', '完整示例', '行展开、固定列、列筛选、列宽拖拽、树形数据、虚拟滚动等高级用法。'),
];
