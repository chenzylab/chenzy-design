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
  entry('02-placement.svelte', '弹出位置', '支持上下左右及各角落共 8 个方位，通过 placement 控制。'),
  entry('03-theme.svelte', '主题', '支持 dark（深色，默认）与 light（浅色）两种主题。'),
  entry('04-status.svelte', '状态', '设置 status 在提示内容前显示对应语义图标，适合警告或错误提示。'),
];
