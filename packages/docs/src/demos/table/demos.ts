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
  entry('01-basic.svelte', '基本表格'),
  entry('03-jsx-render.svelte', 'JSX 写法'),
  entry('02-row-selection.svelte', '行选择操作'),
  entry('05-custom-render.svelte', '自定义渲染'),
  entry('04-pagination.svelte', '带分页组件的表格'),
  entry('06-remote-data.svelte', '拉取远程数据'),
  entry('07-fixed.svelte', '固定列或表头'),
  entry('08-sort-filter-header.svelte', '带排序和过滤功能的表头'),
  entry('09-show-sort-tip.svelte', '排序提示'),
  entry('10-custom-header-filter.svelte', '自定义表头筛选'),
  entry('11-custom-filter-dropdown.svelte', '自定义筛选器'),
  entry('12-filter-confirm.svelte', '筛选确认模式'),
  entry('13-custom-filter-item.svelte', '自定义筛选项渲染'),
  entry('14-expandable.svelte', '可以展开的表格'),
  entry('31-expandable-column.svelte', '展开按钮单独成列'),
  entry('15-tree.svelte', '树形数据展示'),
  entry('33-tree-select.svelte', '树形选择'),
  entry('32-tree-check-relation.svelte', '树形选择关联'),
  entry('19-row-cell-events.svelte', '自定义行或单元格事件以及属性'),
  entry('20-stripe.svelte', '实现斑马纹样式'),
  entry('21-header-style.svelte', '实现表头样式定制'),
  entry('22-cell-hover.svelte', '实现单元格 Hover 样式定制'),
  entry('23-ellipsis.svelte', '单元格缩略'),
  entry('24-ellipsis-tooltip.svelte', '单元格缩略 Tooltip'),
  entry('25-resizable.svelte', '可伸缩列'),
  entry('26-resizable-advanced.svelte', '进阶的伸缩列'),
  entry('27-group.svelte', '表格分组'),
  entry('28-virtualized.svelte', '虚拟化表格'),
  entry('29-infinite-scroll.svelte', '无限滚动'),
  entry('34-drag-sort.svelte', '拖拽排序'),
  entry('30-dynamic.svelte', '受控的动态表格'),
  entry('18-use-full-render.svelte', '完全自定义渲染'),
  entry('17-header-group.svelte', '表头合并'),
  entry('16-span-cell.svelte', '行列合并'),
];
