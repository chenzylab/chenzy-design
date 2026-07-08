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
  entry('01-basic.svelte', '基础用法', '平铺列表穿梭框，支持搜索过滤。'),
  entry('02-group.svelte', '分组数据', "type='groupList'：源数据按分组渲染分组头与计数。"),
  entry(
    '03-custom-render.svelte',
    '自定义渲染 / 禁用项',
    'renderSourceItem / renderSelectedItem 自定义行内容，disabled 标记不可迁移项，onSelect / onDeselect 跟踪勾选。',
  ),
  entry(
    '04-tree-path.svelte',
    '树状面板 / 显示路径',
    "type='treeList' 树状源面板，勾父连带勾叶；showPath 让已选项显示完整路径。",
  ),
  entry(
    '05-pagination.svelte',
    '分页 / 自定义空态',
    'pagination 让源面板分页，emptyContent 自定义两侧空态文案。',
  ),
  entry(
    '06-search-method.svelte',
    '命令式搜索',
    '通过 bind:this 获取实例，调用 search(value) 过滤左侧。',
  ),
  entry(
    '07-tree-expand.svelte',
    '树默认收起',
    'treeProps.expandAll=false 初始收起子节点。',
  ),
  entry(
    '08-tree-filter.svelte',
    '树自定义搜索',
    'treeProps.filterTreeNode 自定义树搜索逻辑。',
  ),
  entry('BasicDemo.svelte', '完整示例', '分组、树状面板、单向迁移、虚拟化、拖拽重排、远程搜索等高级用法。'),
];
