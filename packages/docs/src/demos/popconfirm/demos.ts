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
  entry('01-basic.svelte', '基础使用', '点击触发元素弹出确认气泡，内置确认/取消按钮，比 Modal 更轻量。'),
  entry('02-types.svelte', '类型搭配', '气泡确认框本身无 type 分级 prop，通过 icon 颜色与 okType 搭配出不同风格。'),
  entry('03-async.svelte', '延时关闭', 'onConfirm/onCancel 返回 Promise 时对应按钮自动 loading，resolve 后关闭、reject 保持打开。'),
  entry('04-focus.svelte', '初始化弹出层焦点', 'okButtonProps/cancelButtonProps 传 autoFocus，或 content 函数用 initialFocusRef 绑定，打开时自动聚焦。'),
  entry('05-close-icon.svelte', '关闭按钮', 'showCloseIcon 默认 true 展示右上角关闭按钮，设为 false 可隐藏。'),
  entry('06-arrow.svelte', '箭头', 'showArrow 显示指向触发元素的小三角，arrowPointAtCenter 令三角指向元素中心。'),
];
