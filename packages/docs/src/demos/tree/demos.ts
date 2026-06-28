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
  entry('01-basic.svelte', '基础用法', '单选模式与可勾选（父子联动）+ 可搜索模式。'),
  entry('02-checkable.svelte', '可勾选', '父子联动（related，含半选）与父子独立（checkStrictly）两种勾选模式。'),
  entry('03-searchable.svelte', '可搜索过滤', '内置搜索命中高亮、自动展开祖先，以及自定义过滤谓词 filterTreeNode。'),
  entry('04-controlled.svelte', '受控展开与选中', '通过 expandedKeys / value 受控，外部按钮控制展开集与选中项。'),
  entry('05-async-line.svelte', '目录树与异步加载', '连接线 showLine + 禁用节点的目录树，以及展开时 loadData 异步拉取子节点。'),
  entry('BasicDemo.svelte', '完整示例', '连接线、手风琴、异步加载、虚拟滚动、拖拽排序、fieldNames 字段映射等。'),
];
