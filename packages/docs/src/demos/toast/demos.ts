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
  entry('01-basic.svelte', '基础用法', '五种类型：info / success / warning / error / loading，支持常驻。'),
  entry('02-position.svelte', '弹出位置', '6 方位独立纵向堆叠：topLeft / top / topRight / bottomLeft / bottom / bottomRight。'),
  entry('03-duration.svelte', '时长与手动关闭', '自定义 duration、0 持久、按 id 手动关闭、隐藏关闭按钮、清空全部。'),
  entry('04-promise.svelte', 'promise 与同 id 更新', 'Toast.promise 自动 pending→resolve/reject 切文案；Toast.update 原地更新同一条。'),
  entry('05-custom.svelte', '自定义内容', '自定义图标 snippet、隐藏图标、深色主题、限制内容区最大宽度。'),
];
