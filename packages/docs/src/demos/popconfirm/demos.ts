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
  entry('02-types.svelte', '类型搭配', '通过 type（default/warning/danger）搭配出不同风格的气泡式确认框。'),
  entry('03-async.svelte', '延时关闭', 'onConfirm 返回 Promise 时确认按钮自动 loading，resolve 后关闭、reject 保持打开。'),
  entry('04-buttons.svelte', '按钮定制', '自定义确认/取消文案与类型、隐藏取消按钮、透传按钮额外属性。'),
];
