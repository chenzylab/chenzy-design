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
  entry('01-basic.svelte', '基础树形选择', '在树形结构中选择节点，支持搜索过滤与清空'),
  entry('02-multiple.svelte', '多选与折叠', 'multiple 开启 checkbox 多选与父子联动，maxTagCount 折叠超出标签'),
  entry('03-leaf-only.svelte', '仅选叶子节点', 'leafOnly 让父节点只展开不选中，仅叶子可作为最终值'),
  entry('04-disabled.svelte', '禁用状态', '禁用单个节点（disabled 字段）或整体禁用选择器'),
  entry('05-prefix-clear.svelte', '前缀与清除', '自定义 prefix 图标、large 尺寸、默认展开指定节点并可一键清除'),
];
