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
  entry('01-basic.svelte', '基本用法', '通过 size 设置尺寸（large/default/small），header/footer 自定义头尾，bordered 加外框。'),
  entry('02-template.svelte', '模板用法', 'List.Item 内置 header / main / extra 三段结构，align 控制头与主体的垂直对齐。'),
  entry('03-layout.svelte', '布局', 'layout=horizontal 让列表项横向排列，split 时用右边框分隔。'),
  entry('04-grid.svelte', '栅格列表', 'grid 的 span 设置每项占格数（24 栅格），gutter 控制间距。'),
  entry('05-grid-responsive.svelte', '响应式栅格列表', 'grid 的 xs/sm/md/lg/xl/xxl 按断点设置占格数，响应尺寸与 Grid 一致。'),
  entry('06-load-more.svelte', '加载更多', '点击后先追加骨架占位行，请求返回再替换为真实数据；已展示项始终显示真内容，只有新增占位行显示 Skeleton（对齐 Semi）。'),
  entry('07-infinite-scroll.svelte', '滚动加载', '滚动到底自动加载下一批（加载中底部显示 Spin），每到第 4 的倍数批次改为出现「显示更多」按钮（对齐 Semi 交互规范）。'),
  entry('08-virtualized.svelte', '滚动加载无限长列表', '组合 VirtualList 只渲染视口内行，支撑万级数据（等价 Semi 集成 react-virtualized）。'),
  entry('09-drag-sort.svelte', '拖拽排序', '用原生 HTML5 draggable 事件实现列表项拖拽重排（等价 Semi 集成 dnd-kit）。'),
  entry('10-pagination.svelte', '带分页器', '组合 Pagination 对数据切片，实现分页列表。'),
  entry('11-filter.svelte', '带筛选器', '组合 Input 作为 header，对列表数据实时过滤。'),
  entry('12-add-remove.svelte', '添加删除项', '操作 dataSource 数组动态增删列表项。'),
  entry('13-select.svelte', '单选或多选', '组合 CheckboxGroup / RadioGroup 将 List 增强为列表选择器。'),
  entry('14-keyboard.svelte', '响应键盘事件', '监听 ↑↓ 方向键在列表项间移动高亮。'),
];
