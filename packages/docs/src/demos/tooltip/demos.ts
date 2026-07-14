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
  entry('01-basic.svelte', '基础用法', '悬停触发元素时展示 content 提示文字，默认出现在顶部。'),
  entry('02-placement.svelte', '位置', '通过 position 配置 12 个弹出方位与对齐位置。'),
  entry('03-arrow-point-at-center.svelte', '指向元素中心', 'arrowPointAtCenter（默认 true）时小三角始终指向元素中心；设为 false 则浮层与元素边缘对齐。'),
  entry('04-trigger.svelte', '触发时机', '通过 trigger 配置 hover/focus/click/contextMenu/custom；contextMenu 右键触发，custom 配合 visible 完全受控。'),
  entry('05-condition.svelte', 'condition 条件触发', 'condition={false} 时不响应 hover/click/focus 触发（custom 不受影响）。'),
  entry('06-custom-style.svelte', '覆盖特定样式', '通过 class、style 为浮层配置特定样式，例如覆盖默认的 max-width。'),
  entry('07-get-popup-container.svelte', '渲染至指定 DOM', '传入 getPopupContainer，浮层渲染至该函数返回的 DOM 中；非 body 容器需设 position: relative。'),
  entry('08-with-popconfirm.svelte', '搭配 Popconfirm 使用', 'Tooltip 与 Popconfirm/Popover 嵌套时，需在中间加一层 span 隔离事件劫持，避免外层 trigger 失效。'),
  entry('09-ellipsis.svelte', '仅内容超出时展示', '用 Typography 的 ellipsis.showTooltip，仅当内容宽度超出时才展示 Tooltip，无需自行判断。'),
  entry('10-children-types.svelte', 'children 类型', 'Tooltip 需将事件与定位应用到 children，故 children 应能承载事件、可被定位：真实 DOM 节点或可透传属性的组件。'),
];
