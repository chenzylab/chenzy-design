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
  entry('BasicDemo.svelte', '基础用法', '支持 danger/warning 类型、hover 触发、异步确认、自定义容器。'),
  entry('01-basic.svelte', '基础确认气泡', '点击触发确认气泡，支持 danger/warning 类型和不同弹出方向。'),
  entry('02-positions.svelte', '弹出位置', '通过 position（placement 别名）控制 12 方位，碰撞自动避让。'),
  entry('03-buttons.svelte', '按钮定制', '自定义确认/取消文案、okType 危险确认、按钮额外属性透传、隐藏取消按钮。'),
  entry('04-async.svelte', '异步确认', 'onConfirm 返回 Promise 时确认按钮 loading：resolve 关闭、reject 保持打开可重试。'),
  entry('05-controlled.svelte', '受控与自定义内容', 'open + onOpenChange 受控显隐，titleSnippet/contentSnippet 渲染富文本。'),
];
