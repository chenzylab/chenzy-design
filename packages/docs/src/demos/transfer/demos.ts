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
  entry('01-basic.svelte', '基本使用', '平铺列表穿梭框，支持搜索过滤；onChange 回传 (values, items) 两参。'),
  entry('02-group.svelte', '分组', "type='groupList'：源数据按分组渲染分组标题。"),
  entry(
    '03-custom-filter-render.svelte',
    '自定义筛选逻辑 / 自定义选项渲染',
    'filter 传函数自定义匹配，renderSourceItem 自定义左侧条目内容。',
  ),
  entry('04-disabled.svelte', '禁用', '整体 disabled 与单项 item.disabled 两种禁用。'),
  entry('05-draggable.svelte', '拖拽排序', 'draggable：右侧已选列鼠标拖拽重排，新顺序经 onChange 通知。'),
  entry('06-pagination.svelte', '左侧分页', 'pagination.pageSize 让源面板分页（非受控页码）。'),
  entry(
    '07-pagination-controlled.svelte',
    '左侧分页 + 受控页码',
    'pagination.currentPage 受控页码，由外部 state 驱动翻页。',
  ),
  entry(
    '08-draggable-custom-item.svelte',
    '拖拽 + 自定义已选项渲染',
    'draggable 配合 renderSelectedItem 自定义右侧条目内容。',
  ),
  entry('09-custom-header.svelte', '自定义渲染面板头部信息', 'renderSourceHeader / renderSelectedHeader 自定义两侧头部。'),
  entry('10-fully-custom.svelte', '完全自定义渲染', 'renderSourcePanel / renderSelectedPanel 完全接管两侧面板。'),
  entry(
    '11-fully-custom-draggable.svelte',
    '完全自定义渲染 + 拖拽排序',
    'renderSelectedPanel 内自实现 HTML5 拖拽，经 onSortEnd 上报新顺序。',
  ),
  entry('12-tree.svelte', '树穿梭框', "type='treeList' 内嵌复用 Tree 组件，仅叶子迁移；showPath 显示完整路径。"),
  entry(
    '13-tree-leaf-count.svelte',
    '树穿梭框自定义头部显示叶子节点数量',
    'renderSourceHeader 的 leafOnlyNum 显示可选叶子数量。',
  ),
];
