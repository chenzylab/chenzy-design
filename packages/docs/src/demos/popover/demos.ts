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
  entry('01-basic.svelte', '基础使用', '将触发器作为 children 用 Popover 包裹，浮层内容通过 content 传入，可承载比 Tooltip 更复杂的内容。'),
  entry('02-position.svelte', '弹出位置', '通过 position 设置浮层弹出方向，共支持 12 个方位。'),
  entry('03-controlled.svelte', '受控显示', "设置 trigger='custom'，此场景下 Popover 的显示与否完全受 visible 控制。"),
  entry('04-condition.svelte', 'condition 条件触发', 'condition={false} 时不响应 hover/click/focus 触发（custom 不受影响）。'),
  entry('05-arrow.svelte', '显示小三角', '通过 showArrow 让 Popover 展示一个指向触发器的小三角，此模式下浮层有默认样式。'),
  entry('06-arrow-point-at-center.svelte', '指向元素中心', 'showArrow=true 下传入 arrowPointAtCenter 使小三角始终指向元素中心。'),
  entry('07-custom-bg.svelte', '设置浮层背景色', '通过 style 与 arrowStyle 定制浮层与小三角的背景色、边框色。'),
  entry('08-initial-focus.svelte', '初始化弹出层焦点位置', 'click 触发的 dialog 模式打开后焦点自动进入浮层首个可交互元素（焦点陷阱）。'),
];
