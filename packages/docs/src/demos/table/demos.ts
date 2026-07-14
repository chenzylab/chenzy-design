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
  entry('07-jsx-render.svelte', '自定义渲染', '列 render 组合 Avatar / Tag / Button 等富内容。'),
  entry('03-row-selection.svelte', '行选择操作', '受控复选行选择，所有者行禁用复选框。'),
  entry('04-pagination.svelte', '带分页组件的表格', '客户端分页 + 列排序，受控当前页。'),
  entry('08-remote-data.svelte', '拉取远程数据', 'loading + 异步分页，受控 current 由回调驱动。'),
  entry('05-fixed-render.svelte', '固定列或表头', '左右固定列、横向滚动，状态列 Tag 自定义渲染。'),
  entry('02-sort-filter.svelte', '带排序和过滤功能的表头', '列头三态排序，部门列漏斗多选筛选。'),
  entry('09-sort-filter-header.svelte', '排序与筛选并存', '同一列同时开启 sorter 与 filters。'),
  entry('12-custom-filter.svelte', '自定义表头筛选', '单选筛选（filterMultiple:false）。'),
  entry('13-filter-confirm.svelte', '筛选确认模式', 'filterConfirmMode=confirm，点确定才生效。'),
  entry('10-expandable.svelte', '可以展开的表格', 'expandable.expandedRowRender 渲染展开行详情。'),
  entry('11-tree.svelte', '树形数据展示', 'dataSource 含 children，行内展开三角 + 缩进。'),
  entry('14-row-cell-events.svelte', '自定义行或单元格事件以及属性', 'onRow 返回 className / style / onClick。'),
  entry('15-stripe.svelte', '实现斑马纹样式', '用 onRow 给偶数行返回背景色。'),
  entry('16-header-style.svelte', '实现表头样式定制', 'headerStyle 统一定制所有表头单元格。'),
  entry('17-cell-hover.svelte', '实现单元格 Hover 样式定制', 'CSS 覆盖为单个单元格高亮。'),
  entry('18-ellipsis.svelte', '单元格缩略', 'column.ellipsis 超长文本省略号截断。'),
  entry('19-resizable.svelte', '可伸缩列', 'column.resizable + width 拖拽改列宽。'),
  entry('06-group-collapse.svelte', '可折叠分组', '按部门分组，点击分组标题行折叠/展开。'),
  entry('20-group.svelte', '表格分组', 'groupBy + renderGroupSection 自定义分组表头。'),
  entry('21-virtualized.svelte', '虚拟化表格', 'virtualized + height + rowHeight，承载 200+ 行。'),
  entry('22-infinite-scroll.svelte', '无限滚动', 'onReachBottom 触底追加数据。'),
  entry('24-dynamic.svelte', '受控的动态表格', '运行时增删数据行，响应式驱动重渲染。'),
  entry('25-full-custom.svelte', '完全自定义渲染', 'render snippet 卡片式整格内容。'),
  entry('26-header-group.svelte', '表头合并', 'column.children 定义子列，父列 title 横跨叶子列。'),
  entry('23-span-cell.svelte', '行列合并', 'column.onCell 返回 colSpan / rowSpan 合并单元格。'),
];
